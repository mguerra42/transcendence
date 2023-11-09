import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { PongService } from 'src/pong/pong.service';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChannelService } from '../channel/channel.service';
import { find } from 'rxjs';

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
        private pongService: PongService,
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
        if (payload.move === 'UP')
            this.pongService.moveUp(payload.gameId, payload.player)
        else
            this.pongService.moveDown(payload.gameId, payload.player)
    }

    @SubscribeMessage('matchmakingConfirm')
    handleMatchmakingDecline(client: any, payload: any) {
        this.server.emit('matchmakingConfirmResponse', {
            lobby: payload.lobby,
            player: payload.player,
            confirm: payload.confirm,
            //gamelobby
        });
    }

    @SubscribeMessage('quitMatchButton')
    handlequitMatchButton(client: any, payload: any) {
        this.server.emit('quitMatchButtonResponse', {
            player: payload.player,
            lobbyId: payload.lobbyId
        });
    }

    @SubscribeMessage('readyForMatchmaking')
    async handleReadyForMatchmaking(client: any, payload: any) {
        if (payload.mode === 'ranked'){
            const playerProfile:any = await this.userService.findAnOpponent(payload.player);
            if (playerProfile !== null)
            {
                this.server.emit('readyForMatchmakingResponse', {
                    lobbyId: this.pongService.newGameSession(playerProfile.player1, playerProfile.player2, payload.mode),
                    player1: playerProfile.player1.username,
                    player2: playerProfile.player2.username,
                });
            }
        }
        if (payload.mode === 'normal'){
            const playerOneProfile = await this.userService.findByUsername(payload.player)
            const playerTwoProfile = await this.userService.findByUsername(payload.opponent)
            if (playerOneProfile !== null && playerTwoProfile !== null){
                if (playerOneProfile.username !== payload.player && playerTwoProfile.username !== payload.opponent){
                    return ;
                }
                this.server.emit('readyForMatchmakingResponse', {
                    lobbyId: this.pongService.newGameSession(playerOneProfile, playerTwoProfile, payload.mode),
                    player1: payload.player,
                    player2: payload.opponent,
                });
            }
        }
    }

    @SubscribeMessage('getGameState')
    async handleGetGameState(client: any, payload: any) {
        const ret:any  = await this.pongService.getGameState(payload.gameId)
        console.log("game state : ", ret)
        this.server.emit('getGameStateResponse', {
            gameState: ret,
            gameId: payload.gameId
        });
    }

    @SubscribeMessage('getActiveGameSessions')
    async handleGetActiveGameSessions(client: any, payload: any) {
        const ret:any  = await this.pongService.getActiveGameSessionsNumber()
        this.server.emit('getActiveGameSessionsResponse', {
            response: ret
        });
    }

    @SubscribeMessage('resumeGame')
    async handleResumeGame(client: any, payload: any) {
        const ret:any  = await this.pongService.isPlayerInGame(payload.username)
        if (ret !== null){
            this.server.emit('resumeGameResponse', {
                gameState: ret.gameState,
                gameId: ret.gameId
            });
        }
        else {
            this.server.emit('resumeGameResponse', null)
        }
    }

    @SubscribeMessage('cancelFriendlyMatch')
    async handleCancelFriendlyMatch(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('cancelFriendlyMatchResponse', payload)
    }

    @SubscribeMessage('startFriendlyMatchCountdown')
    async handleStartFriendlyMatchCountdown(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('startFriendlyMatchCountdownResponse', payload)
    }

    startFriendlyMatchCountdown
    @SubscribeMessage('sendGameInvite')
    async handleSendGameInvite(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('sendGameInviteResponse', payload)
    }

    @SubscribeMessage('acceptGameInvite')
    async handleAcceptGameInvite(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('acceptGameInviteResponse', payload)
    }

    @SubscribeMessage('declineGameInvite')
    async handleDeclineGameInvite(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('declineGameInviteResponse', payload)
    }

    @SubscribeMessage('inviteExpired')
    async handleInviteExpired(client: any, payload: any) {
        // await this.pongService.abortMatch(payload.lobbyId, payload.username)
        this.server.emit('inviteExpiredResponse', payload)
    }

    @SubscribeMessage('opponentForfeit')
    async handleOpponentForfeit(client: any, payload: any) {
        await this.pongService.abortMatch(payload.lobbyId, payload.username, payload.mode)
        this.server.emit('opponentForfeitResponse', payload)
    }

    @SubscribeMessage('deleteGameSession')
    async handleDeleteGameSession(client: any, payload: any) {
        const ret:any  = await this.pongService.deleteGameSession(payload.gameId)
    }

    @SubscribeMessage('stopGameSession')
    async handleStopGameSession(client: any, payload: any) {
        const ret:any  = await this.pongService.stopGameSession(payload.gameId)
    }

    @SubscribeMessage('startGameSession')
    async handleStartGameSession(client: any, payload: any) {
        const ret:any  = await this.pongService.startGameSession(payload.gameId)
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

    @SubscribeMessage('refreshPrivateChannel')
    async handleRefreshPrivateChannel(client: any, payload: any) {

        console.log('refreshPrivateChannel in socket gateway')
        console.log("other user id = ", payload.otherUserId);
        const otherUser = await this.userService.findOne(
            payload.otherUserId
        );
        this.server.to(otherUser.socketId).emit('refreshPrivateChannel', {});
    }

    @SubscribeMessage('refreshUserProfile')
    async handleRefreshUserProfile(client: any, payload: any) {

        console.log('refreshUserProfile in socket gateway')
        const currentUser = await this.userService.findOne(
            payload.currentUserId
        );
        console.log("other user id = ", payload.otherUserId);
        const otherUser = await this.userService.findOne(
            payload.otherUserId
        );
        this.server.to(currentUser.socketId).emit('refreshUserProfile', {});
        this.server.to(otherUser.socketId).emit('refreshUserProfile', {});
    }

    @SubscribeMessage('deletePrivateChannel')
    async handleDeletePrivateChannel(client: any, payload: any) {

        console.log('deletePrivateChannel in socket gateway')
        const currentUser = await this.userService.findOne(
            payload.currentUserId
        );
        console.log("other user id = ", payload.otherUserId);
        const otherUser = await this.userService.findOne(
            payload.otherUserId
        );
        this.server.to(currentUser.socketId).emit('deletePrivateChannel',{
            currentUserId: payload.currentUserId,
            otherUserId: payload.otherUserId
        });
        this.server.to(otherUser.socketId).emit('deletePrivateChannel', {
            currentUserId: payload.currentUserId,
            otherUserId: payload.otherUserId
        });
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
