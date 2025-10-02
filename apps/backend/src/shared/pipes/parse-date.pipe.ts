import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException
} from '@nestjs/common';

@Injectable()
export class CustomParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Validation failed (date string is expected)'
      );
    }

    return date;
  }
}
