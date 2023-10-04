import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

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
        //console.log('in getHistory (user.service) -  body = ', body);
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
        //body.userId = body.senderId;
        console.log('in findHistory (user.service) - body = ', body);
        const history = await this.getHistory(body);
        if (history === null) {
            console.log('in findHistory (user.service) - history is null');
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
        //console.log('in addMessage (user.service) - payload = ', payload);
        const history = await this.getHistory(payload);
        //console.log('in addMessage (user.service) - history = ', history);
        if (history === null) {
            //console.log('in addMessage (user.service) - history is null');
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
            //console.log('in addMessage (user.service) - newHistory = ',newHistory);
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    //senderId: payload.userId,
                    receiverId: newHistory.id,
                    senderId: payload.senderId,
                    channelId: null,
                },
            });
            //console.log('in addMessage (user.service) - message created : ',message,);
            return message;
        } else {
            //console.log('in addMessage (user.service) - history is not null, id = ',history.id);
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    receiverId: history.id,
                    senderId: payload.senderId,
                    channelId: null,
                    //sender: { connect: { id: payload.userId } },
                },
            });
            //console.log('in addMessage (user.service) - message created : ',message);
            return message;
        }
    }

    async addMessageInChannel(client: any, payload: any) {
        //console.log('in addMessageInChannel (user.service) - payload = ', payload);
        const channel = await this.findChannelByName(payload.receiver);
        if (channel !== null) {
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
}
