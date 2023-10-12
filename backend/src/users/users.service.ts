import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';


import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

    findAllChannels() {
        return this.db.channel.findMany();
    }

    findChannels(id: number) {
        return this.db.channel.findMany({
            where: {
                userList: {
                    some: {
                        userId: id,
                    },
                },
            },
        });
    }

    findChannelByName(name: string) {
        return this.db.channel.findFirst({
            where: {
                name,
            },
            select: {
                id: true,
                name: true,
                creationDate: true,
                userList: true,
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

    addChannelUser(channelId: number, userId: number, role: Role) {
        return this.db.channelUser.create({
            data: {
                role,
                user: { connect: { id: userId } }, // Connect the user by ID
                channel: { connect: { id: channelId } }, // Connect the channel by ID
            },
        });
    }

    getUserInChannelUser(id: number) {
        return this.db.channelUser.findFirst({
            where: {
                userId: id,
            },
            select: {
                user: true,
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

    removeUserFromQueue(playerUsername: string) {
        return this.db.queue.delete({
                where: {
                    username: playerUsername,
                },
        });
    }

    setUserToWaitingMatch(playerUsername: string){
        return this.db.queue.update({
            where: {
              username: playerUsername,
            },
            data: {
              confirmed: 'waiting',
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

    getUserFromQueue(playerUsername:string) {
        return this.db.queue.findFirst({
            where: {
                username: playerUsername,
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

    async findChannelHistory(body: any) {
        const messages = await this.db.message.findMany({
            where: {
                channelId: body.channelId,
            },
        });
        const ret = [];
        for (let i = 0; i < messages.length; i++) {
            ret[i] = messages[i];
            ret[i].user = await this.db.user.findUnique({
                where: {
                    id: messages[i].senderId,
                },
            });
        }
        return ret;
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

    async addMessageInChannel(client: any, payload: any) {
        //console.log('in addMessageInChannel (user.service) - payload = ', payload);
        const channel = await this.findChannelByName(payload.receiver);
        if (channel !== null && channel !== undefined) {
            //console.log('in addMessageInChannel (user.service) - channel is not null, id = ',channel.id);
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    receiverId: null,
                    senderId: payload.senderId,
                    channelId: channel.id,
                    //sender: { connect: { id: payload.userId } },
                },
            });
            //console.log('in addMessageInChannel (user.service) - message created : ',message);
            return message;
        }
    }

    async createChannel(name: string) {
        const channel = await this.db.channel.findUnique({
            where: {
                name,
            },
        });
        if (channel !== null) {
            throw new Error('Channel already exists');
            return null;
        }

        return this.db.channel.create({
            data: {
                name,
                access: 'PUBLIC',
            },
        });
    }

    async leaveChannel(channelId: number, userId: number) {
        console.log('in leaveChannel (user.service)');
        const channelUser = await this.db.channelUser.deleteMany({
            where: {
                userId: userId,
                channelId: channelId,
            },
        });
        return channelUser;
        //supprimer le channel si plus personne dedans ???
    }

    async getGameLobby() {
        return this.db.gameLobby.findMany({
        });
    }
    
    async createGameLobby(playerOneId: number, playerTwoId: number) {
        let newGameLobbyId = uuidv4();
        return await this.db.gameLobby.create({
            data: {
                lobbyId: newGameLobbyId,
                players: {
                    connect: [
                        { id: playerOneId },
                        { id: playerTwoId }
                    ]
                }
            }
        });
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
}
