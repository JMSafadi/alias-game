import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * AppController provides endpoints for retrieving general information about the application.
 */
@ApiTags('App') // Categoría del controlador en Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * GET /
   * Returns a welcome message to indicate that the API is running.
   * @returns A string message indicating the server status.
   */
  @Get()
  @ApiOperation({ summary: 'Get welcome message' }) // Resumen de la operación
  getHello(): string {
    return this.appService.getHello();
  }
}
