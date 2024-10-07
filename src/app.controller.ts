import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController provides endpoints for retrieving general information about the application.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Returns a welcome message to indicate that the API is running.
   * @returns A string message indicating the server status.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
