import {
  BadRequestException,
  ConsoleLogger,
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { User, UserRole } from '@sisman/prisma';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UsersService } from 'src/modules/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthRegisterAuthorizationTokenDTO } from './dto/auth-register-authorization-token.dto';
import { AuthLoginAuthorizationTokenDTO } from './dto/auth-login-authorization-token.dto';
import { MetricsService } from '../observability/metrics.service'; // Ajuste o caminho
import { LogLoginService } from '../log-login/log-login.service';
import { Request as RequestExpress } from 'express'; // <-- Importe Request
import { read } from 'fs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly issuer = 'login';
  private readonly audience = 'users';
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly mailer: MailerService,
    private readonly metricsService: MetricsService, // Injete o serviço de métricas
    private readonly logLoginService: LogLoginService, // Injete o serviço de métricas
  ) {}



  createToken(user: User, roles: UserRole[] = []) {
    this.logger.log(`Criando token para o usuário ${user.name}`);
    return {
      access_token: this.jwtService.sign(
        {
          id: user.id,
          login: user.login,
          name: user.name,
          email: user.email,
          roles: roles.map((role) => role.userRoletypeId),
        },
        {
          expiresIn: 1*60*60*24, //in seconds (24hs)
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
      roles: roles.map((role) => role.userRoletypeId),
      id: user.id,
      //implementar a chave expires_in baseado no valor da assinatura já informado
      expires_in: 1*60*60*24, //valor em segundos (corresponde a 24hs)
    };
  }

  //não há necessidade de implementar refresh_token uma vez que o fluxo convencional já utiliza um token para fornecer o access_token, sempre que receber o token correto pode retornar o access_token que vai poder ser utilizado por 24hs

  checkToken(token: string) {
    this.logger.log(`Verificando token para retornar o payload`);
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (e) {
      throw new UnauthorizedException(`Token inválido!`);
    }
  }

  isValidToken(token: string) {
    this.logger.log(`Verificando token para retornar se é válido`);
    try {
      this.checkToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async loginAuthorizationToken(
    data: AuthLoginAuthorizationTokenDTO,
    request: RequestExpress,
  ) {
    this.logger.log(
      `Iniciando o processo de login ou cadastro via Token de autorização`,
    );
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];
    let userId: number | null = null;
    let loginSuccess = false;

    try {
      const token = this.jwtService.verify(data.token, {
        secret: process.env.AUTHORIZATION_JWT_SECRET,
      });

      if (!token) {
        throw new UnauthorizedException(`Token inválido!`);
      }

      if (!token.email || !token.login) {
        throw new UnauthorizedException(`Token inválido!`);
      }

      const user: User = token.login
        ? await this.prisma.user.findFirst({
            where: { login: token.login },
          })
        : await this.prisma.user.findFirst({
            where: { email: token.email },
          });

      if (!user) {
        return this.register(
          {
            name: token.name,
            email: token.email,
            login: token.login,
            image: token.image,
          },
          request,
        );
      }

      //atualizar foto se for diferente a que está chegando
      if (user.image !== token.image) {
        await this.updateImage(user, token.image);
      }

      // Se chegou aqui, a validação foi bem-sucedida
      userId = user.id;
      loginSuccess = true;

      // >>> Incrementa o contador de login BEM-SUCEDIDO AQUI <<<
      this.metricsService.userLoginCounter.inc(); // Pode adicionar labels aqui se definiu algum

      const roles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
      });

      return this.createToken(user, roles);
    } catch (error) {
      // Se o erro não for Unauthorized, é algo inesperado, relance
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
      // Se for Unauthorized, já tratamos acima (loginSuccess = false)
      throw error; // Relança para o NestJS tratar e retornar 401
    } finally {
      // SEMPRE registra a tentativa no banco de dados, independente do sucesso
      if (userId) {
        // Só registra se conseguimos identificar o usuário
        // Não use await aqui para não bloquear a resposta - "fire-and-forget"
        this.logLoginService
          .recordLoginAttempt({
            userId: userId,
            ipAddress: ipAddress,
            userAgent: userAgent,
            successful: loginSuccess,
          })
          .catch((logError) => {
            // Log interno caso a gravação do histórico falhe
            console.error(
              'Failed background task: recordLoginAttempt',
              logError,
            );
          });
      } else if (!loginSuccess) {
        // Opcional: Registrar tentativas com email inválido (sem userId)
        // Poderia ter um campo 'attemptedEmail' na tabela LoginHistory
        // console.warn(
        //   `Failed login attempt for non-existent email: ${authLoginDto.email} from IP: ${ipAddress}`,
        // );
      }
    }
  }

  async register(data: AuthRegisterDTO, request: RequestExpress) {
    this.logger.log(`Realizando o cadastro do usuário`);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    let userId: number | null = null;
    let loginSuccess = false;
    try {
      if (await this.userService.existsEmail(data.email) || await this.userService.existsLogin(data.login)) {
        throw new BadRequestException(`E-mail or login already in use!`);
      }

      const user = await this.userService.create(data);
      // Se chegou aqui, a criação foi bem-sucedida
      userId = user.id;
      loginSuccess = true;

      // >>> Incrementa o contador de login BEM-SUCEDIDO AQUI <<<
      this.metricsService.userLoginCounter.inc(); // Pode adicionar labels aqui se definiu algum
      return this.createToken(user);
    } catch (error) {
      // Se o erro não for Unauthorized, é algo inesperado, relance
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
      // Se for Unauthorized, já tratamos acima (loginSuccess = false)
      throw error; // Relança para o NestJS tratar e retornar 401
    } finally {
      // SEMPRE registra a tentativa no banco de dados, independente do sucesso
      if (userId) {
        // Só registra se conseguimos identificar o usuário
        // Não use await aqui para não bloquear a resposta - "fire-and-forget"
        this.logLoginService
          .recordLoginAttempt({
            userId: userId,
            ipAddress: ipAddress,
            userAgent: userAgent,
            successful: loginSuccess,
          })
          .catch((logError) => {
            // Log interno caso a gravação do histórico falhe
            console.error(
              'Failed background task: recordLoginAttempt',
              logError,
            );
          });
      } else if (!loginSuccess) {
        // Opcional: Registrar tentativas com email inválido (sem userId)
        // Poderia ter um campo 'attemptedEmail' na tabela LoginHistory
        // console.warn(
        //   `Failed login attempt for non-existent email: ${authLoginDto.email} from IP: ${ipAddress}`,
        // );
      }
    }
  }

  async registerAuthorizationToken(
    data: AuthRegisterAuthorizationTokenDTO,
    request: RequestExpress,
  ) {
    this.logger.log(
      `Realizando o cadastro do usuário via token de autorização`,
    );
    const token = this.jwtService.verify(data.token, {
      secret: process.env.AUTHORIZATION_JWT_SECRET,
    });

    if (!token) {
      throw new UnauthorizedException(`Token inválido!`);
    }

    if (!token.email) {
      throw new UnauthorizedException(`Token inválido!`);
    }

    if (await this.userService.existsEmail(token.email)) {
      throw new BadRequestException(`E-mail already in use!`);
    }

    if (await this.userService.existsLogin(token.login)) {
      throw new BadRequestException(`Login already in use!`);
    }

    return this.register(
      {
        name: token.name,
        email: token.email,
        login: token.login,
        image: token.image,
      },
      request,
    );
  }



  async updateImage(user: User, newImage: string) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { image: newImage },
      });  
  }

}
