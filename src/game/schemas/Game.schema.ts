import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Turn {
  @Prop({ required: true })
  teamName: string;

  @Prop({ required: true })
  wordToGuess: string;

  @Prop({ required: true })
  describer: string;

  @Prop({ type: [String], default: [] })
  guessers: string[]; // Lista graczy, którzy mogą zgadywać w danym momencie

  @Prop({ default: false })
  isTurnActive: boolean;
}

export const TurnSchema = SchemaFactory.createForClass(Turn);

@Schema()
class Teams {
  @Prop({ required: true })
  teamName: string;

  @Prop({ type: [String], required: true })
  players: string[];

  @Prop({ default: 0, required: true })
  score: number;
}

export const TeamSchema = SchemaFactory.createForClass(Teams);

@Schema()
export class Game extends Document {
  @Prop({ required: true })
  lobbyId: string;

  @Prop({ type: [TeamSchema], required: true, _id: false })
  teamsInfo: Teams[];

  @Prop({ required: true, min: 5, max: 10 })
  rounds: number;

  @Prop({ required: true, min: 30, max: 120 })
  timePerTurn: number;

  @Prop({ type: TurnSchema })
  currentTurn: Turn;

  @Prop({ default: 0 })
  currentRound: number;

  @Prop({ default: 0 })
  playingTurn: number;

  @Prop()
  currentTurnStartTime: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
