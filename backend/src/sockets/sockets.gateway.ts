import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';

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

    @SubscribeMessage('chatBox')
    async handleMessage(client: any, payload: any): Promise<string> {
        //console.log('SOCKET GATEWAY payload = ', payload);
        //console.log("socket from " , payload.sender, " to ", payload.receiver, " : ", payload.text );
        const user = await this.userService.findByUsername(payload.receiver);
        if (user !== null && payload.receiver !== undefined) {
            this.server.to(user.socketId).emit('chatBoxResponse', {
                yourdata: payload.text,
                sender: payload.sender,
            });
        } else console.log('User not found in database');

        return 'Hello world!';
    }

    @SubscribeMessage('afk')
    async handleDisconnection(client: any, payload: any): Promise<string> {
        const user = await this.userService.findByUsername(payload.sender);
        if (user !== null) {
            this.server.emit('afkResponse', {
                sender: payload.sender,
            });
        } else console.log('User not found in database');

        interface userToUpdateObject {
            email?: string;
            password?: string;
            username?: string;
            avatarPath?: string;
            socketId?: string;
            status?: string;
        }
        if (user != null) {
            const userToUpdate: userToUpdateObject = {};
            userToUpdate.status = payload.text;
            await this.userService.update(user.id, userToUpdate);
        }
        return 'Hello world!';
    }

    async handleConnection(client) {
        // Split all cookies and key/value pairs
        const cookies = client.handshake.headers.cookie
            ?.split(';')
            .map((c) => c.split('='));

        const access_token = cookies?.find((c) => c[0] === 'access_token');

        if (!access_token) {
            client.disconnect();
            return;
        }

        //console.log('access_token = ', access_token[1]);
        const payload = await this.authService.validateToken(access_token[1]);
        !payload && client.disconnect(); // If token is invalid, disconnect

        client.user = {
            id: payload.id,
            email: payload.email,
        };

        //console.log('payload = ', payload);
        const user = await this.userService.findByEmail(payload.email);

        interface userToUpdateObject {
            email?: string;
            password?: string;
            username?: string;
            avatarPath?: string;
            socketId?: string;
            status?: string;
        }

        if (user != null) {
            //console.log('user found in the database : ', user.email, user.socketId);
            const userToUpdate: userToUpdateObject = {};
            userToUpdate.socketId = client.id;
            userToUpdate.status = 'ONLINE';
            await this.userService.update(user.id, userToUpdate);
            //console.log('new socket id : ' + client.id);
        }
        //else
        //console.log('User not found in database');
        //TO DO = supprimer le cookie si l'user est null (pas dans la db)
    }
}
