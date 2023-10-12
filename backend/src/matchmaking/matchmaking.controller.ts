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
    addPlayerToQueue(@Body() req:any){
        if (req.username === undefined)
            return null
        return this.userService.addUserToQueue(req.username); 
    }
    
    @Post ('removePlayerFromQueue')
    removePlayerToQueue(@Body() req:any){
        if (req.username === undefined)
            return null
        return this.userService.removeUserFromQueue(req.username); 
    }

    @Post ('setUserToWaiting')
    setPlayerToWaiting(@Body() req:any){
        if (req.username === undefined)
            return null
        return this.userService.setUserToWaitingMatch(req.username);
    }

    @Get ('getAllGameLobbies')
    getAllGameLobbies(){
        return this.userService.getAllGameLobbies();
    }

    @Post ('createGameLobby')
    createNewGameLobby(@Body() req:any){
        return  this.userService.createGameLobby(req.playerOneId, req.playerTwoId);
    }
 
    @Get ('getLobbiesForPlayer')
    getLobbiesForPlayer(@Query('playerId') playerId:string){
        return this.userService.getLobbiesForUser(parseInt(playerId, 10)); 
    }

    @Get ('getLobbyById')
    getLobbyById(@Query('lobbyId') lobbyId:string){
        return this.userService.getLobbyById(lobbyId); 
    }

    @Post ('deleteLobbyById')
    deleteLobbyById(@Body() req:any){
        return  this.userService.deleteLobbyById(req.lobbyId);
    }
}
