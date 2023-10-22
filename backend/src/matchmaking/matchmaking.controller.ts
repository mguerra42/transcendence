import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Controller('matchmaking')
export class MatchmakingController {
    constructor(
        private readonly userService: UsersService,
    ) {}

    @Get ('getNormalGameQueue')
    async getNormalGameQueue(){        
        const res:any = await this.userService.getUsersFromQueue();
        console.log('players waiting for a game:')
        for(let i = 0; i < res.length; i++)
        {
            if(res[i].confirmed === 'waiting')
                console.log(res[i].username)
        }

        return res
    }

    @Get ('findAnOpponent')
    async findAnOpponent(@Query('playerLFG') playerLFG:string){
        const res:any = await this.userService.getUsersFromQueue();
        let playerLfgId = 0
        for (let j = 0; j < res.length; j++)
        {
            if (res[j].username === playerLFG)
                playerLfgId = res[j].profile.id
        }
        for(let i = 0; i < res.length; i++)
        {
            if(res[i].confirmed === 'idle' && res[i].username != playerLFG)
            {
                const match = {
                    playerOneId: playerLfgId,
                    playerTwoId: res[i].profile.id
                }
                const lobby = await this.createNewGameLobby(match)
                const ret = {
                    username: res[i].username,
                    lobbyId: lobby.lobbyId,
                    profile: res[i]
                }
                return ret
            }
        }
        return null
    }

    @Get ('getUserFromQueue')
    async getUserfromQueue(@Query('playerUsername') playerUsername:string){
        return await this.userService.getUserFromQueue(playerUsername); 
    }

    @Post ('addPlayerToQueue')
    async addPlayerToQueue(@Body() req:any){
        if (req.username === undefined)
            return null
        return await this.userService.addUserToQueue(req.username); 
    }
    
    @Post ('removePlayerFromQueue')
    async removePlayerToQueue(@Body() req:any){
        if (req.username === undefined)
            return null
        return await this.userService.removeUserFromQueue(req.username); 
    }

    @Post ('setUserQueueStatus')
    async setUserQueueStatus(@Body() req:any){
        if (req.username === undefined)
            return null
        return await this.userService.setUserQueueStatus(req.username, req.status);
    }

    @Post ('setQueueLobbyId')
    async setQueueLobby(@Body() req:any){
        if (req.username === undefined)
            return null
        return await this.userService.setQueueLobbyId(req.username, req.lobbyId);
    }

    @Get ('getAllGameLobbies')
    async getAllGameLobbies(){
        return await this.userService.getAllGameLobbies();
    }

    @Post ('createGameLobby')
    async createNewGameLobby(@Body() req:any){
        // const hasLobby:any = await this.getLobbiesForPlayer(req.playerOneId)
        // console.log(hasLobby)
        // console.log(hasLobby.length)
        // if (hasLobby.length > 0)
        // {
        //     console.log('ur already in a lobby')
        //     return null
        // }
        return await this.userService.createGameLobby(req.playerOneId, req.playerTwoId);
    }
 
    @Get ('getLobbiesForPlayer')
    async getLobbiesForPlayer(@Query('playerId') playerId:string){
        return await this.userService.getLobbiesForUser(parseInt(playerId, 10)); 
    }

    @Get ('getLobbyById')
    async getLobbyById(@Query('lobbyId') lobbyId:string){
        return await this.userService.getLobbyById(lobbyId); 
    }

    @Post ('deleteLobbyById')
    async deleteLobbyById(@Body() req:any){
        return  await this.userService.deleteLobbyById(req.lobbyId);
    }

    @Post ('getPlayersInGame')
    async getPlayersInGame(@Body() req:any){
        const lobbies = await this.userService.getLobbiesForUser(req.playerId);
        const lobby = lobbies[lobbies.length - 1]
        //console.log('lobby', lobby)
        const ret = {
            player1Name: '',
            player2Name: '',
            player1Score: lobby.playerOneScore,
            player2Score: lobby.playerTwoScore,
        }
        if (lobby.players[0].id < lobby.players[1].id)
        {
            ret.player1Name = lobby.players[0].username;
            ret.player2Name =  lobby.players[1].username;
        }
        else
        {
            ret.player1Name = lobby.players[1].username;
            ret.player2Name = lobby.players[0].username;
        }
        return ret
        
    }
}
