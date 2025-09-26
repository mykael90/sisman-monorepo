import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { CreateStorageDto, UpdateStorageDto } from './dto/storage.dto';
import { StoragesService } from './storages.service';

// @Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('storage')
export class StoragesController {
  constructor(private readonly storagesService: StoragesService) {}

  @Post()
  async create(@Body() data: CreateStorageDto) {
    return this.storagesService.create(data);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.storagesService.show(id);
  }

  @Get()
  async list() {
    return this.storagesService.list();
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateStorageDto) {
    return this.storagesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.storagesService.delete(id);
  }
}
