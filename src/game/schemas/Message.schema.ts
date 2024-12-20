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
   * The type of the message (e.g., 'chat', 'describe', 'guess').
   * @type {string}
   */
  @Prop({ required: true })
  messageType: string;

  /**
   * The team name of the sender, if applicable.
   * @type {string}
   */
  @Prop()
  senderTeamName?: string;

  /**
   * The role of the sender (e.g., 'describer', 'player').
   * @type {string}
   */
  @Prop()
  role?: string;

  /**
   * The identifier of the lobby where the message was sent.
   * @type {string}
   */
  @Prop({ required: true })
  lobbyId: string;

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
