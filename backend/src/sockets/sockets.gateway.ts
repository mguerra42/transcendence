import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChannelService } from '../channel/channel.service';

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
        private channelService: ChannelService,
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
            await this.channelService.addMessageInChannel(client, payload);
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
            const channelToJoin = await this.channelService.findChannelByName(
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
            let userIsInChannel = false;
            for (let i = 0; i < channelToJoin.userList.length; i++) {
                if (channelToJoin.userList[i].userId === userToSubscribe.id) {
                    userIsInChannel = true;
                }
            }
            if (!userIsInChannel) {
                await this.channelService.addChannelUser(
                    channelToJoin.id,
                    userToSubscribe.id,
                    'USER',
                );
            }
            client.join(payload.receiver);
            this.server.to(payload.receiver).emit('joinChannelResponse', {});
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
        console.log("we been here : ", payload.senderSocketId, payload.receiverSocketId)
        this.server.emit('matchmakingConfirmResponse', {
            player: payload.player,
            confirm: payload.confirm,
            //gamelobby
        });
    }

    @SubscribeMessage('challengePlayer')
    handleChallengePlayer(client: any, payload: any) {
        this.server.emit('challengePlayerResponse', {
            challenger: payload.challenger,
            lobbyId: payload.lobbyId,
            //gamelobby
        });
    }

    @SubscribeMessage('abortMatch')
    handleAbortMatch(client: any, payload: any) {
        this.server.emit('abortMatchResponse', {
            player: payload.player,
            //gamelobby
        });
    }
    
    @SubscribeMessage('updateBallPosition')
    handleUpdateBallPosition(client: any, payload: any) {
        this.server.emit('updateBallPositionResponse', payload);
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

    @SubscribeMessage('refresh')
    async handleRefresh(client: any, payload: any) {
        const channelUserList = await this.channelService.findChannelUserList(
            payload.channelId,
        );
        console.log('refresh in socket gateway')
        for (let i = 0; i < channelUserList.length; i++) {
            const user = await this.userService.findOne(
                channelUserList[i].userId,
            );
            console.log('refresh for user = ', user.username)
            this.server.to(user.socketId).emit('hasToRefresh', {});
        }
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
