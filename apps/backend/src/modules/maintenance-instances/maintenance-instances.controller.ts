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
import { MaintenanceInstancesService } from './maintenance-instances.service';
import {
  CreateMaintenanceInstanceDto,
  UpdateMaintenanceInstance
} from './dto/maintenance-instance.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';

@Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('maintenance-instance')
export class MaintenanceInstancesController {
  constructor(
    private readonly maintenanceInstancesService: MaintenanceInstancesService
  ) {}

  @Post()
  async create(@Body() data: CreateMaintenanceInstanceDto) {
    return this.maintenanceInstancesService.create(data);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.maintenanceInstancesService.show(id);
  }

  @Get()
  async list() {
    return this.maintenanceInstancesService.list();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateMaintenanceInstance
  ) {
    return this.maintenanceInstancesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.maintenanceInstancesService.delete(id);
  }
}
