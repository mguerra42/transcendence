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

    @Post('getchannels')
    async GetChannels(@Body() body: any) {
        const channelsList = await this.userService.findChannels(body.userId);
        return channelsList;
    }

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

    @Post('createchannel')
    async CreateChannel(@Body() body: { name: string }) {
        const channel = await this.userService.createChannel(body.name);
        return channel;
    }

    @Post('leavechannel')
    async LeaveChannel(
        @Body()
        body: {
            channelName: string;
            channelId: number;
            userId: number;
            userName: string;
        },
    ) {
        //console.log('in leaveChannel (socket.controller), body = ', body);
        const channelUser = await this.userService.leaveChannel(
            body.channelId,
            body.userId,
        );
        //console.log('in leaveChannel (socket.controller), channelUser = ', channelUser);
        return channelUser.count;
    }
}
