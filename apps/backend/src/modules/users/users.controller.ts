import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateUserDto } from "./dto/create-user.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: "Создан новый пользователь" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Получить профиль пользователя" })
  findOne(@Param("id") id: string, @CurrentUser() requester: CurrentUserPayload) {
    return this.usersService.getProfileVisibleTo(requester, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Текущий пользователь по access token" })
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.userId);
  }
}