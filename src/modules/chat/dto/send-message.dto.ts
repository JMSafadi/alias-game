import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data transfer object (DTO) for sending a chat message.
 */
export class SendMessageDto {
  /**
   * The content of the chat message.
   * @type {string}
   */
  @ApiProperty({
    description: 'The content of the chat message',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  /**
   * The identifier of the message sender.
   * @type {string}
   */
  @ApiProperty({
    description: 'The identifier of the message sender',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  /**
   * The timestamp when the message was sent.
   * This field is optional.
   * @type {Date}
   */
  @ApiPropertyOptional({
    description: 'The timestamp when the message was sent',
    example: '2024-10-08T10:45:00.000Z',
  })
  @IsOptional()
  timestamp?: Date;
}
