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

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://frontend:3000'],
        credentials: true,
    },
})
export class SocketsGateway {
    clients: object;
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private channelService: ChannelService,
    ) {
        this.clients = {};
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
            id: payload.sub,
            email: payload.email,
        };
        console.log('connected', client.user);
        this.clients[payload.sub] = this.clients[payload.sub] || [];
        this.clients[payload.sub].push(client.id);
        console.log('clients', this.clients);

        //const user = await this.userService.findByEmail(payload.email);
        //if (user !== null) {
        //    const userToUpdate: UpdateUserDto = {};
        //    userToUpdate.socketId = client.id;
        //    userToUpdate.status = 'ONLINE';
        //    await this.userService.update(user.id, userToUpdate);
        //} else {
        //    // throw new Error('User not found in database');
        //}
        // } catch (e) {
        //     throw new WsException((e as Error).message);
        // }
    }

    async handleDisconnect(client) {
        console.log('disconnect', client.user);
        this.clients[client.user.id] = this.clients[client.user.id].filter(
            (id) => id !== client.id,
        );
    }

    @SubscribeMessage('channels:create')
    async createChannel(client: any, payload: any) {
		let channel = await this.channelService.createChannel(client.user.id, payload)
		if (channel === false) {
			console.log("name already exists")
		}
		this.listUserChannel(client, {})
    }

    @SubscribeMessage('channels:list')
    async listUserChannel(client: Socket & { user: any }, payload: any) {
		console.log("get channel lsit", client.user)
		let channels = await this.channelService.getUserChannels(client.user.id)
		console.log(`User ${client.user.id} channels`, channels.length)
		channels = channels.map(x => {
			console.log(x.channel)
			x.channel.users.forEach(u => {
				//@ts-ignore
				u.online = this.clients[u.user.id]?.length > 0
			})
			x.channel.messages.sort((a,b) => a.id - b.id)
			client.join(`channels:${x.channelId}`)
			return x
		})
		client.emit("channels:list", channels)
    }
    @SubscribeMessage('channels:message')
    async onNewMessage(client: any, payload: any) {
		let userChannel = await this.channelService.getUserChannel(client.user.id, payload.channelId)

		if (userChannel) {
			if (userChannel.mutedUntil && new Date(userChannel.mutedUntil) > new Date()) {
				console.log("User is muted, aborting")
				return
			}
			if (userChannel.bannedUntil && new Date(userChannel.bannedUntil) > new Date()) {
				console.log("User is banned, aborting")
				return
			}
			let messageData = {
				channelId: payload.channelId,
				from: client.user.id,
				content: payload.content,
				timestamp: new Date()
			}
			let message = await this.channelService.sendMessage(messageData)
			this.server.in(`channels:${payload.channelId}`).emit('channels:message', messageData)
		}
    }

    @SubscribeMessage('dms:list')
    async listUserDm(client: any, payload: any) {
        console.log('check list dm', client.user, payload);
    }

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
