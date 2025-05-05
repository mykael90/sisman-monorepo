import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';
import { IsDate } from 'class-validator';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  //   @IsDate()
  //   updatedAt: Date;
}
