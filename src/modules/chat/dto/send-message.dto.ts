import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * Data transfer object (DTO) for sending a chat message.
 */
export class SendMessageDto {
  /**
   * The content of the chat message.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  content: string;

  /**
   * The identifier of the message sender.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  sender: string;

  /**
   * The timestamp when the message was sent.
   * This field is optional.
   * @type {Date}
   */
  @IsOptional()
  timestamp?: Date;
}
