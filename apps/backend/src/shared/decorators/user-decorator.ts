import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string | string[] | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (typeof filter === 'string') {
      return user[filter];
    }
    if (Array.isArray(filter)) {
      return filter.reduce((obj, key) => {
        obj[key] = user[key];
        return obj;
      }, {});
    }

    return user;
  },
);
