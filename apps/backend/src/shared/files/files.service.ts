import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FilesService {
  async upload(file: Express.Multer.File, path: string) {
    // Certifique-se de que o diretório existe ou será criado
    const directory = join(path, '..'); // Diretório do arquivo
    await mkdir(directory, { recursive: true });

    return writeFile(path, file.buffer);
  }
}
