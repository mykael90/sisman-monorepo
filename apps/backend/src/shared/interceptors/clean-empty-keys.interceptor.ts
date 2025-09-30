import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class EmptyStringInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Função utilitária para limpar o objeto
    const removeEmptyStrings = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].trim() === '') {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Tratar objetos aninhados, se necessário
          removeEmptyStrings(obj[key]);
        }
      }
    };

    if (body) {
      removeEmptyStrings(body);
    }

    return next.handle();
  }
}
