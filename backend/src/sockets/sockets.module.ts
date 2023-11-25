import { Module } from '@nestjs/common';
import { SocketsGateway } from './sockets.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { SocketController } from './socket.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { FriendModule } from 'src/friend/friend.module';

@Module({
    imports: [AuthModule, UsersModule, ChannelModule, FriendModule],
    providers: [SocketsGateway],
    controllers: [SocketController],
})
export class SocketsModule {}
