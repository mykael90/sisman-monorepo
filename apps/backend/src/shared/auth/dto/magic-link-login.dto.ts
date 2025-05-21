import { IsEmail, IsNotEmpty } from 'class-validator';

export class MagicLinkLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
