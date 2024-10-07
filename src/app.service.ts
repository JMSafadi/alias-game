import { Injectable } from '@nestjs/common';

/**
 * AppService provides essential information about the application and its health status.
 */
@Injectable()
export class AppService {
  /**
   * Returns a welcome message, indicating that the server is running properly.
   * @returns A string message that says 'Alias Game API is running!'
   */
  getHello(): string {
    return 'Alias Game API is running!';
  }
}
