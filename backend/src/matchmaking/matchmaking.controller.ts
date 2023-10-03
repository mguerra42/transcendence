import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Controller('matchmaking')
export class MatchmakingController {
    constructor(
        private readonly userService: UsersService,
    ) {}

    @Get ('getNormalGameQueue')
    getNormalGameQueue(){
        return this.userService.getUsersFromQueue();
    }

    @Get ('getUserFromQueue')
    getUserfromQueue(@Query('playerUsername') playerUsername:string){
        return this.userService.getUserFromQueue(playerUsername); 
    }

    @Post ('addPlayerToQueue')
    addPlayerToQuueue(@Body() req:any){
        if (req.username === undefined)
            return null
        return this.userService.addUserToQueue(req.username); 
    }
}
