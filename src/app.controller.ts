import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BotService } from './bot.service';

@Controller()
export class AppController {
  constructor(private readonly appService: BotService) {}

  // @Get()
  // getHello() {
  //   this.appService.botMessage;
  // }
}
