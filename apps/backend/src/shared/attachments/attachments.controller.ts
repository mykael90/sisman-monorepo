import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UploadedFiles
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { AttachmentsService } from './attachments.service';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { User } from '../decorators/user-decorator';

// DTOs
import {
  CreateAttachmentDto,
  UpdateAttachmentDto,
  AttachmentResponseDto,
  FindAttachmentsDto // Novo DTO sugerido para o método list
} from './dto/attachment.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('attachment')
@ApiTags('Attachment')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Cria um novo anexo.
   * Utiliza Interceptor para lidar com multipart/form-data.
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data') // Necessário para o Swagger entender o upload
  @ApiBody({
    description: 'Arquivo e dados do anexo',
    type: CreateAttachmentDto // O DTO deve ter a propriedade 'file' tipada como 'string' com format: 'binary' para o Swagger
  })
  @ApiEndpointSwagger({
    summary: 'Criar novo anexo',
    description: 'Faz o upload de um arquivo e registra o anexo no sistema.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Anexo criado com sucesso.',
      type: AttachmentResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Arquivo inválido ou dados incorretos.'
      }
    ]
  })
  async create(
    @User(['id']) user: { id: number }, // Pegando apenas o necessário
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          // Valida se é imagem (jpg, jpeg, png, webp).
          // SE precisar aceitar PDF, mude para: /(jpg|jpeg|png|webp|pdf)$/
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|pdf)$/ }),

          // Limite de 5MB (Ajuste conforme necessidade)
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })
        ]
      })
    )
    file: Express.Multer.File,
    @Body() data: CreateAttachmentDto
  ) {
    return this.attachmentsService.create({
      file,
      userId: user.id,
      relatedId: data.relatedId,
      relatedModel: data.relatedModel
    });
  }

  /**
   * Cria múltiplos anexos de uma vez.
   */
  @Post('batch') // Endpoint específico para lote
  @UseInterceptors(FilesInterceptor('files', 10)) // Limite de 10 arquivos por vez
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivos e dados dos anexos',
    schema: {
      type: 'object',
      properties: {
        relatedId: { type: 'string' },
        relatedModel: { type: 'string' },
        files: {
          type: 'array', // Define que é um array
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @ApiEndpointSwagger({
    summary: 'Criar múltiplos anexos (Batch)',
    description: 'Faz o upload de múltiplos arquivos simultaneamente.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Anexos criados com sucesso.',
      type: AttachmentResponseDto,
      isArray: true // Retorna um array de objetos
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Arquivos inválidos ou dados incorretos.'
      }
    ]
  })
  async createMany(
    @User(['id']) user: { id: number },
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          // Valida CADA arquivo do array individualmente
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|pdf)$/ }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB por arquivo
        ]
      })
    )
    files: Array<Express.Multer.File>, // Array de arquivos
    @Body() data: CreateAttachmentDto // Reutilizamos o DTO para pegar relatedId/Model
  ) {
    return this.attachmentsService.createMany({
      files,
      userId: user.id,
      relatedId: data.relatedId,
      relatedModel: data.relatedModel
    });
  }

  /**
   * Listagem de anexos com filtros.
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) // Garante que query params sejam convertidos corretamente
  @ApiEndpointSwagger({
    summary: 'Listar anexos',
    description: 'Retorna uma lista de anexos filtrada por parâmetros.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de anexos recuperada com sucesso.',
      type: AttachmentResponseDto,
      isArray: true
    }
  })
  async list(@Query() queryParams: FindAttachmentsDto) {
    // Nota: Crie o FindAttachmentsDto com @IsOptional() nos campos relatedId, etc.
    // Isso substitui o { [key: string]: string } e permite validação real.
    return this.attachmentsService.list(
      queryParams as unknown as Record<string, string>
    );
  }

  /**
   * Busca um anexo específico.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar anexo por ID',
    description: 'Retorna os detalhes de um anexo específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Anexo encontrado.',
      type: AttachmentResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Anexo não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.show(id);
  }

  /**
   * Atualiza metadados do anexo.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar anexo',
    description:
      'Atualiza informações de um anexo existente (não o arquivo em si).',
    response: {
      status: HttpStatus.OK,
      description: 'Anexo atualizado com sucesso.',
      type: AttachmentResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Anexo não encontrado.'
      }
    ]
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateAttachmentDto
  ) {
    return this.attachmentsService.update(id, data);
  }

  /**
   * Remove um anexo.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar anexo',
    description: 'Remove permanentemente o registro do anexo.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Anexo deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Anexo não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.attachmentsService.delete(id);
  }
}
