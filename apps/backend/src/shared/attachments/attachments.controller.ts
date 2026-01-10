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
  ParseUUIDPipe
} from '@nestjs/common';

import { AttachmentsService } from './attachments.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateAttachmentDto,
  UpdateAttachmentDto,
  AttachmentResponseDto
} from './dto/attachment.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('attachments')
@ApiTags('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Cria um novo anexo.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo anexo',
    description: 'Registra um novo anexo no sistema.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Anexo criado com sucesso.',
      type: AttachmentResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos.'
      }
    ]
  })
  async create(@Body() data: CreateAttachmentDto) {
    return this.attachmentsService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar anexos',
    description:
      'Retorna uma lista de anexos, podendo filtrar por relatedId, relatedModel ou userId.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de anexos encontrada.',
      type: AttachmentResponseDto,
      isArray: true
    }
  })
  async list(@Query() queryParams: { [key: string]: string }) {
    return this.attachmentsService.list(queryParams);
  }

  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar anexo por ID',
    description: 'Retorna um anexo específico pelo seu ID.',
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

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar anexo',
    description: 'Atualiza os dados de um anexo existente.',
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar anexo',
    description: 'Remove permanentemente um anexo pelo seu ID.',
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
