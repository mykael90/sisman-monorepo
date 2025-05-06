// packages/shared-types/src/index.ts
// Estes tipos podem ser baseados nos modelos Prisma, mas ajustados para a API

import {User} from '@sisman/prisma'
export interface UserApiResponse extends User {

  }