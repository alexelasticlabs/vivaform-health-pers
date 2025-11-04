import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";

import type { CurrentUser as CurrentUserType } from "../types/current-user";

export const CurrentUser = createParamDecorator<keyof CurrentUserType | undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
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