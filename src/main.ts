import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AdminSeedService } from './users/seeders/create-admin.seed';

/**
 * Bootstrap function to initialize and start the NestJS application.
 * Configures global validation, Swagger documentation, and starts the application server.
 */
async function bootstrap() {
  // Create the Nest application instance using AppModule
  const app = await NestFactory.create(AppModule);

  // Configure Swagger documentation for the API
  const config = new DocumentBuilder()
    .setTitle('Alias game') // Title for the Swagger documentation
    .setDescription('Alias API') // Description of the API
    .setVersion('1.0') // Version of the API
    .addBearerAuth() // Allow using @ApiBearerAuth in endpoint
    .build();

  // Create Swagger documentation and setup Swagger UI endpoint
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use global validation pipe for all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  //Seeders
  const adminSeedService = app.get(AdminSeedService);
  await adminSeedService.seedAdmin();

  // Start the application server on port 3000
  await app.listen(3000);
}

// Call the bootstrap function to start the application
bootstrap();
