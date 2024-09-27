import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import configuration from './config/database.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
