import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Turn {
  @Prop({ required: true })
  teamName: string

  @Prop({ required: true })
  wordToGuess: string

  @Prop({ default: false })
  isTurnActive: boolean
}

export const TurnSchema = SchemaFactory.createForClass(Turn)

class Teams {
  @Prop({ required: true })
  teamName: string;

  @Prop({ type: [String], required: true })
  players: string[]

}

@Schema()
export class Game extends Document{
  @Prop({ required: true })
  lobbyId: string;

  @Prop({ type: [Teams], required: true })
  teamsInfo: Teams[]

  @Prop({ required: true, min: 5, max: 10 })
  rounds: number

  @Prop({ required: true, min: 30, max: 120 })
  timePerTurn: number

  @Prop({ type: TurnSchema })
  currentTurn: Turn

  @Prop({ default: Date.now })
  createdAt: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
