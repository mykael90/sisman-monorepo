import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  RoleResponseDto,
  UpdateRoleDto
} from './dto/roles/role.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('Roles') // Agrupa os endpoints na UI do Swagger
@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Cria um novo papel de usuário.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo papel de usuário',
    description: 'Cria um novo papel de usuário.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Papel de usuário criado com sucesso.',
      type: RoleResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um papel com os dados fornecidos (ex: id ou nome do papel já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateRoleDto) {
    return this.rolesService.create(data);
  }

  /**
   * Busca um papel específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Papel por ID',
    description: 'Retorna um papel específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Papel de usuário encontrado.',
      type: RoleResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Papel de usuário não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.show(id);
  }

  /**
   * Lista todos os papéis de usuário.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar papéis de usuários',
    description: 'Retorna uma lista de todos os papéis de usuários.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de papéis de usuários.',
      type: RoleResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.rolesService.list();
  }

  /**
   * Atualiza um papel de usuário existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Papel',
    description: 'Atualiza os dados de um papel existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Papel de usuário atualizado com sucesso.',
      type: RoleResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Papel de usuário não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um papel com os dados fornecidos (ex: id ou nome do papel já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,

    @Body() data: UpdateRoleDto
  ) {
    return this.rolesService.update(id, data);
  }

  /**
   * Deleta um papel de usuário.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Papel de Usuário',
    description: 'Remove permanentemente um papel de usuário pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Papel de usuário deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Papel de usuário não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.delete(id);
  }
}
