import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User, Prisma, Role } from '@prisma/client';
// import { SocketsGateway } from 'src/sockets/sockets.gateway';

import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'http2';


interface GameSession {
    gameId: string;
    gameState: any;
    stopGameLoop: () => void;
    startGameLoop: () => void;
    endRound: (roundWinner:string) => void;
}

@Injectable()
export class PongService {
    constructor(
        private userService: UsersService,
        ) {}

    private activeGameSessions: GameSession[] = [];

    newGameSession(playerProfile:any, opponentProfile:any): string {
        const gameId = uuidv4();
        let gameSession: GameSession = {
            gameId,
            gameState: {
                running : false,
                playerOneProfile : playerProfile,
                playerTwoProfile : opponentProfile,
                playerOneName: playerProfile.username,
                playerTwoName: opponentProfile.username,
                playerOnePos: 20,
                playerTwoPos: 20,
                playerOneScore: 0,
                playerTwoScore: 0,
                ballPositionX: 400,
                ballPositionY: 300,
                canvasWidth: 800,
                canvasHeight: 600,
                velocityX: 4,
                velocityY: 4,
            },

            startGameLoop: async () => {
                if (gameSession.gameState.running) {
                    console.log(gameSession.gameState.playerOneName ,' - Game loop is already running');
                    return ;
                }
                
                let i = 0;
                gameSession.gameState.running = true
                while (gameSession.gameState.running) {
                    gameSession.gameState.ballPositionX += gameSession.gameState.velocityX;
                    gameSession.gameState.ballPositionY += gameSession.gameState.velocityY;

                    //Bounds logic
                    if (gameSession.gameState.ballPositionY > gameSession.gameState.canvasHeight -20 || gameSession.gameState.ballPositionY < 0)
                    {
                        gameSession.gameState.velocityY = gameSession.gameState.velocityY * -1;
                    }

                    if (gameSession.gameState.ballPositionX > gameSession.gameState.canvasWidth + 20){
                        await gameSession.endRound(gameSession.gameState.playerOneName)
                    }
                    
                    if (gameSession.gameState.ballPositionX < -20){
                        await gameSession.endRound(gameSession.gameState.playerTwoName)
                    }
                    //Player collision logic
                    if  (
                        (gameSession.gameState.ballPositionX <= 20 + 14 &&
                        (gameSession.gameState.ballPositionY >=  gameSession.gameState.playerOnePos && gameSession.gameState.ballPositionY <=  gameSession.gameState.playerOnePos + 70))
                    ){
                        gameSession.gameState.velocityX = gameSession.gameState.velocityX * -1;
                    }

                    //Player collision logic
                    if  (
                        (gameSession.gameState.ballPositionX >= 800 - 35 - 14 &&
                        (gameSession.gameState.ballPositionY >=  gameSession.gameState.playerTwoPos && gameSession.gameState.ballPositionY <=  gameSession.gameState.playerTwoPos + 70))
                    ){
                        gameSession.gameState.velocityX = gameSession.gameState.velocityX * -1;
                    }

                    await new Promise((timeout) => setTimeout(timeout, 1000/60));
                    i++;
                }
                gameSession.gameState.running = false;
            },

            endRound: async (roundWinner:string) => {
                if (roundWinner === gameSession.gameState.playerOneName){
                    gameSession.gameState.playerOneScore += 1
                }
                else {
                    gameSession.gameState.playerTwoScore += 1
                }
                gameSession.gameState.ballPositionX = 400
                gameSession.gameState.ballPositionY = 300
                gameSession.gameState.playerOnePos = 20
                gameSession.gameState.playerTwoPos = 20

                if (gameSession.gameState.playerOneScore === 5 || gameSession.gameState.playerTwoScore === 5){
                    this.userService.createEndGame(gameSession.gameState)
                    gameSession.gameState.running = false
                }
                else {
                    await new Promise (timeout => setTimeout(timeout, 1000))
                }
            },

            stopGameLoop: () => {
                gameSession.gameState.running = false;
            },
        };

        this.activeGameSessions.push(gameSession);
        return gameId;
    }

    getGameState(gameId) {
        const ret = this.findGameSessionById(gameId)
        if (ret === null)
            return null
        return ret.gameState
    }

    findGameSessionById(gameId: string) {
        for (let i = 0; i < this.activeGameSessions.length; i++) {
            if (this.activeGameSessions[i].gameId === gameId) {
                return this.activeGameSessions[i];
            }
        }
        return null;
    }

    moveUp(gameId: string, player:any) {
        const gameSession = this.findGameSessionById(gameId)
        if (gameSession)
        {
            if (player === gameSession.gameState.playerOneName && gameSession.gameState.playerOnePos > 10){
                gameSession.gameState.playerOnePos -= 10
            }
            else {
                if (player === gameSession.gameState.playerTwoName && gameSession.gameState.playerTwoPos > 10){
                    gameSession.gameState.playerTwoPos -= 10
                }
            }
        }
    }

    moveDown(gameId: string, player:any) {
        const gameSession = this.findGameSessionById(gameId)
        if (gameSession)
        {
            if (player === gameSession.gameState.playerOneName && gameSession.gameState.playerOnePos < 600 - 70 - 10){
                gameSession.gameState.playerOnePos += 10
            }
            else{
                if (player === gameSession.gameState.playerTwoName && gameSession.gameState.playerTwoPos < 600 - 70 - 10){
                    gameSession.gameState.playerTwoPos += 10
                }
            }
        }
    }

    async startGameSession(gameId: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
            gameSession.startGameLoop();
        }
    }

    abortMatch(gameId: string, forfeitPlayer: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
            gameSession.stopGameLoop();
            if (gameSession.gameState.playerOneName === forfeitPlayer){
                gameSession.gameState.playerOneScore = 0
                gameSession.gameState.playerTwoScore = 5
            }
            else{
                gameSession.gameState.playerOneScore = 5
                gameSession.gameState.playerTwoScore = 0
            }
            this.userService.createEndGame(gameSession.gameState)
            this.deleteGameSession(gameId)
        }
    }

    stopGameSession(gameId: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
            gameSession.stopGameLoop();
        }
    }

    deleteGameSession(gameId: string) {
        const index = this.activeGameSessions.findIndex((gameSession) => gameSession.gameId === gameId);
        if (index !== -1) {
            this.activeGameSessions.splice(index, 1);
        }
    }

    getActiveGameSessionsNumber () {
        return this.activeGameSessions.length
    }

    isPlayerInGame (username : string){
        for (const game of this.activeGameSessions){
            if (game.gameState.playerOneName === username || game.gameState.playerTwoName === username){
                if (game.gameState.running === true){
                    return {
                        gameState: game.gameState,
                        gameId: game.gameId
                    }
                }
                this.deleteGameSession(game.gameId)
                return null
            }
        }
        return null
    }

}
