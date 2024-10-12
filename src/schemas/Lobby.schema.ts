import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Lobby extends Document {
    @Prop({ required: true })
    ownerId: string;

    @Prop({ unique: true })
    lobbyName: string;

  @Prop({ required: true })
  playersPerTeam: number;

  @Prop({ required: true })
  maxPlayers: number;

  @Prop({ default: 1 }) //Starts with 1 player because the owner is already in.
  currentPlayers: number;

  @Prop({ type: [{ userId: String, team: String }], default: [] })
  players: Array<{ userId: string; team?: string }>; //Owner will be added automatically.

  @Prop({ required: true })
  teamCount: number; //Always 2 teams.
}

export const LobbySchema = SchemaFactory.createForClass(Lobby);
