import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateUserDto } from "./dto/create-user.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: "Создан новый пользователь" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Получить профиль пользователя" })
  findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}