import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  },
})
export class SocketsGateway {
  constructor(private authService: AuthService) {}

  @WebSocketServer()
  public server: Server;

  @SubscribeMessage('test')
  handleMessage(client: any, payload: any): string {
    console.log('ws', payload, client.user);
    this.server.to(client.id).emit('fromserver', {
      yourdata: payload,
    });
    return 'Hello world!';
  }

  async handleConnection(client) {
    // Split all cookies and key/value pairs
    const cookies = client.handshake.headers.cookie
      .split(';')
      .map((c) => c.split('='));

    const access_token = cookies.find((c) => c[0] === 'access_token');

    if (!access_token) {
      client.disconnect();
      return;
    }
    const payload = await this.authService.validateToken(access_token[1]);

    !payload && client.disconnect(); // If token is invalid, disconnect

    client.user = {
      id: payload.sub,
      email: payload.email,
    };
  }
}
