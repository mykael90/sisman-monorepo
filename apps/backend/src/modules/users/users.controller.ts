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

import { UsersService } from './users.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateUserWithRelationsDto,
  UpdateUserWithRelationsDto,
  UserWithRelationsResponseDto
} from './dto/user.dto';

// // @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
// o prefixo /users é gerenciado pelo RouterModule
@Controller('user')
@ApiTags('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Cria um novo usuário.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário com as relações especificadas.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Usuário criado com sucesso.',
      type: UserWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um usuário com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateUserWithRelationsDto) {
    return this.userService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar usuários',
    description: 'Retorna uma lista de todos os usuários.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de usuários encontrada.',
      type: UserWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.userService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar usuário por ID',
    description: 'Retorna um usuário específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Usuário encontrado.',
      type: UserWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.userService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Usuário atualizado com sucesso.',
      type: UserWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um usuário com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserWithRelationsDto
  ) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar usuário',
    description: 'Remove permanentemente um usuário pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Usuário deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.delete(id);
  }
}
