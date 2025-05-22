import {
  BadRequestException,
  ConsoleLogger,
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
  ConflictException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { User, UserRole } from '@sisman/prisma';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UsersService } from 'src/modules/users/users.service';
import { AuthRegisterAuthorizationTokenDTO } from './dto/auth-register-authorization-token.dto';
import { AuthLoginAuthorizationTokenDTO } from './dto/auth-login-authorization-token.dto';
import { MetricsService } from '../observability/metrics.service'; // Ajuste o caminho
import { LogLoginService } from '../log-login/log-login.service';
import { Request as RequestExpress } from 'express'; // <-- Importe Request
import { read } from 'fs';
import { randomInt } from 'crypto';
import { MagicLinkLoginDto } from './dto/magic-link-login.dto';
import { VerifyCodeDto } from './dto/verify-code-magic-link.dto';
import { EmailService } from '../notifications/email/email.service';
import { ConfigService, ConfigType } from '@nestjs/config';
import generalConfig from '../../config/general.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly issuer = 'login';
  private readonly audience = 'users';
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly metricsService: MetricsService, // Injete o serviço de métricas
    private readonly logLoginService: LogLoginService, // Injete o serviço de métricas
    private readonly configService: ConfigService, // Injete o serviço de configuração
    @Inject(generalConfig.KEY)
    private gnConfig: ConfigType<typeof generalConfig>
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
          roles: roles.map((role) => role.userRoletypeId)
        },
        {
          expiresIn: 1 * 60 * 60 * 24, //in seconds (24hs)
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience
        }
      ),
      roles: roles.map((role) => role.userRoletypeId),
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      image: user.image,
      //implementar a chave expires_in baseado no valor da assinatura já informado
      expires_in: 1 * 60 * 60 * 24 //valor em segundos (corresponde a 24hs)
    };
  }

  //não há necessidade de implementar refresh_token uma vez que o fluxo convencional já utiliza um token para fornecer o access_token, sempre que receber o token correto pode retornar o access_token que vai poder ser utilizado por 24hs

  checkToken(token: string) {
    this.logger.log(`Verificando token para retornar o payload`);
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer
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
    request: RequestExpress
  ) {
    this.logger.log(
      `Iniciando o processo de login ou cadastro via Token de autorização`
    );
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];
    let userId: number | null = null;
    let loginSuccess = false;

    try {
      const token = this.jwtService.verify(data.token, {
        secret: process.env.AUTHORIZATION_JWT_SECRET
      });

      if (!token) {
        throw new UnauthorizedException(`Token inválido!`);
      }

      if (!token.email || !token.login) {
        throw new UnauthorizedException(`Token inválido!`);
      }

      const user: User = token.login
        ? await this.prisma.user.findFirst({
            where: { login: token.login }
          })
        : await this.prisma.user.findFirst({
            where: { email: token.email }
          });

      if (!user) {
        return this.register(
          {
            name: token.name,
            email: token.email,
            login: token.login,
            image: token.image
          },
          request
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
        where: { userId: user.id }
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
            successful: loginSuccess
          })
          .catch((logError) => {
            // Log interno caso a gravação do histórico falhe
            console.error(
              'Failed background task: recordLoginAttempt',
              logError
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
      if (await this.usersService.existsLogin(data.login)) {
        throw new ConflictException(`Login já cadastrado!`);
      }

      if (await this.usersService.existsEmail(data.email)) {
        throw new ConflictException(`E-mail já cadastrado!`);
      }

      const user = await this.usersService.create(data);
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
            successful: loginSuccess
          })
          .catch((logError) => {
            // Log interno caso a gravação do histórico falhe
            console.error(
              'Failed background task: recordLoginAttempt',
              logError
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
    request: RequestExpress
  ) {
    this.logger.log(
      `Realizando o cadastro do usuário via token de autorização`
    );
    const token = this.jwtService.verify(data.token, {
      secret: process.env.AUTHORIZATION_JWT_SECRET
    });

    if (!token) {
      throw new UnauthorizedException(`Token inválido!`);
    }

    if (!token.email) {
      throw new UnauthorizedException(`Token inválido!`);
    }

    if (await this.usersService.existsLogin(token.login)) {
      throw new ConflictException(`Login já cadastrado!`);
    }

    if (await this.usersService.existsEmail(token.email)) {
      throw new ConflictException(`E-mail já cadastrado!`);
    }

    return this.register(
      {
        name: token.name,
        email: token.email,
        login: token.login,
        image: token.image
      },
      request
    );
  }

  async updateImage(user: User, newImage: string) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { image: newImage }
    });
  }

  private generateMagicCode(): string {
    // Gera um código numérico de 6 dígitos
    return randomInt(100000, 999999).toString();
  }

  async requestMagicLink(
    magicLinkLoginDto: MagicLinkLoginDto
  ): Promise<{ message: string }> {
    const { email } = magicLinkLoginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Invalidar códigos anteriores não usados para este usuário (opcional, mas recomendado)
    await this.prisma.magicLink.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() } // Expira imediatamente
    });

    const code = this.generateMagicCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

    await this.prisma.magicLink.create({
      data: {
        code,
        userId: user.id,
        expiresAt
      }
    });

    await this.emailService.sendEmail(
      email,
      `Código de acesso - SISMAN: ${code}`,
      `magic-link`,
      {
        appName: this.gnConfig.appName,
        code,
        link: `${this.gnConfig.magicLinkCallbackUrl}?code=${code}&email=${email}`,
        expiresInMinutes: this.gnConfig.magicLinkExpiresMinutes,
        projectPrimaryColor: this.gnConfig.appPrimaryColor,
        //TODO: inserir logo sisman em variável global
        logoUrl: this.gnConfig.appLogoUrl
      }
    );
    return { message: 'Código de acesso enviado para seu e-mail.' };
  }

  async verifyCodeAndLogin(
    verifyCodeDto: VerifyCodeDto,
    request: RequestExpress
  ) {
    this.logger.log(`Iniciando o processo de login via código magic link`);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];
    const { email, code } = verifyCodeDto;

    let userId: number | null = null;
    let loginSuccess = false;

    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const magicLink = await this.prisma.magicLink.findFirst({
        where: {
          userId: user.id,
          code: code,
          usedAt: null, // Ainda não foi usado
          expiresAt: {
            gt: new Date() // Não expirou
          }
        }
      });

      if (!magicLink) {
        throw new UnauthorizedException(
          'Código inválido, expirado ou já utilizado.'
        );
      }

      // Marcar código como usado
      await this.prisma.magicLink.update({
        where: { id: magicLink.id },
        data: { usedAt: new Date() }
      });

      // Se chegou aqui, a validação foi bem-sucedida
      userId = user.id;
      loginSuccess = true;

      // >>> Incrementa o contador de login BEM-SUCEDIDO AQUI <<<
      this.metricsService.userLoginCounter.inc(); // Pode adicionar labels aqui se definiu algum

      const roles = await this.prisma.userRole.findMany({
        where: { userId: user.id }
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
            successful: loginSuccess
          })
          .catch((logError) => {
            // Log interno caso a gravação do histórico falhe
            console.error(
              'Failed background task: recordLoginAttempt',
              logError
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
}
