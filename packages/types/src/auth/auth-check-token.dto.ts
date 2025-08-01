import { PickType } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';
import { AuthRegisterDTO } from '../auth/auth-register.dto';

export class AuthCheckToken {
  // extends PickType(AuthRegisterDTO, ['password'])
  @IsString()
  @IsJWT()
  authorization: string;
}
