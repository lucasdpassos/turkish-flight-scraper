import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 🔒 Pipes globais para validação
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // 📘 Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('Turkish Airlines Flight Scraper')
    .setDescription('API for simulating human interaction with the Turkish Airlines website')
    .setContact('Lucas Passos', 'https://github.com/lucasdpassos', 'lucas.passos@yahoo.com.br')
    .setVersion('0.0.1')
    .addTag('flights')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Rota da documentação
  SwaggerModule.setup('api', app, document);

  await app.listen(49123);
}
bootstrap();
