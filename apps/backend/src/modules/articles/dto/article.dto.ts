import { IsString, IsOptional, IsBoolean, IsArray, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateArticleDto {
  @ApiProperty({ example: "10 Tips for Healthy Eating" })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: "# Introduction\n\nThis is an article about healthy eating..." })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ example: "Learn the basics of healthy nutrition" })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: "Nutrition" })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: "https://example.com/image.jpg" })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: ["health", "nutrition", "tips"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: "Updated Title" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}