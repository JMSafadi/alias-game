import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents a chat message stored in the database.
 */
@Schema()
export class Message {
  /**
   * The content of the chat message.
   * @type {string}
   */
  @Prop({ required: true })
  content: string;

  /**
   * The identifier of the message sender.
   * @type {string}
   */
  @Prop({ required: true })
  sender: string;

  /**
   * The timestamp when the message was sent.
   * Defaults to the current date and time.
   * @type {Date}
   */
  @Prop({ default: () => Date.now() })
  timestamp: Date;
}

/**
 * The Mongoose document type for the Message class.
 */
export type MessageDocument = Message & Document;

/**
 * The Mongoose schema for the Message class.
 */
export const MessageSchema = SchemaFactory.createForClass(Message);
