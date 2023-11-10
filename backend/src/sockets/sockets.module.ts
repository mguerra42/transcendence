import { Module } from '@nestjs/common';
import { SocketsGateway } from './sockets.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { SocketController } from './socket.controller';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
    imports: [AuthModule, UsersModule, ChannelModule],
    providers: [SocketsGateway],
    controllers: [SocketController],
})
export class SocketsModule {}
