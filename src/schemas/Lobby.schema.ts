import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Lobby extends Document {
    @Prop({ required: true })
    owner: string;

    @Prop({ required: true })
    maxPlayers: number;

    @Prop({ default: 0 })
    currentPlayers: number;

    @Prop({ type: [{ username: String, team: String }], default: [] })
    players: Array<{ username: string; team?: string }>;

    @Prop({ required: true })
    teamCount: number;
}

export const LobbySchema = SchemaFactory.createForClass(Lobby);