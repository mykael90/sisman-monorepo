import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthRegisterDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsEmail()
  email: string;

  // @IsStrongPassword({
  //   minLength: 6,
  //   minLowercase: 0,
  //   minUppercase: 0,
  //   minNumbers: 0,
  //   minSymbols: 0,
  // })
  // password: string;
}
