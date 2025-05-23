import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateUserRoleDto } from '../dto/roles/create-user-role.dto';
import { DeleteUserRoleDto } from '../dto/roles/delete-user-role.dto';
import { UpdateUserRoleDto } from '../dto/roles/update-user-role.dto';
import { RolesService } from './roles.service';

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
    @Body('newUserRoletypeId', ParseIntPipe) newUserRoletypeId: number
  ) {
    return this.rolesService.update(data, newUserRoletypeId);
  }

  @Delete()
  async delete(@Query() data: DeleteUserRoleDto) {
    return this.rolesService.delete(data);
  }
}
