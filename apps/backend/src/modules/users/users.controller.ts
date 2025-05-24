import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';

import { UsersService } from './users.service';
import { LogInterceptor } from 'src/shared/interceptors/log.interceptor';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UsersEntity } from '../../shared/entities/users.entity';
import {
  CreateUserWithRelationsDto,
  UpdateUserWithRelationsDto
} from './dto/user.dto';

@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
// o prefixo /users é gerenciado pelo RouterModule
@Controller()
@ApiTags('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiCreatedResponse({ type: UsersEntity })
  @Post()
  async create(@Body() data: CreateUserWithRelationsDto) {
    return this.userService.create(data);
  }

  @UseInterceptors(LogInterceptor)
  @Get()
  @ApiOkResponse({ type: UsersEntity, isArray: true })
  async list() {
    return this.userService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiOkResponse({ type: UsersEntity })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.userService.show(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: UsersEntity })
  async updateAll(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserWithRelationsDto
  ) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UsersEntity })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
