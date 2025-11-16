import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateUserDto } from "./dto/create-user.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Removed public POST /users endpoint - use /auth/register instead
  // This prevents unauthorized user creation

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Текущий пользователь по access token" })
  me(@CurrentUser("userId") userId: string) {
    return this.usersService.findById(userId);
  }

  // Protected endpoint - users can only access their own profile
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Получить профиль пользователя" })
  findOne(@Param("id") id: string, @CurrentUser("userId") currentUserId: string) {
    // Users can only access their own profile unless they're admin
    if (id !== currentUserId) {
      throw new Error("Forbidden: You can only access your own profile");
    }
    return this.usersService.findById(id);
  }
}