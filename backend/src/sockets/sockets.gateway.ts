import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';
import { channel } from 'diagnostics_channel';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://frontend:3000'],
        credentials: true,
    },
})
export class SocketsGateway {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {}

    @WebSocketServer()
    public server: Server;

    @SubscribeMessage('sendPrivateMessage')
    async handlePrivateMessage(client: any, payload: any) {
        try {
            if (payload.receiverId === undefined) {
                throw new Error('Receiver not defined');
            }
            const user = await this.userService.findOne(payload.receiverId);
            if (user === null) {
                throw new Error('User not found in database');
            }
            await this.userService.addMessage(client, payload);
            this.server.to(user.socketId).emit('receivePrivateMessage', {});
        } catch (e) {
            throw new WsException((e as Error).message);
        }
    }

    @SubscribeMessage('sendMessageToChannel')
    async handleChannelMessage(client: any, payload: any) {
        //const userProfile = await this.userService.findByUsername(payload.sender);
        try {
            await this.userService.addMessageInChannel(client, payload);
            this.server
                .to(payload.receiver)
                .emit('receiveMessageFromChannel', {});
        } catch (e) {
            throw new WsException((e as Error).message);
        }
    }

    @SubscribeMessage('joinChannel')
    async handleJoinChannel(client: any, payload: any) {
        try {
            // console.log('in  (socket.gateway) - payload = ',payload);
            const channelToJoin = await this.userService.findChannelByName(
                payload.receiver,
            );
            if (channelToJoin === null) {
                throw new Error('Channel not found in database');
            }
            const userToSubscribe = await this.userService.findByUsername(
                payload.sender,
            );
            if (userToSubscribe === null) {
                throw new Error('User not found in database');
            }
            let onlineUsersInChannel = 0;
            let userIsInChannel = false;
            for (let i = 0; i < channelToJoin.userList.length; i++) {
                const res = await this.userService.getUserInChannelUser(
                    channelToJoin.userList[i].userId,
                );
                if (res.user.status === 'ONLINE') onlineUsersInChannel++;
                if (channelToJoin.userList[i].userId === userToSubscribe.id) {
                    userIsInChannel = true;
                }
            }
            if (!userIsInChannel) {
                await this.userService.addChannelUser(
                    channelToJoin.id,
                    userToSubscribe.id,
                    'USER',
                );
            }
            client.join(payload.receiver);
            this.server.to(payload.receiver).emit('joinChannelResponse', {
                userCount: channelToJoin.userList.length,
                onlineUsersInChannel: onlineUsersInChannel,
            });
        } catch (e) {
            throw new WsException((e as Error).message);
        }
    }

    @SubscribeMessage('playerMovement')
    handlePlayerMovement(client: any, payload: any) {
        this.server.emit('playerMovementResponse', {
            player: payload.player,
            move: payload.move,
            //gamelobby
        });
    }

    @SubscribeMessage('matchmakingConfirm')
    handleMatchmakingDecline(client: any, payload: any) {
        this.server.emit('matchmakingConfirmResponse', {
            player: payload.player,
            confirm: payload.confirm,
            //gamelobby
        });
    }

    @SubscribeMessage('afk')
    async handleDisconnection(client: any, payload: any) {
        try {
            const user = await this.userService.findByUsername(payload.sender);
            if (user !== null) {
                this.server.emit('afkResponse', {
                    sender: payload.sender,
                });
                const userToUpdate: UpdateUserDto = {};
                userToUpdate.status = payload.text;
                await this.userService.update(user.id, userToUpdate);
            } else {
                throw new Error('User not found in database');
            }
        } catch (e) {
            throw new WsException((e as Error).message);
        }
    }

    @SubscribeMessage('refreshChannel')
    async handleRefreshChannel(client: any, payload: any) {
        const user = await this.userService.findByUsername(payload.sender);
        this.server.to(user.socketId).emit('hasToRefreshChannel', {});
    }

    async handleConnection(client) {
        // try {
        // Split all cookies and key/value pairs
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
        };
        const user = await this.userService.findByEmail(payload.email);
        if (user !== null) {
            const userToUpdate: UpdateUserDto = {};
            userToUpdate.socketId = client.id;
            userToUpdate.status = 'ONLINE';
            await this.userService.update(user.id, userToUpdate);
        } else {
            // throw new Error('User not found in database');
        }
        // } catch (e) {
        //     throw new WsException((e as Error).message);
        // }
    }
}
