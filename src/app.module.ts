import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import configuration from './config/database.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://127.0.0.1:27017/alias-game'), UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
