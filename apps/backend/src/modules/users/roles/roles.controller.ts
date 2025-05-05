import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateUserRoleDto } from '../../../shared/dto/user/role/create-user-role.dto';
import { DeleteUserRoleDto } from '../../../shared/dto/user/role/delete-user-role.dto';
import { UpdateUserRoleDto } from '../../../shared/dto/user/role/update-user-role.dto';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() data: CreateUserRoleDto) {
    return this.rolesService.create(data);
  }

  @Get()
  async list() {
    return this.rolesService.list();
  }

  @Patch()
  async update(
    @Query() data: UpdateUserRoleDto,
    @Body('newUserRoletypeId', ParseIntPipe) newUserRoletypeId: number,
  ) {
    return this.rolesService.update(data, newUserRoletypeId);
  }

  @Delete()
  async delete(@Query() data: DeleteUserRoleDto) {
    return this.rolesService.delete(data);
  }
}
