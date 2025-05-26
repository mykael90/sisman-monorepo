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
  Query,
  UseGuards
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles/role.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';

@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() data: CreateRoleDto) {
    return this.rolesService.create(data);
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.show(id);
  }

  @Get()
  async list() {
    return this.rolesService.list();
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,

    @Body() data: UpdateRoleDto
  ) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.rolesService.delete(id);
  }
}
