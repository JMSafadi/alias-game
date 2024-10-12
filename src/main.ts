import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Bootstrap function to initialize and start the NestJS application.
 * Configures global validation, Swagger documentation, and starts the application server.
 */
async function bootstrap() {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  // Create the Nest application instance using AppModule
  const app = await NestFactory.create(AppModule);

  // Configure Swagger documentation for the API
  const config = new DocumentBuilder()
    .setTitle('Alias game') // Title for the Swagger documentation
    .setDescription('Alias API') // Description of the API
    .setVersion('1.0') // Version of the API
    .build();

  // Create Swagger documentation and setup Swagger UI endpoint
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use global validation pipe for all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Start the application server on port 3000
  await app.listen(3000);
}

// Call the bootstrap function to start the application
bootstrap();
