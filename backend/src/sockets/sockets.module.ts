import { Module } from '@nestjs/common';
import { SocketsGateway } from './sockets.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { SocketController } from './socket.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { PongService } from 'src/pong/pong.service';
import { DBModule } from '../db/db.module';

@Module({
    imports: [AuthModule, UsersModule, ChannelModule, DBModule],
    providers: [SocketsGateway, PongService],
    controllers: [SocketController],
})
export class SocketsModule {}
