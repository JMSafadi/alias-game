import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AdminSeedService } from './seeders/create-admin.seed';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [UsersService, AdminSeedService],
  controllers: [UsersController],
  exports: [UsersService, AdminSeedService, MongooseModule],
})
export class UsersModule {}
