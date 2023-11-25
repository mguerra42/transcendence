import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Server, Socket } from 'socket.io';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChannelService } from '../channel/channel.service';
import { FriendService } from '../friend/friend.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://frontend:3000'],
        credentials: true,
    },
})
export class SocketsGateway {
    clients: object;
    status: object;
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private channelService: ChannelService,
        private friendService: FriendService,
    ) {
        this.clients = {};
        this.status = {};
    }

    @WebSocketServer()
    public server: Server;

    async handleConnection(client) {
        const cookies = client.handshake.headers.cookie
            ?.split(';')
            .map((c) => c.split('='));
        const access_token = cookies?.find((c) => c[0] === 'access_token');
        if (!access_token) {
            client.disconnect();
            return;
            // throw new Error('Access token not found');
        }
        const payload = await this.authService.validateToken(access_token[1]);
        if (!payload) {
            client.disconnect();
            // throw new Error('Invalid access token');
        }
        client.user = {
            id: payload.id,
            email: payload.email,
            username: payload.username,
        };
        this.clients[payload.id] = this.clients[payload.id] || [];
        this.clients[payload.id].push(client.id);
        this.subscribeUserToRoom(client.user.id, `everyone`);
        if (this.clients[payload.id].length === 1) {
            this.status[client.user.id] = 'online';
            this.server.in('everyone').emit('status', this.status);
        }
    }

    async handleDisconnect(client) {
        console.log('disconnect', client.user);
        this.clients[client.user.id] = this.clients[client.user.id].filter(
            (id) => id !== client.id,
        );

        if (this.clients[client.user.id].length === 0) {
            this.status[client.user.id] = 'offline';
            this.server.in('everyone').emit('status', this.status);
        }
    }

    async sendToUser(userId: string, event: string, data: any) {
        this.clients[userId]?.forEach((id) => {
            this.server.to(id).emit(event, data);
        });
    }
    async subscribeUserToRoom(userId: string, room: string) {
        this.clients[userId]?.forEach((id) => {
            this.server.sockets.sockets.get(id).join(room);
        });
    }

    async notification(userId: string, message: any, type = 'info') {
        if (typeof message === 'object') {
            type = message.type
                ? message.type
                : message.success === false
                ? 'error'
                : 'success';
            message = message.message;
        }

        this.sendToUser(userId, 'notification', { message, type });
    }

    @SubscribeMessage('conversations:list')
    async syncUserConversations(client: Socket & { user: any }, payload: any) {
        const conversations = await this.channelService.getUserConversations(
            client.user.id,
        );

        const answer = {
            conversations: await Promise.all(
                conversations.map(async (c: any) => {
                    const users = c.channel.users.map((u) =>
                        this.getChannelProfile(u),
                    );

                    c.channel.users = users;
                    const conv: Conversation = {
                        channelId: c.channel.id,
                        userId: c.userId,
                        role: c.role,
                        mutedUntil: c.mutedUntil,
                        bannedUntil: c.bannedUntil,
                        readUntil: c.readUntil,
                        message: c.message,
                        channel: c.channel,
                        user: this.getProfile(c.user),
                    };
                    this.subscribeUserToRoom(
                        client.user.id,
                        `conversation:${conv.channelId}`,
                    );
                    return conv;
                }),
            ),
        };
        this.sendToUser(client.user.id, 'conversations:list', answer);

        return answer;
    }

    @SubscribeMessage('conversations:sync')
    async syncUserConversation(client: Socket & { user: any }, payload: any) {
        const conversation = await this.channelService.getUserConversation(
            client.user.id,
            payload.channelId,
        );
        conversation.channel.users.forEach((u) => {
            //@ts-ignore
            u.online = this.clients[u.user.id]?.length > 0;
        });
        this.subscribeUserToRoom(
            client.user.id,
            `conversation:${conversation.channelId}`,
        );
        const answer = {
            conversation: conversation,
            show: payload.show || false,
        };
        this.sendToUser(client.user.id, 'conversations:sync', answer);

        return answer;
    }

    @SubscribeMessage('conversations:create')
    async createConversation(client: Socket & { user: any }, payload: any) {
        const { success, message, type, channel } =
            await this.channelService.createConversation(
                client.user.id,
                payload,
            );
        this.notification(client.user.id, { message, success, type });
        if (!success) return { success, message };
        this.syncUserConversation(client, {
            channelId: channel.id,
            show: true,
        });

        this.sendToUser(client.user.id, 'conversations:created', {
            channelId: channel.id,
        });

        return {
            channelId: channel.id,
        };
    }

    @SubscribeMessage('conversations:friend-request')
    async addFriend(client: Socket & { user: any }, payload: any) {
        console.log('get blockes users', client.user);
        const status = await this.channelService.addFriend(
            client.user.id,
            payload.userId,
        );
        this.notification(client.user.id, status);

        return status;
        //this.sendToUser(client.user.id, 'conversations:blocked', users);
        //console.log({ users });
    }
    @SubscribeMessage('conversations:friends')
    async getUserFriends(client: Socket & { user: any }, payload: any) {
        console.log('get blockes users', client.user);

        const friends = await this.friendService.getUserFriends(client.user.id);
        console.log('search friend', friends);

        this.sendToUser(client.user.id, 'conversations:friends', friends);
        console.log({ friends });
        return friends;
    }
    @SubscribeMessage('conversations:blocked')
    async getBlockedUsers(client: Socket & { user: any }, payload: any) {
        console.log('get blockes users', client.user);
        const users = await this.channelService.getBlockedUsers(client.user.id);
        this.sendToUser(client.user.id, 'conversations:blocked', users);
        console.log({ users });
        return users;
    }
    @SubscribeMessage('conversations:block')
    async blockUser(client: Socket & { user: any }, payload: any) {
        console.log('Block', client.user, payload);
        const status = await this.channelService.blockUser(
            client.user.id,
            payload.userId,
            payload.status,
        );
        this.sendToUser(client.user.id, 'conversations:block', status);

        this.notification(client.user.id, status);
        console.log(status);
        return status;
    }

    @SubscribeMessage('conversations:update')
    async updateConversation(client: Socket & { user: any }, payload: any) {
        console.log('create conversation', client.user, payload);
        const { success, message, type, channel } =
            await this.channelService.updateConversation(
                client.user.id,
                payload,
            );
        this.notification(client.user.id, { message, success, type });
        if (!success) return { success, message };
        this.syncUserConversation(client, {
            channelId: payload.channelId,
            show: true,
        });

        this.sendChannelEvent(payload.channelId, 'conversations:syncing', {
            channelId: payload.channelId,
        });
    }

    @SubscribeMessage('conversations:leave')
    async leaveConversation(client: any, payload: any) {
        const { success, message, channelId, last } =
            await this.channelService.leaveConversation(
                client.user.id,
                payload.channelId,
            );
        this.notification(client.user.id, { message, success });
        if (!success) return { success, message };
        this.clients[client.user.id]?.forEach((id) => {
            this.server.sockets.sockets
                .get(id)
                ?.leave(`conversation:${payload.channelId}`);
        });
        this.sendToUser(client.user.id, 'conversations:leave', {
            channelId: payload.channelId,
        });
        if (last !== true) {
            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${client.user.username} has left the channel`,
                timestamp: new Date(),
            });
            this.sendChannelEvent(channelId, 'conversations:left', {
                channelId: channelId,
                userId: client.user.id,
            });
        }

        return {
            success: true,
            channelId: channelId,
            message: 'You left the conversation',
        };
    }

    @SubscribeMessage('conversations:join')
    async joinConversation(client: any, payload: any) {
        const notification = await this.channelService.joinChannel(
            client.user.id,
            payload,
        );
        this.notification(client.user.id, notification);
        if (!notification.success) return notification;
        this.syncUserConversation(client, {
            channelId: payload.channelId,
            show: true,
        });

        this.sendMessage({
            channelId: payload.channelId,
            from: 0,
            content: `@${client.user.username} has joined the channel`,
            timestamp: new Date(),
        });
        this.sendToUser(client.user.id, 'conversations:join', {
            channelId: payload.channelId,
        });
        this.sendChannelEvent(payload.channelId, 'conversations:joined', {
            channelId: payload.channelId,
            userId: client.user.id,
        });
        //    this.sendChannelEvent(payload.channelId, 'conversations:syncing', {
        //        channelId: payload.channelId,
        //    });
    }

    @SubscribeMessage('conversations:messages')
    async getMessages(client: Socket & { user: any }, payload: any) {
        const messages = await this.channelService.getConversationMessages(
            client.user.id,
            payload.channelId,
        );

        return {
            messages: messages,
        };
    }

    @SubscribeMessage('conversations:message')
    async onMessage(client: Socket & { user: any }, payload: any) {
        const userChannel = await this.channelService.getUserChannel(
            client.user.id,
            payload.channelId,
        );

        if (userChannel) {
            if (
                userChannel.mutedUntil &&
                new Date(userChannel.mutedUntil) > new Date()
            ) {
                this.notification(client.user.id, {
                    message: 'You are muted until ' + userChannel.mutedUntil,
                    type: 'error',
                });
                return;
            }
            if (
                userChannel.bannedUntil &&
                new Date(userChannel.bannedUntil) > new Date()
            ) {
                this.notification(client.user.id, {
                    message: 'You are banned until ' + userChannel.bannedUntil,
                    type: 'error',
                });
                return;
            }
            this.sendMessage({
                channelId: payload.channelId,
                from: client.user.id,
                content: payload.message,
                timestamp: new Date(),
            });
        }
    }

    async sendMessage(messageData: any) {
        const message = await this.channelService.sendMessage(messageData);
        this.server
            .in(`conversation:${message.channelId}`)
            .emit('conversations:message', message);
    }
    async sendChannelEvent(channelID: number, type: string, data: any) {
        this.server.in(`conversation:${channelID}`).emit(type, data);
    }

    @SubscribeMessage('conversations:search')
    async searchConversation(client: Socket & { user: any }, payload: any) {
        console.log('search conversations', client.user);
        const channels = await this.channelService.searchChannel(
            client.user.id,
            payload,
        );
        this.sendToUser(client.user.id, 'conversations:search', channels);
        return channels;
    }

    getProfile(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            status: this.status[user.id] || 'offline',
            online: this.clients[user.id]?.length > 0,
            points: user.points,
            victories: user.victories,
            defeats: user.defeats,
        };
    }
    getChannelProfile(user) {
        return {
            userId: user.user.id,
            channelId: user.channelId,
            role: user.role,
            mutedUntil: user.mutedUntil,
            bannedUntil: user.bannedUntil,
            readUntil: user.readUntil,
            online: this.clients[user.user.id]?.length > 0,
            user: this.getProfile(user.user),
        };
    }

    @SubscribeMessage('conversations:search-friend')
    async searchFriend(client: Socket & { user: any }, payload: any) {
        if (!payload.query.length) return [];
        const users = await this.friendService.searchFriend(payload.query);
        console.log('search friend', users);

        return await Promise.all(users.map((user) => this.getProfile(user)));
        // const channels = await this.channelService.searchChannel(
        //   client.user.id,
        //   payload,
        // );
        // this.sendToUser(client.user.id, 'conversations:search-friend', channels);
        // return channels;
    }

    //@SubscribeMessage('channels:create')
    //async createChannel(client: any, payload: any) {
    //    const channel = await this.channelService.createChannel(
    //        client.user.id,
    //        payload,
    //    );

    //    this.notification(client.user.id, channel);
    //    if (channel.success === false) {
    //        console.log('Cannot create channel', channel);
    //    } else {
    //        this.syncUserConversations(client, {});
    //    }
    //}

    //   @SubscribeMessage('channels:join')
    //   async joinChannel(client: any, payload: any) {
    //     const channel = await this.channelService.joinChannel(
    //       client.user.id,
    //       payload,
    //     );
    //     this.sendToUser(client.user.id, 'channels:status', channel);
    //     if (channel.success === false) {
    //       console.log('Cannot join channel', channel);
    //     } else {
    //       this.syncUserConversations(client, {});
    //     }
    //   }
    //@SubscribeMessage('channels:leave')
    //async leaveChannel(client: any, payload: any) {
    //    const channel = await this.channelService.leaveChannel(
    //        client.user.id,
    //        payload,
    //    );
    //    this.sendToUser(client.user.id, 'channels:status', channel);
    //    if (channel.success === false) {
    //        console.log('Cannot leave channel', channel);
    //    } else {
    //        this.syncUserConversations(client, {});
    //    }
    //}

    //   @SubscribeMessage('channels:update')
    //   async updateChannel(client: any, payload: any) {
    //     const channel = await this.channelService.updateChannel(
    //       client.user.id,
    //       payload,
    //     );
    //     this.sendToUser(client.user.id, 'channels:status', channel);
    //     if (channel.success === false) {
    //       console.log('Cannot update channel', channel);
    //     } else {
    //       this.syncUserConversations(client, {});
    //     }
    //   }

    //   @SubscribeMessage('channels:search')
    //   async searchChannel(client: any, payload: any) {
    //     const channels = await this.channelService.searchChannel(
    //       client.user.id,
    //       payload,
    //     );
    //     this.sendToUser(client.user.id, 'channels:search', channels);
    //   }

    //   @SubscribeMessage('channels:list')
    //   async listUserChannel(client: Socket & { user: any }, payload: any) {
    //     console.log('get channel list', client.user);
    //     let channels = await this.channelService.getUserChannels(client.user.id);
    //     console.log(`User ${client.user.id} channels`, channels.length);
    //     channels = channels.map((x) => {
    //       console.log(x.channel.id, x.channel.name);
    //       x.channel.users.forEach((u) => {
    //         //@ts-ignore
    //         u.online = this.clients[u.user.id]?.length > 0;
    //       });
    //       x.channel.messages.sort((a, b) => a.id - b.id);
    //       client.join(`channels:${x.channelId}`);
    //       return x;
    //     });
    //     this.sendToUser(client.user.id, 'channels:list', channels);
    //   }

    //   @SubscribeMessage('dms:list')
    //   async listUserDm(client: any, payload: any) {
    //     console.log('check list dm', client.user, payload);
    //   }

    //@SubscribeMessage('sendPrivateMessage')
    //async handlePrivateMessage(client: any, payload: any) {
    //    try {
    //        if (payload.receiverId === undefined) {
    //            throw new Error('Receiver not defined');
    //        }
    //        const user = await this.userService.findOne(payload.receiverId);
    //        if (user === null) {
    //            throw new Error('User not found in database');
    //        }
    //        await this.userService.addMessage(client, payload);
    //        this.server.to(user.socketId).emit('receivePrivateMessage', {});
    //    } catch (e) {
    //        throw new WsException((e as Error).message);
    //    }
    //}

    //@SubscribeMessage('sendMessageToChannel')
    //async handleChannelMessage(client: any, payload: any) {
    //    //const userProfile = await this.userService.findByUsername(payload.sender);
    //    try {
    //        await this.channelService.addMessageInChannel(client, payload);
    //        this.server
    //            .to(payload.receiver)
    //            .emit('receiveMessageFromChannel', {});
    //    } catch (e) {
    //        throw new WsException((e as Error).message);
    //    }
    //}

    //@SubscribeMessage('joinChannel')
    //async handleJoinChannel(client: any, payload: any) {
    //    try {
    //        const channelToJoin = await this.channelService.findChannelByName(
    //            payload.receiver,
    //        );
    //        if (channelToJoin === null) {
    //            throw new Error('Channel not found in database');
    //        }
    //        const userToSubscribe = await this.userService.findByUsername(
    //            payload.sender,
    //        );
    //        if (userToSubscribe === null) {
    //            throw new Error('User not found in database');
    //        }
    //        let userIsInChannel = false;
    //        for (let i = 0; i < channelToJoin.userList.length; i++) {
    //            if (channelToJoin.userList[i].userId === userToSubscribe.id) {
    //                userIsInChannel = true;
    //            }
    //        }
    //        if (!userIsInChannel) {
    //            await this.channelService.addChannelUser(
    //                channelToJoin.id,
    //                userToSubscribe.id,
    //                'USER',
    //            );
    //        }
    //        client.join(payload.receiver);
    //        this.server.to(payload.receiver).emit('joinChannelResponse', {});
    //    } catch (e) {
    //        throw new WsException((e as Error).message);
    //    }
    //}

    //@SubscribeMessage('playerMovement')
    //handlePlayerMovement(client: any, payload: any) {
    //    this.server.emit('playerMovementResponse', {
    //        player: payload.player,
    //        move: payload.move,
    //        //gamelobby
    //    });
    //}

    //@SubscribeMessage('matchmakingConfirm')
    //handleMatchmakingDecline(client: any, payload: any) {
    //    this.server.emit('matchmakingConfirmResponse', {
    //        player: payload.player,
    //        confirm: payload.confirm,
    //        //gamelobby
    //    });
    //}

    //@SubscribeMessage('challengePlayer')
    //handleChallengePlayer(client: any, payload: any) {
    //    this.server.emit('challengePlayerResponse', {
    //        challenger: payload.challenger,
    //        lobbyId: payload.lobbyId,
    //        //gamelobby
    //    });
    //    console.log('gamelobby : ', payload.lobbyId);
    //}

    //@SubscribeMessage('abortMatch')
    //handleAbortMatch(client: any, payload: any) {
    //    this.server.emit('abortMatchResponse', {
    //        player: payload.player,
    //        //gamelobby
    //    });
    //}

    //@SubscribeMessage('updateBallPosition')
    //handleUpdateBallPosition(client: any, payload: any) {
    //    this.server.emit('updateBallPositionResponse', payload);
    //}

    //@SubscribeMessage('afk')
    //async handleDisconnection(client: any, payload: any) {
    //    try {
    //        const user = await this.userService.findByUsername(payload.sender);
    //        if (user !== null) {
    //            this.server.emit('afkResponse', {
    //                sender: payload.sender,
    //            });
    //            const userToUpdate: UpdateUserDto = {};
    //            userToUpdate.status = payload.text;
    //            await this.userService.update(user.id, userToUpdate);
    //        } else {
    //            throw new Error('User not found in database');
    //        }
    //    } catch (e) {
    //        throw new WsException((e as Error).message);
    //    }
    //}

    //@SubscribeMessage('refresh')
    //async handleRefresh(client: any, payload: any) {
    //    const channelUserList = await this.channelService.findChannelUserList(
    //        payload.channelId,
    //    );
    //    console.log('refresh in socket gateway');
    //    for (let i = 0; i < channelUserList.length; i++) {
    //        const user = await this.userService.findOne(
    //            channelUserList[i].userId,
    //        );
    //        console.log('refresh for user = ', user.username);
    //        this.server.to(user.socketId).emit('hasToRefresh', {});
    //    }
    //}

    //@SubscribeMessage('refreshPrivateChannel')
    //async handleRefreshPrivateChannel(client: any, payload: any) {
    //    console.log('refreshPrivateChannel in socket gateway');
    //    console.log('other user id = ', payload.otherUserId);
    //    const otherUser = await this.userService.findOne(payload.otherUserId);
    //    this.server.to(otherUser.socketId).emit('refreshPrivateChannel', {});
    //}

    //@SubscribeMessage('refreshUserProfile')
    //async handleRefreshUserProfile(client: any, payload: any) {
    //    console.log('refreshUserProfile in socket gateway');
    //    const currentUser = await this.userService.findOne(
    //        payload.currentUserId,
    //    );
    //    console.log('other user id = ', payload.otherUserId);
    //    const otherUser = await this.userService.findOne(payload.otherUserId);
    //    this.server.to(currentUser.socketId).emit('refreshUserProfile', {});
    //    this.server.to(otherUser.socketId).emit('refreshUserProfile', {});
    //}

    //@SubscribeMessage('deletePrivateChannel')
    //async handleDeletePrivateChannel(client: any, payload: any) {
    //    console.log('deletePrivateChannel in socket gateway');
    //    const currentUser = await this.userService.findOne(
    //        payload.currentUserId,
    //    );
    //    console.log('other user id = ', payload.otherUserId);
    //    const otherUser = await this.userService.findOne(payload.otherUserId);
    //    this.server.to(currentUser.socketId).emit('deletePrivateChannel', {
    //        currentUserId: payload.currentUserId,
    //        otherUserId: payload.otherUserId,
    //    });
    //    this.server.to(otherUser.socketId).emit('deletePrivateChannel', {
    //        currentUserId: payload.currentUserId,
    //        otherUserId: payload.otherUserId,
    //    });
    //}
}
