import { CreateUserDTO } from './create-user.dto';

export interface ConnectByIdInput {
  id: number;
}

export interface CreateUserWithRelationsDTO extends CreateUserDTO {
  roles?: ConnectByIdInput[];
  //   permissions?: ConnectByIdInput[];
  // Adicione outras possíveis relações aqui
}
