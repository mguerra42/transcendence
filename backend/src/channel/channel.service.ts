import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';
import { Access } from '@prisma/client';

@Injectable()
export class ChannelService {
    constructor(private db: DBService) {}

    async findAllChannels() {
        const channelList = await this.db.channel.findMany({
            select: {
                id: true,
                name: true,
                access: true,
            },
        });
        return channelList;
    }

    //find a channel with the user id
    async findChannels(id: number) {
        const channelsList = await this.db.channel.findMany({
            where: {
                userList: {
                    some: {
                        userId: id,
                    },
                },
            },
        });

        const ret = [];
        for (let i = 0; i < channelsList.length; i++) {
            ret[i] = channelsList[i];
            ret[i].onlineUsers = await this.db.channelUser.count({
                where: {
                    channelId: channelsList[i].id,
                    user: {
                        status: 'ONLINE',
                    },
                },
            });
            ret[i].userCount = await this.db.channelUser.count({
                where: {
                    channelId: channelsList[i].id,
                },
            });
        }
        return ret;
    }

    async findChannelUserList(id: number) {
        return await this.db.channelUser.findMany({
            where: {
                channelId: id,
            },
        });
    }

    findChannelById(id: number) {
        return this.db.channel.findUnique({
            where: {
                id,
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
                access: true,
                password: true,
            },
        });
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

    async createChannel(name: string, access: Access, password: string) {
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
                access,
                password,
            },
        });
    }

    async leaveChannel(channelId: number, userId: number) {
        const channelUser = await this.db.channelUser.deleteMany({
            where: {
                userId: userId,
                channelId: channelId,
            },
        });
        return channelUser;
        //supprimer le channel si plus personne dedans ???
    }

    async addMessageInChannel(client: any, payload: any) {
        const channel = await this.findChannelByName(payload.receiver);
        if (channel !== null && channel !== undefined) {
            const message = this.db.message.create({
                data: {
                    content: payload.text,
                    receiverId: null,
                    senderId: payload.senderId,
                    channelId: channel.id,
                    //sender: { connect: { id: payload.userId } },
                },
            });
            return message;
        }
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

    addChannelUser(channelId: number, userId: number, role: Role) {
        return this.db.channelUser.create({
            data: {
                role,
                user: { connect: { id: userId } }, // Connect the user by ID
                channel: { connect: { id: channelId } }, // Connect the channel by ID
            },
        });
    }
}
