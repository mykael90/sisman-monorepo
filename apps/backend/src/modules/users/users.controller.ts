import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UsersService } from './users.service';
import { LogInterceptor } from 'src/shared/interceptors/log.interceptor';
import { ParamId } from 'src/shared/decorators/param-id-decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UsersEntity } from '../../shared/entities/users.entity';
import { CreateUserWithRolesDTO } from './dto/create-user-with-roles.dto';
import { UpdateUserWithRelationsDTO } from './dto/update-user-with-relations.dto';
import { CreateUserWithRelationsDTO } from './dto/create-user-with-relations.dto';

@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
// o prefixo /users é gerenciado pelo RouterModule
@Controller()
@ApiTags('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiCreatedResponse({ type: UsersEntity })
  @Post()
  async create(@Body() data: CreateUserWithRelationsDTO) {
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
    @Body() data: UpdateUserWithRelationsDTO
  ) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UsersEntity })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
