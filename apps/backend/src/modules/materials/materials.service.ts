import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateMaterialDto) {
    return await this.prisma.material.create({ data });
  }

  async findAll() {
    return await this.prisma.material.findMany();
  }

  async findOne(id: number) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.material.findFirst({ where: { id } });
  }

  async update(id: number, data: UpdateMaterialDto) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.material.update({
      where: { id },
      data
    });
  }

  async remove(id: number) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.material.delete({ where: { id } });
  }

  async exists(id: number) {
    return await this.prisma.material.exists({ id });
  }
}
