import { CreateUserWithRelationsDTO } from './create-user-with-relations.dto';

export interface UpdateUserWithRelationsDTO
  extends Partial<CreateUserWithRelationsDTO> {
  id: number;
}
