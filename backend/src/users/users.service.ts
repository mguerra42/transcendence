import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'http2';

@Injectable()
export class UsersService {
    

    constructor(private db: DBService) {}
    async create(data: CreateUserDto) {
        const hash = bcrypt.hashSync(data.password, 10);
        data.password = hash;
        return this.db.user.create({
            data,
        });
    }

    findAll() {
        return this.db.user.findMany({
            //skip,
            //take,
            //cursor,
            //where,
            //orderBy,
        });
    }
    findOne(id: number) {
        return this.db.user.findUnique({
            where: {
                id,
            },
        });
    }
    findByEmail(email: string) {
        return this.db.user.findFirst({
            where: {
                email,
            },
        });
    }
    findByUsername(username: string) {
        return this.db.user.findFirst({
            where: {
                username,
            },
        });
    }
    findByEmailOrUsername(email: string, username: string) {
        return this.db.user.findFirst({
            where: {
                OR: [
                    {
                        email,
                    },
                    {
                        username,
                    },
                ],
            },
        });
    }
    findAllOnlineUsers() {
        return this.db.user.findMany({
            where: {
                status: 'ONLINE',
            },
        });
    }

    findAllUsers() {
        return this.db.user.findMany();
    }

    findAllOfflineUsers() {
        return this.db.user.findMany({
            where: {
                status: 'OFFLINE',
            },
        });
    }

    findChannelById(id: number) {
        return this.db.channel.findFirst({
            where: {
                id: id,
            },
        });
    }

    addUserToQueue(playerUsername: string) {
        return this.db.queue.create({
            data: {
                username: playerUsername,
            },
        });
    }

    async removeUserFromQueue(playerUsername: string) {
        //TODO : check if user exists before deleting for all delete functions
        const ret:any = await this.getUserFromQueue(playerUsername)
        if (ret !== null && ret !== undefined)
        {
            return await this.db.queue.delete({
                where: {
                    username: playerUsername,
                },
            });
        }
        return null
    }

    async setUserQueueStatus(playerUsername: string, status: string) {
        console.log('updating user status in user service')
        const ret:any = await this.db.queue.update({
            where: {
                username: playerUsername,
            },
            data: {
                confirmed: status,
            },
        });
        console.log(ret)
        return ret
    }

    setUserToConfirmMatch(playerUsername: string) {
        return this.db.queue.update({
            where: {
                username: playerUsername,
            },
            data: {
                confirmed: 'confirmed',
            },
        });
    }

    getUsersFromQueue() {
        return this.db.queue.findMany({
            select: {
                profile: true,
                username: true,
                confirmed: true,
            },
        });
    }

    getUserFromQueue(playerUsername: string) {
        return this.db.queue.findFirst({
            where: {
                username: playerUsername,
            },
            select: {
                profile: true,
            },
        });
    }

    getUserInGameFromQueue(playerUsername: string) {
        return this.db.queue.findFirst({
            where: {
                username: playerUsername,
                confirmed: 'in-game',
            },
            select: {
                profile: true,
            },
        });
    }

    getUsersInChannel(channelName: string) {
        return this.db.channel.findMany({
            where: {
                name: channelName,
            },
            select: {
                userList: true,
            },
        });
    }

    //Changed this to any but we can export the userToUpdateObject interface into this file
    //TODO : import userToUpdateObject interface here and use it instead of any
    update(id: number, data: UpdateUserDto) {
        //console.log(data);
        return this.db.user.update({
            data,
            where: {
                id,
            },
        });
    }
    remove(id: number) {
        return this.db.user.delete({
            where: {
                id,
            },
        });
    }
    formatUser(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
        };
    }

    generateRandomString(length: number): string {
        const characters =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWYZ-_.abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    getHistory(body: any) {
        const history = this.db.history.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                id: body.senderId,
                            },
                        },
                    },
                    {
                        users: {
                            some: {
                                id: body.receiverId,
                            },
                        },
                    },
                ],
            },
        });
        return history;
    }

    async findHistory(body: any) {
        const history = await this.getHistory(body);
        if (history === null) {
            return [];
        }
        const messages = await this.db.message.findMany({
            where: {
                receiverId: history.id,
            },
        });
        return messages;
    }

    async addMessage(client: any, payload: any) {
        const history = await this.getHistory(payload);
        if (history === null) {
            const newHistory = await this.db.history.create({
                data: {
                    users: {
                        connect: [
                            {
                                id: payload.senderId,
                            },
                            {
                                id: payload.receiverId,
                            },
                        ],
                    },
                },
            });
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    receiverId: newHistory.id,
                    senderId: payload.senderId,
                    channelId: null,
                },
            });
            return message;
        } else {
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    receiverId: history.id,
                    senderId: payload.senderId,
                    channelId: null,
                },
            });
            return message;
        }
    }

    async getAllGameLobbies() {
        return this.db.gameLobby.findMany({});
    }

    async getLobbyById(lobbyId: string) {
        return this.db.gameLobby.findUnique({
            where: {
                lobbyId: lobbyId,
            },
        });
    }

    async deleteLobbyById(gameLobbyId: string) {
        if (!gameLobbyId || typeof gameLobbyId !== 'string') {
            console.error('Invalid gameLobbyId');
            return null; // or throw an error, or handle it according to your use case
        }

        const existingLobby = await this.db.gameLobby.findUnique({
            where: {
                lobbyId: gameLobbyId,
            },
        });

        if (!existingLobby) {
            console.error(`GameLobby with ID ${gameLobbyId} not found.`);
            return null; // or throw an error, or handle it according to your use case
        }

        console.log('existingLobby', gameLobbyId);
        //TODO :  the lobby from the database
        return this.db.gameLobby.delete({
            where: {
                lobbyId: gameLobbyId,
            },
        });
        return null;
    }

    async getLobbiesForUser(userId: number) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: {
                gameLobby: {
                    include: {
                        players: true, // If you want to load player details
                    },
                },
            },
        });

        return user?.gameLobby || [];
    }

    async createGameLobby(playerOneId: number, playerTwoId: number) {
        const newGameLobbyId = uuidv4();
        return await this.db.gameLobby.create({
            data: {
                lobbyId: newGameLobbyId,
                players: {
                    connect: [{ id: playerOneId }, { id: playerTwoId }],
                },
                playerOneScore: '0',
                playerTwoScore: '0',
            },
        });
    }

    async createEndGame(
        winner: string,
        loser: string,
        winnerScore: number,
        loserScore: number,
    ) {
        const winnerUser = await this.db.user.findUnique({
            where: { username: winner },
        });

        const loserUser = await this.db.user.findUnique({
            where: { username: loser },
        });

        if (!winnerUser || !loserUser) {
            console.error('Invalid winner or loser');
            return null;
        }

        const newGame =  await this.db.game.create({
            data: {
                winner: {
                    connect: { id: winnerUser.id },
                },
                loser: {
                    connect: { id: loserUser.id },
                },
                winnerScore: winnerScore,
                loserScore: loserScore,
            },
        });

        await this.db.user.update({
            where: { username: winner },
            data: {
                victories: winnerUser.victories + 1,
            },
        });

        await this.db.user.update({
            where: { username: loser },
            data: {
                defeats: loserUser.defeats + 1,
            },
        });

        return newGame;
    }

    compare_id(a: any, b: any) {
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }
        return 0;
    }

    async getGameArray(playerId: number) {
        const user = await this.db.user.findUnique({
            where: { id: playerId },
            include: {
                wonGames: true,
                lostGames: true,
            },
        });

        const DBGames = user?.wonGames.concat(user?.lostGames) || [];
        DBGames.sort(this.compare_id);
        //trier par id !!

        const games = [];

        for (let i = 0; i < (DBGames.length); i++) {
            if (DBGames[i].winnerId === playerId) {
                games[i] = DBGames[i];
                games[i].winnerName = user?.username;
                const loser = await this.db.user.findUnique({
                    where: { id: DBGames[i].loserId },
                });
                games[i].loserName = loser?.username;
                //ajouter avatarpath ?
            }
            else if (DBGames[i].loserId === playerId) {
                games[i] = DBGames[i];
                games[i].loserName = user?.username;
                const winner = await this.db.user.findUnique({
                    where: { id: DBGames[i].winnerId },
                });
                games[i].winnerName = winner?.username;
                //ajouter avatarpath ?
            }
        }

        

        return games;
    }

    async findAnOpponent(playerLFG:string){
        const res:any = await this.getUsersFromQueue();
        let playerLfgId = 0
        let j = 0
        for (j = 0; j < res.length; j++)
        {
            if (res[j].username === playerLFG)
                playerLfgId = j
        }
        for(let i = 0; i < res.length; i++)
        {
            if(res[i].confirmed === 'idle' && res[i].username != playerLFG)
            {
                await this.setUserQueueStatus(playerLFG, 'challenged')
                await this.setUserQueueStatus(res[i].username, 'challenged')

                return {
                    player1: res[playerLfgId].profile,
                    player2: res[i].profile,
                }
            }
        }
        return null
    }
}
