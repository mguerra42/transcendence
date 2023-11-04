import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'http2';


interface GameSession {
    gameId: string;
    gameState: any;
    isGameLoopRunning: boolean; // Add a flag
    stopGameLoop: () => void;
    startGameLoop: () => void;
    endRound: (roundWinner:string) => void;
}

@Injectable()
export class PongService {
    constructor(private db: DBService) {}

    private activeGameSessions: GameSession[] = [];

    newGameSession(playerProfile:any, opponentProfile:any): string {
        const gameId = uuidv4();
        let gameSession: GameSession = {
            gameId,
            gameState: {
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
                velocityX: 5,
                velocityY: 5,
            },

            isGameLoopRunning: false, // Initialize the flag as false
            startGameLoop: async () => {
                if (gameSession.isGameLoopRunning) {
                    console.log(gameSession.gameState.playerOneName ,' - Game loop is already running');
                    return ;
                }
                
                gameSession.isGameLoopRunning = true;
                let i = 0;
                while (gameSession.isGameLoopRunning) {
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
                    await new Promise((timeout) => setTimeout(timeout, 30));
                    i++;
                }
                gameSession.isGameLoopRunning = false; // Set the flag to false when the loop is done
            },

            endRound: async (roundWinner:string) => {
                if (roundWinner === gameSession.gameState.playerOneName){
                    gameSession.gameState.playerOneScore += 1
                }
                else {
                    gameSession.gameState.playerTwoScore += 1
                }
                gameSession.gameState.ballPositionX = 400;
                gameSession.gameState.ballPositionY = 300;
                gameSession.gameState.playerOnePos = 20,
                gameSession.gameState.playerTwoPos = 20,
                await new Promise (timeout => setTimeout(timeout, 1000))
            },

            stopGameLoop: () => {
                gameSession.isGameLoopRunning = false;
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
                if (gameSession.gameState.playerTwoPos > 10){
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
                if (gameSession.gameState.playerTwoPos < 600 - 70 - 10){
                    gameSession.gameState.playerTwoPos += 10
                }
            }
        }
    }

    async startGameSession(gameId: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
            console.log('new gameLoop in session : ', gameSession)
            gameSession.startGameLoop();
        }
    }

    stopGameSession(gameId: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
            gameSession.stopGameLoop();
        }
        // TODO: Delete the game session after stopping
    }

}
