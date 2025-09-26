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
import { MaintenanceRequestsService } from './maintenance-requests.service';
import {
  CreateMaintenanceRequestWithRelationsDto,
  MaintenanceRequestWithRelationsResponseDto,
  UpdateMaintenanceRequestWithRelationsDto
} from './dto/maintenance-request.dto';
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

  @Get('/protocol')
  async showByProtocolNumber(@Query('value') value: string) {
    return this.maintenanceRequestsService.showByProtocolNumber(value);
  }

  @Get('/deficit-status-paginated')
  async getDeficitStatusPaginated(
    @Query('pageIndex') pageIndex: string = '0',
    @Query('pageSize') pageSize: string = '10'
  ) {
    return this.maintenanceRequestsService.getPaginatedMaintenanceRequestsDeficit(
      parseInt(pageIndex, 10),
      parseInt(pageSize, 10)
    );
  }

  @Get('/deficit-status/maintenance-instance/:id')
  async getDeficitStatusByMaintenanceInstance(
    @Param('id') maitenanceInstanceId: number,
    @Query() queryParams: { [key: string]: string }
  ) {
    // @Query('pageSize') pageSize: string = '10' // @Query('pageIndex') pageIndex: string = '0',
    return this.maintenanceRequestsService.getMaintenanceRequestsDeficitByMaintenanceInstance(
      // parseInt(pageIndex, 10),
      // parseInt(pageSize, 10)
      maitenanceInstanceId,
      queryParams
    );
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.maintenanceRequestsService.show(id);
  }

  @Get('/balance/protocol')
  async showBalanceMaterialsByProtocolNumber(@Query('value') value: string) {
    return this.maintenanceRequestsService.showBalanceMaterialsByProtocolNumber(
      value
    );
  }

  @Get('balance/:id')
  async showBalanceMaterials(@Param('id') id: number) {
    return this.maintenanceRequestsService.showBalanceMaterials(id);
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
