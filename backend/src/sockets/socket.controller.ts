import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { find } from 'rxjs';
//import { ChannelService } from '../channel/channel.service';

@Controller('socket')
export class SocketController {
    constructor(
        private readonly userService: UsersService,
       // private channelService: ChannelService,
    ) {}

    @Get('getonlineusers')
    async GetOnlineUsers() {
        const onlineUsersArray = await this.userService.findAllOnlineUsers();
        return onlineUsersArray;
    }

    @Get('getallusers')
    async GetAllUsers() {
        const allUsersArray = await this.userService.findAllUsers();
        return allUsersArray;
    }

    @Get('getofflineusers')
    async GetOfflineUsers() {
        const offlineUsersArray = await this.userService.findAllOfflineUsers();
        return offlineUsersArray;
    }

    @Get('getallchannels')
    async GetOnlineChannels() {
        //console.log(
        //    '------------------------enter in channel.controller !------------------------------',
        //);
        //const channelsList = await this.channelService.findAllChannels();
        const channelsList = await this.userService.findAllChannels();
        //console.log('channel List = ', channelsList);
        return channelsList;
    }

    // export class HistoryDto {
    //     channelName: string;
    //     history: string;
    // }

    @Post('gethistory')
    async GetHistory(@Body() body: any) {
        const history = await this.userService.findHistory(body);
        //console.log('in getHistory (socket.controller), history = ', history);
        return history;
    }

    @Post('getchannelhistory')
    async GetChannelHistory(@Body() body: any) {
        //console.log('in getChannelHistory (socket.controller), body = ', body);
        const history = await this.userService.findChannelHistory(body);
        //console.log('in getChannelHistory (socket.controller), history = ',history);
        return history;
    }
}
