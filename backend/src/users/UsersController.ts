import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Get('getallchannels')
    async GetOnlineChannels() {
        console.log(
            '------------------------enter in channel.controller !------------------------------'
        );
        const channelsList = await this.usersService.findAllChannels();
        console.log('channel List = ', channelsList);
        return channelsList;
    }

}
