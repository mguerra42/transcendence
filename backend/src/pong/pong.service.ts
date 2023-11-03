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
                playerOnePos: 0,
                playerTwoPos: 0,
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
                    console.log('updating ball position X from ', gameSession.gameState.ballPositionX, ' to ' , gameSession.gameState.ballPositionX + gameSession.gameState.velocityX)
                    gameSession.gameState.ballPositionX += gameSession.gameState.velocityX;
                    gameSession.gameState.ballPositionY += gameSession.gameState.velocityY;
                    
                    if (gameSession.gameState.ballPositionY > gameSession.gameState.canvasHeight -20 || gameSession.gameState.ballPositionY < 0)
                    {
                        gameSession.gameState.velocityY = gameSession.gameState.velocityY * -1;
                    }

                    if (gameSession.gameState.ballPositionX > gameSession.gameState.canvasWidth -20 || gameSession.gameState.ballPositionX < 0)
                    {
                        gameSession.gameState.velocityX = gameSession.gameState.velocityX * -1;
                    }
                    await new Promise((timeout) => setTimeout(timeout, 30));
                    i++;
                }
                gameSession.isGameLoopRunning = false; // Set the flag to false when the loop is done
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

    async startGameSession(gameId: string) {
        const gameSession = this.findGameSessionById(gameId);
        if (gameSession) {
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
