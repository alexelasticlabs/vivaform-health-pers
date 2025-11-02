import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { CurrentUser } from "../types/current-user";

export const CurrentUser = createParamDecorator<keyof CurrentUser | undefined, ExecutionContext, unknown>(
  (data, ctx) => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    if (data) {
      return user[data];
    }

    return user;
  }
);