import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { Order } from '../../../shared/enums/order.enum';

export class FindManyContractsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: string = 'id';

  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.ASC;

  @IsOptional()
  @IsString()
  search?: string;
}
