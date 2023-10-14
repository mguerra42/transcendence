import { Controller, Get, Post, Body } from '@nestjs/common';
//import { channelService } from './channel.service';
import { UsersService } from '../users/users.service';

@Controller('channel')
export class ChannelController {
    //constructor(private readonly channelService: channelService) {}
    constructor(private readonly userService: UsersService) {}

}
