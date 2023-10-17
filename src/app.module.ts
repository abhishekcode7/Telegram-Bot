import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BotService } from './bot.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI.toString()),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [AppController],
  providers: [BotService],
})
export class AppModule {}
