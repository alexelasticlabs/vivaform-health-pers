import type { UserRole } from "@prisma/client";

export type CurrentUser = {
  userId: string;
  email: string;
  role?: UserRole;
  tier?: string | null;
};