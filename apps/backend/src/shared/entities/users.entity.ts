import { User } from '@sisman/prisma';
import { ApiProperty } from '@nestjs/swagger';
// import { Role } from 'src/shared/enums/role.enum';

export class UsersEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Jonh Smith' })
  name: string;

  @ApiProperty({ example: 'Jonh Smith' })
  login: string;

  @ApiProperty({ example: 'example@mailserver.com' })
  email: string;

  @ApiProperty({ required: false, nullable: true })
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  image: string;

  // @ApiProperty({ example: '123456' })
  // password: string;

  // @ApiProperty({ required: false, nullable: true })
  // birthAt: Date;

  // @ApiProperty({ required: false, nullable: false, default: 1, enum: Role })
  // role: number;

  @ApiProperty({ required: false, nullable: true })
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
