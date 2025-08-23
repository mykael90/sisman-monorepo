import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Logger
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateMaterialDto,
  FindAllMaterialQueryDto,
  UpdateMaterialDto
} from './dto/material.dto';

@Controller('materials')
@ApiTags('materials')
export class MaterialsController {
  private readonly logger = new Logger(MaterialsController.name);

  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  findAll(@Query() params: FindAllMaterialQueryDto) {
    return this.materialsService.findAll(params);
  }

  @Get('warehouse/:warehouseId')
  findAllByWarehouseId(
    @Param('warehouseId', ParseIntPipe) warehouseId: number
  ) {
    return this.materialsService.findAllByWarehouseId(warehouseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }

  @Post('sync')
  syncFromSipacMateriais() {
    return this.materialsService.syncFromSipacMateriais();
  }
}
