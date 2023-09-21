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

    @SubscribeMessage('test')
    async handleMessage(client: any, payload: any): Promise<string> {
        //console.log("Payload : ", payload);
        const userB = await this.userService.findByEmail(payload.text);
        //console.log("UserB : ", userB);
        this.server.to(userB.socketId).emit('fromserver', {
            yourdata: payload,
        });
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
            socketId?: string;
        }

        if (user != null) {
            //console.log('user found in the database : ', user.email);
            const userToUpdate: userToUpdateObject = {};
            userToUpdate.socketId = client.id;
            await this.userService.update(user.id, userToUpdate);
        }
        //else console.log('User not found in database');
    }
}
