import { Controller } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('file')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}
}
