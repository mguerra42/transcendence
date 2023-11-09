import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';
import slugify from 'slugify';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChannelService {
    constructor(private db: DBService) {}

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

	async sendMessage(messageData)
	{
		return await this.db.message.create({
			data: messageData
		})
	}

	async getUserChannel(userId: number, channelId: number)
	{
		return await this.db.channelUser.findFirst({
			where: {
				userId,
				channelId
			}
		})
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
				channel: {
					select : {
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
										username: true
									}
								}
							}
						},
						messages: {
							select: {
								id: true,
								content: true,
								from: true,
								timestamp: true
							},
							take: 50,
							orderBy: {
								timestamp: 'desc'
							}
						}
					}
				}
			},
			orderBy: {
				channelId: 'desc'
			}
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
    async createChannel(ownerId, payload) {
        const channelName = slugify(payload.name, {
            strict: true,
            lower: true,
        });
        const exists = await this.db.channel.findFirst({
            where: {
                name: channelName,
            },
        });
        if (exists) return false;
        const type = payload.type.toUpperCase();
        const channel = await this.db.channel.create({
            data: {
                name: channelName,
                type,
                password:
				type == 'PROTECTED'
                        ? bcrypt.hashSync(payload.password, 10)
                        : undefined,
                description: payload.description,
                users: {
                    create: {
                        role: 'OWNER',
                        user: {
                            connect: {
                                id: ownerId,
                            },
                        },
                    },
                },
            },
        });
    }
}
