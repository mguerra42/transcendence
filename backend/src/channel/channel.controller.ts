import { Controller, Get } from '@nestjs/common';
//import { channelService } from './channel.service';
import { UsersService } from '../users/users.service';

@Controller('channel')
export class ChannelController {
    //constructor(private readonly channelService: channelService) {}
    constructor(private readonly userService: UsersService) {}

    @Get('getallchannels')
    async GetOnlineChannels() {
        console.log(
            '------------------------enter in channel.controller !------------------------------',
        );
        const channelsList = await this.userService.findAllChannels();
        console.log('channel List = ', channelsList);
        return channelsList;
    }
}
