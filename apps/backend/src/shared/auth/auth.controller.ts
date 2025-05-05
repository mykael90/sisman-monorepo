import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { User } from 'src/shared/decorators/user-decorator';
import { CreateUserDTO } from 'src/shared/dto/user/create-user.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FilesService } from 'src/shared/files/files.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthRegisterAuthorizationTokenDTO } from './dto/auth-register-authorization-token.dto';
import { AuthLoginAuthorizationTokenDTO } from './dto/auth-login-authorization-token.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RoleGuard } from './guards/role.guard';
import { Request as RequestExpress } from 'express'; // Importe Request

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FilesService,
  ) {}

  @Post('login-authorization-token')
  async loginAuthorizationToken(
    @Body() body: AuthLoginAuthorizationTokenDTO,
    @Req() request: RequestExpress,
  ) {
    return this.authService.loginAuthorizationToken(body, request);
  }

  @Roles(Role.Adm)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(
    @Body() body: AuthRegisterDTO,
    @Req() request: RequestExpress,
  ) {
    return this.authService.register(body, request);
  }

  @Post('register-authorization-token')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerAuthorizationToken(
    @Body() body: AuthRegisterAuthorizationTokenDTO,
    @Req() request: RequestExpress,
  ) {
    return this.authService.registerAuthorizationToken(body, request);
  }

  @UseGuards(AuthGuard)
  @Post('check-token')
  async checkToken(@User(['id', 'name', 'email']) user: CreateUserDTO) {
    return user;
  }

  @UseInterceptors(FileInterceptor('photo'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(
    @User('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image' }),
          // 2MB
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
      }),
    )
    photo: Express.Multer.File,
    @Body('title') title: string,
  ) {
    const path = `./storage/photos/photo-${id}.jpg`;

    try {
      await this.fileService.upload(photo, path);
    } catch (e) {
      return new BadRequestException(e);
    }

    return { title, id, success: true };
  }

  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Post('files')
  async uploadFiles(
    @User('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return { files };
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'documents', maxCount: 2 },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post('files-field')
  async uploadFilesField(
    @User('id') id: string,
    @UploadedFiles()
    files: { photos: Express.Multer.File[]; documents: Express.Multer.File[] },
  ) {
    return { files };
  }
}
