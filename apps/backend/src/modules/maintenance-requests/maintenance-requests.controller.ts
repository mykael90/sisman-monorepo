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
import { MaintenanceRequestsService } from './maintenance-requests.service';
import {
  CreateMaintenanceRequestWithRelationsDto,
  UpdateMaintenanceRequestWithRelationsDto
} from '@sisman/types';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';

@Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('maintenance-request')
export class MaintenanceRequestsController {
  constructor(
    private readonly maintenanceRequestsService: MaintenanceRequestsService
  ) {}

  @Post()
  async create(@Body() data: CreateMaintenanceRequestWithRelationsDto) {
    return this.maintenanceRequestsService.create(data);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.maintenanceRequestsService.show(id);
  }

  @Get()
  async list() {
    return this.maintenanceRequestsService.list();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateMaintenanceRequestWithRelationsDto
  ) {
    return this.maintenanceRequestsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.maintenanceRequestsService.delete(id);
  }
}
