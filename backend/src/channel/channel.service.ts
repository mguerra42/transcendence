import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';
import slugify from 'slugify';

import * as bcrypt from 'bcryptjs';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelService {
    constructor(private db: DBService) {}

    async getUserConversations(userId: number) {
        const conversations = await this.db.channelUser.findMany({
            where: {
                userId,
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                readUntil: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        points: true,
                        victories: true,
                        defeats: true,
                        username: true,
                        avatar: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                userId: true,
                                bannedUntil: true,
                                mutedUntil: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        points: true,
                                        victories: true,
                                        defeats: true,
                                        username: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                channelId: 'desc',
            },
        });

        return conversations;
    }
    async getUserConversation(userId: number, channelId: number) {
        const conversation = await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                readUntil: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        points: true,
                        victories: true,
                        defeats: true,
                        username: true,
                        avatar: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                userId: true,
                                bannedUntil: true,
                                mutedUntil: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        points: true,
                                        victories: true,
                                        defeats: true,
                                        username: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return conversation;
    }

    async getConversationMessages(userId: number, channelId: number) {
        const conversation = await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
                bannedUntil: {
                    equals: null,
                },
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                readUntil: true,
            },
        });
        const unread = await this.db.message.findMany({
            where: {
                channelId: channelId,
                id: {
                    gt: conversation.readUntil,
                },
            },
            select: {
                id: true,
                channelId: true,
                content: true,
                from: true,
                timestamp: true,
            },
            orderBy: {
                id: 'desc',
            },
        });

        const read = await this.db.message.findMany({
            where: {
                channelId: channelId,
                id: {
                    lte: conversation.readUntil,
                },
            },
            select: {
                id: true,
                channelId: true,
                content: true,
                from: true,
                timestamp: true,
            },
            orderBy: {
                id: 'desc',
            },
            take: 50 + Math.abs(50 - unread.length),
            skip: 0,
        });

        return [...read, ...unread].sort((a, b) => a.id - b.id);
    }

    private sanitizeChannelName(name: string) {
        return slugify(name, {
            strict: true,
            lower: true,
        })
            .trim()
            .slice(0, 20);
    }

    async createConversation(userId: number, payload) {
        console.log('createConversation', { userId, payload });
        const channelName = this.sanitizeChannelName(payload.name);
        const exists = await this.db.channel.findFirst({
            where: {
                name: channelName,
            },
        });
        if (exists)
            return { success: false, message: 'Channel already exists' };
        const data = await this.prepareChannelData(payload, {});
        if (data.success === false) return data;
        const { name, description, type } = data;
        const createdChannel = await this.db.channel.create({
            data: {
                name,
                description,
                type,
                password: data.password,
                users: {
                    create: {
                        role: 'OWNER',
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                },
            },
        });
        const { password, ...channel } = createdChannel;

        return {
            success: true,
            message: `Channel #${name} created`,
            channel: channel,
        };
    }

    async updateConversation(userId: number, payload) {
        console.log({ userId, payload });
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        if (this.getChannelOwner(channel).userId != userId) {
            return {
                success: false,
                message: 'You are not the owner of this channel',
            };
        }
        const data = await this.prepareChannelData(payload, channel);
        if (data.success === false) return data;
        const { name, description, type, password } = data;
        const updatedChannel = await this.db.channel.update({
            where: {
                id: payload.channelId,
            },
            data: { name, description, type, password },
        });
        return {
            success: true,
            message: 'Channel updated',
        };
    }

    private getChannelOwner(channel) {
        return channel.users.find((u) => u.role == 'OWNER');
    }

    private async prepareChannelData(channel, previous = {} as any) {
        console.log({ channel, previous });
        const channelName = this.sanitizeChannelName(channel.name);
        channel.type = channel.type.toUpperCase();
        if (!previous?.name || previous.name != channelName) {
            const exists = await this.db.channel.findFirst({
                where: {
                    name: channelName,
                },
            });
            if (exists) {
                return {
                    success: false,
                    message: 'Channel already exists with that name',
                };
            }
            channel.name = channelName;
        }
        if (['PUBLIC', 'PRIVATE'].includes(channel.type)) {
            channel.password = null;
        }
        if (channel.type == 'PROTECTED' && channel.password?.length) {
            channel.password = bcrypt.hashSync(channel.password, 10);
        }
        if (channel.type == 'PROTECTED' && !channel.password?.length) {
            return {
                success: false,
                message: 'Password is required for protected channels',
            };
        }
        channel.description = channel.description.trim().slice(0, 160);
        return channel;
    }

    async leaveConversation(userId: number, channelId: number) {
        const channel = await this.db.channel.findFirst({
            where: {
                id: channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };

        const user = channel.users.find((u) => u.userId == userId);
        if (!user) return { success: true, message: 'Already left' };
        await this.db.channelUser.delete({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
        });
        if (user.role == 'OWNER') {
            let nextOwner = channel.users.find((u) => u.role == 'ADMIN');
            if (!nextOwner) {
                nextOwner = channel.users.find((u) => u.role == 'USER');
            }
            if (!nextOwner) {
                await this.db.channel.delete({
                    where: {
                        id: channelId,
                    },
                });
                return {
                    success: true,
                    last: true,
                    message:
                        'Channel left, no remaining members, so it was deleted',
                };
            }
            if (nextOwner) {
                // Transfer ownership to first admin
                await this.db.channelUser.update({
                    where: {
                        userId_channelId: {
                            userId: nextOwner.userId,
                            channelId: channelId,
                        },
                    },
                    data: {
                        role: 'OWNER',
                        mutedUntil: null,
                        bannedUntil: null,
                    },
                });
            }
        }
        return {
            success: true,
            message: 'Channel left',
            channelId: channelId,
        };
    }

    async getBlockedUsers(userId) {
        const blockedUsers = await this.db.blockedUser.findMany({
            where: {
                userId: userId,
            },
            select: {
                blockedId: true,
            },
        });
        return blockedUsers.map((u) => u.blockedId);
    }

    async acceptFriend(userId, friendId) {
        console.log({ userId, friendId });
        const exists = await this.db.friendship.findFirst({
            where: {
                fromId: friendId,
                toId: userId,
            },
        });

        if (!exists) {
            return {
                success: false,
                message: 'Friend request not found',
            };
        }

        await this.db.friendship.update({
            where: {
                fromId_toId: {
                    fromId: friendId,
                    toId: userId,
                },
            },
            data: {
                accepted: true,
            },
        });

        return {
            success: true,
            message: 'Friend request accepted',
        };
    }
    async declineFriend(userId, friendId) {
        const exists = await this.db.friendship.findFirst({
            where: {
                fromId: friendId,
                toId: userId,
            },
        });

        if (!exists) {
            return {
                success: false,
                message: 'Friend request not found',
            };
        }

        await this.db.friendship.delete({
            where: {
                fromId_toId: {
                    fromId: friendId,
                    toId: userId,
                },
            },
        });
        // delete channel users
        await this.db.channelUser.deleteMany({
            where: {
                channelId: exists.channelId,
            },
        });

        await this.db.channel.delete({
            where: {
                id: exists.channelId,
            },
        });

        return {
            success: true,
            message: 'Friend request declined',
        };
    }

    async toggleFriend(userId, friendId) {
        const exists = await this.db.friendship.findFirst({
            where: {
                fromId: userId,
                toId: friendId,
            },
        });

        if (exists) {
            await this.db.friendship.delete({
                where: {
                    fromId_toId: {
                        fromId: userId,
                        toId: friendId,
                    },
                },
            });
            // delete channel users
            await this.db.channelUser.deleteMany({
                where: {
                    channelId: exists.channelId,
                },
            });
            await this.db.channel.delete({
                where: {
                    id: exists.channelId,
                },
            });

            return {
                success: true,
                removed: true,
                channelId: exists.channelId,
                message: 'Removed friend',
            };
        }

        const channel = await this.db.channel.create({
            data: {
                name: `DM_${userId}_${friendId}`,
                description: ``,
                type: 'DM',
                users: {
                    create: [
                        {
                            role: 'USER',
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        },
                        {
                            role: 'USER',
                            user: {
                                connect: {
                                    id: friendId,
                                },
                            },
                        },
                    ],
                },
            },
        });

        await this.db.friendship.create({
            data: {
                fromId: userId,
                toId: friendId,
                channelId: channel.id,
                accepted: false,
            },
        });

        return {
            success: true,
            added: true,
            channelId: channel.id,
            message: 'Friend added, waiting for his confirmation',
        };
    }
    async blockUser(userId, blockedId, blocked) {
        if (!blocked) {
            await this.db.blockedUser.delete({
                where: {
                    userId_blockedId: {
                        userId: userId,
                        blockedId: blockedId,
                    },
                },
            });

            return {
                success: true,
                message: 'User unblocked',
            };
        } else {
            const exists = await this.db.blockedUser.findFirst({
                where: {
                    userId: userId,
                    blockedId: blockedId,
                },
            });
            console.log({ exists });
            if (exists) {
                return {
                    success: false,
                    message: 'User already blocked',
                };
            }
            await this.db.blockedUser.create({
                data: {
                    userId: userId,
                    blockedId: blockedId,
                },
            });

            return {
                success: true,
                message: 'User blocked',
            };
        }
    }

    //findAllChannels() {
    //    return this.db.channel.findMany();
    //}

    ////find a channel with the user id
    //async findChannels(id: number) {
    //    const channelsList = await this.db.channel.findMany({
    //        where: {
    //            userList: {
    //                some: {
    //                    userId: id,
    //                },
    //            },
    //        },
    //    });

    //    const ret = [];
    //    for (let i = 0; i < channelsList.length; i++) {
    //        ret[i] = channelsList[i];
    //        ret[i].onlineUsers = await this.db.channelUser.count({
    //            where: {
    //                channelId: channelsList[i].id,
    //                user: {
    //                    status: 'ONLINE',
    //                },
    //            },
    //        });
    //        ret[i].userCount = await this.db.channelUser.count({
    //            where: {
    //                channelId: channelsList[i].id,
    //            },
    //        });
    //    }
    //    return ret;
    //}

    //async findChannelUserList(id: number) {
    //    return await this.db.channelUser.findMany({
    //        where: {
    //            channelId: id,
    //        },
    //    });
    //}

    //findChannelById(id: number) {
    //    return this.db.channel.findUnique({
    //        where: {
    //            id,
    //        },
    //    });
    //}

    //findChannelByName(name: string) {
    //    return this.db.channel.findFirst({
    //        where: {
    //            name,
    //        },
    //        select: {
    //            id: true,
    //            name: true,
    //            creationDate: true,
    //            userList: true,
    //        },
    //    });
    //}

    //async findChannelHistory(body: any) {
    //    const messages = await this.db.message.findMany({
    //        where: {
    //            channelId: body.channelId,
    //        },
    //    });
    //    const ret = [];
    //    for (let i = 0; i < messages.length; i++) {
    //        ret[i] = messages[i];
    //        ret[i].user = await this.db.user.findUnique({
    //            where: {
    //                id: messages[i].senderId,
    //            },
    //        });
    //    }
    //    return ret;
    //}

    //async createChannel(name: string) {
    //    const channel = await this.db.channel.findUnique({
    //        where: {
    //            name,
    //        },
    //    });
    //    if (channel !== null) {
    //        throw new Error('Channel already exists');
    //        return null;
    //    }

    //    return this.db.channel.create({
    //        data: {
    //            name,
    //            access: 'PUBLIC',
    //        },
    //    });
    //}

    //async leaveChannel(channelId: number, userId: number) {
    //    const channelUser = await this.db.channelUser.deleteMany({
    //        where: {
    //            userId: userId,
    //            channelId: channelId,
    //        },
    //    });
    //    return channelUser;
    //    //supprimer le channel si plus personne dedans ???
    //}

    //async addMessageInChannel(client: any, payload: any) {
    //    const channel = await this.findChannelByName(payload.receiver);
    //    if (channel !== null && channel !== undefined) {
    //        const message = this.db.message.create({
    //            data: {
    //                content: payload.text,
    //                receiverId: null,
    //                senderId: payload.senderId,
    //                channelId: channel.id,
    //                //sender: { connect: { id: payload.userId } },
    //            },
    //        });
    //        return message;
    //    }
    //}

    //getUserInChannelUser(id: number) {
    //    return this.db.channelUser.findFirst({
    //        where: {
    //            userId: id,
    //        },
    //        select: {
    //            user: true,
    //        },
    //    });
    //}

    //addChannelUser(channelId: number, userId: number, role: Role) {
    //    return this.db.channelUser.create({
    //        data: {
    //            role,
    //            user: { connect: { id: userId } }, // Connect the user by ID
    //            channel: { connect: { id: channelId } }, // Connect the channel by ID
    //        },
    //    });
    //}

    async sendMessage(messageData) {
        return await this.db.message.create({
            data: messageData,
        });
    }

    async getUserChannel(userId: number, channelId: number) {
        return await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
            },
        });
    }

    async getUserChannels(userId: number) {
        return await this.db.channelUser.findMany({
            where: {
                userId,
            },
            select: {
                role: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                readUntil: true,
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                        messages: {
                            select: {
                                id: true,
                                content: true,
                                from: true,
                                timestamp: true,
                            },
                            take: 50,
                            orderBy: {
                                timestamp: 'desc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                channelId: 'desc',
            },
        });
    }
    //model Channel {
    //	id           Int           @id @default(autoincrement())
    //	name         String        @unique
    //	access       Access //public, private, protected
    //	password     String? //if access is defined as protected
    //	userList     ChannelUser[] //users in the channel        //lists mutes
    //	messages     Message[]     //messages in the channel
    //	creationDate DateTime      @default(now())
    //  }

    //  model ChannelUser {
    //	role        Role
    //	userId      Int
    //	user        User      @relation(fields: [userId], references: [id])
    //	channelId   Int
    //	channel     Channel   @relation(fields: [channelId], references: [id])
    //	bannedUntil DateTime? //if banned
    //	mutedUntil  DateTime? //if muted

    //	@@id([userId, channelId])
    //  }

    //User role in a channel
    //  enum Role {
    //	USER
    //	ADMIN
    //	OWNER
    //  }

    async searchChannel(userId, payload) {
        //payload.name
        const channels = await this.db.channel.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: payload.query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: payload.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                type: true,
                description: true,
                users: {
                    select: {
                        role: true,
                        userId: true,
                    },
                },
            },
        });

        return channels;
    }
    async updateChannel(userId, payload) {
        console.log({ userId, payload });
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        if (this.getChannelOwner(channel).userId != userId) {
            return {
                success: false,
                message: 'You are not the owner of this channel',
            };
        }
        const data = await this.prepareChannelData(payload.channel, channel);
        if (data.success === false) return data;
        const { name, description, type, password } = data;
        const updatedChannel = await this.db.channel.update({
            where: {
                id: payload.channelId,
            },
            data: { name, description, type, password },
        });
        return {
            success: true,
            message: 'Channel updated',
        };

        //console.log(updatedChannel);
    }

    async joinChannel(userId, payload) {
        console.log({ userId, payload });
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                password: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        const user = channel.users.find((u) => u.userId == userId);
        if (user) return { success: true, message: 'Already joined' };
        if (channel.type == 'PUBLIC') {
            await this.db.channelUser.create({
                data: {
                    role: 'USER',
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    channel: {
                        connect: {
                            id: payload.channelId,
                        },
                    },
                },
            });
        }
        if (channel.type == 'PRIVATE') {
            return {
                success: false,
                message: 'This channel is private',
            };
        }

        if (channel.type == 'PROTECTED') {
            if (!payload.password) {
                return {
                    success: false,
                    message: 'Password is required for protected channels',
                };
            }
            const passwordMatch = bcrypt.compareSync(
                payload.password,
                channel.password,
            );
            if (!passwordMatch) {
                return {
                    success: false,
                    message: 'Incorrect password',
                };
            }
            await this.db.channelUser.create({
                data: {
                    role: 'USER',
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    channel: {
                        connect: {
                            id: payload.channelId,
                        },
                    },
                },
            });
        }

        return {
            success: true,
            message: 'Channel joined',
        };
    }
}
