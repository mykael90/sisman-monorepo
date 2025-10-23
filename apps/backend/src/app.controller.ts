import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './shared/auth/guards/auth.guard';
import { RoleGuard } from './shared/auth/guards/role.guard';
import { Roles } from './shared/decorators/roles.decorator';
import { Role } from './shared/enums/role.enum';
import { User } from './shared/decorators/user-decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('delay')
  async delay() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return 'Delayed response';
  }

  @Get('error-http')
  errorHttp() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  //error not http for test
  @Get('error-not-http')
  errorNotHttp() {
    throw new Error('This is a non-HTTP exception');
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.Adm, Role.AdmMaterials, Role.SuperMaterials, Role.UserMaterials)
  @Get('user-decorator')
  userDecorator(@User() user: any) {
    return user;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.Adm, Role.AdmMaterials, Role.SuperMaterials, Role.UserMaterials)
  @Get('user-decorator-id-name')
  userDecoratorName(@User(['id', 'name']) user: { id: number; name: string }) {
    return user;
  }
}
