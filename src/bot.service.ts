import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { env } from 'process';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios/dist';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {}

  token: String;
  bot: any;
  city: string = null;
  onModuleInit() {
    const TelegramBot = require('node-telegram-bot-api');

    this.token = process.env.TELEGRAM_BOT_TOKEN.toString();

    this.bot = new TelegramBot(this.token, { polling: true });

    this.botMessage();
    // this.userModel.deleteMany().exec()
  }

  botMessage() {
    this.bot.onText(/\/start/, (msg, match) => {
      this.findUser(msg.from.id.toString()).then((user) => {
        if (user == null) {
          this.bot.sendMessage(
            msg.from.id,
            'Hello ' +
              msg.from.first_name +
              ', I am weather forecast Bot. Type " /subscribe <city_name> "' +
              ' ( without double quotes ) ' +
              'to get ' +
              'daily weather updates',
          );
        }
      });
    });

    this.bot.onText(/\/subscribe (.+)/, (msg, match) => {
      this.city = match[1];
      this.saveUser({
        id: msg.from.id.toString(),
        name: msg.from.first_name,
        city: this.city,
      }).then(
        (_) => {
          this.bot.sendMessage(
            msg.from.id,
            msg.from.first_name +
              ' you have subscribed to the weather updates.' +
              ' Thank You',
          );
        },
        (_) => {
          this.bot.sendMessage(
            msg.from.id,
            'Subscribe Failed. Please try again /subscribe',
          );
        },
      );

      this.findAll().then((r) => {
        console.log(r);
      });
    });
  }

  async saveUser(userDto: CreateUserDto): Promise<User> {
    this.findUser(userDto.id).then((r) => {
      if (r == null) {
        const createdUser = new this.userModel(userDto);
        console.log('new user');
        return createdUser.save();
      } else {
        console.log('User already exists');
        return null;
      }
    });
    return null;
  }

  async findUser(id: String): Promise<User> {
    return this.userModel.findOne({ id: id }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  @Cron('* * * * * *')
  sendWeatherUpdates() {
    this.findAll().then((users) => {
      users.forEach((user) => {
        const query =
          'http://api.openweathermap.org/data/2.5/weather?q=' +
          user.city +
          '&appid=aa59028daae8ba01ab3074bf99165100';

        let resp = this.httpService.get(query);
        resp.toPromise().then((response) => {
          let res = response.data;
          const temp = Math.round(parseInt(res.main.temp_min) - 273.15);

          const pressure = Math.round(parseInt(res.main.pressure) - 1013.15);

          const rise = new Date(parseInt(res.sys.sunrise) * 1000);

          const set = new Date(parseInt(res.sys.sunset) * 1000);

          this.bot.sendMessage(
            user.id,
            '**** ' +
              res.name +
              ' ****\nTemperature: ' +
              String(temp) +
              '°C\nHumidity: ' +
              res.main.humidity +
              ' %\nWeather: ' +
              res.weather[0].description +
              '\nPressure: ' +
              String(pressure) +
              ' atm\nSunrise: ' +
              rise.toLocaleTimeString() +
              ' \nSunset: ' +
              set.toLocaleTimeString() +
              '\nCountry: ' +
              res.sys.country,
          );
        });
      });
    });
  }
}
