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
import { MaterialRequestsService } from './material-requests.service';
import {
  CreateMaterialRequestDto,
  UpdateMaterialRequestDto
} from './dto/material-request.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';

@Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('material-request')
export class MaterialRequestsController {
  constructor(
    private readonly materialRequestsService: MaterialRequestsService
  ) {}

  @Post()
  async create(@Body() data: CreateMaterialRequestDto) {
    return this.materialRequestsService.create(data);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.materialRequestsService.show(id);
  }

  @Get()
  async list() {
    return this.materialRequestsService.list();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateMaterialRequestDto
  ) {
    return this.materialRequestsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.materialRequestsService.delete(id);
  }
}
