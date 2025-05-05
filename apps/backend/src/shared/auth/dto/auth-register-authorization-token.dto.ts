import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthRegisterAuthorizationTokenDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
