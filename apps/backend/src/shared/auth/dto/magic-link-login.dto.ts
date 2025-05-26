import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MagicLinkLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
