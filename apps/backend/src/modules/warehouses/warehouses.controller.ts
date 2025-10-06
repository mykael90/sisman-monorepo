import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import {
  CreateWarehouseDto,
  FindAllWarehouseQueryDto,
  UpdateWarehouseDto
} from './dto/warehouse.dto';
import { WarehousesService } from './warehouses.service';

// // @Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('warehouse')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Roles(Role.Adm) // Assumindo que apenas Adm pode criar, ajuste conforme necessário
  @Post()
  async create(@Body() data: CreateWarehouseDto) {
    return this.warehousesService.create(data);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.warehousesService.show(id);
  }

  @Get()
  async list(@Query() params: FindAllWarehouseQueryDto) {
    return this.warehousesService.list(params);
  }

  @Roles(Role.Adm)
  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateWarehouseDto) {
    return this.warehousesService.update(id, data);
  }

  @Roles(Role.Adm)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.warehousesService.delete(id);
  }
}
