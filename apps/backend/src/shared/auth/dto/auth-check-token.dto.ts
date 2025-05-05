import { PickType } from '@nestjs/mapped-types';
import { IsJWT, IsString } from 'class-validator';
import { AuthRegisterDTO } from './auth-register.dto';

export class AuthCheckToken {
  // extends PickType(AuthRegisterDTO, ['password'])
  @IsString()
  @IsJWT()
  authorization: string;
}
