import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { raw } from "body-parser";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>("app.port", 4000);
  const corsOrigins = configService.get<string[]>("app.corsOrigins", ["http://localhost:5173"]);

  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  app.use("/webhooks/stripe", raw({ type: "application/json" }));

  // Security: Helmet with Content Security Policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        logger.error(`❌ Validation errors: ${JSON.stringify(errors, null, 2)}`);
        return errors;
      }
    })
  );

  if (configService.get<boolean>("app.enableSwagger", true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VivaForm API")
      .setDescription("REST API VivaForm для питания и здоровья")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("/docs", app, document);
  }

  await app.listen(port);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});