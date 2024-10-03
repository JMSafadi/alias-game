import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lobby, LobbySchema } from 'src/schemas/Lobby.schema';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Lobby.name, schema: LobbySchema }]),
    ],
    controllers: [LobbyController],
    providers: [LobbyService],
})
export class LobbyModule { }