import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SocketsGateway } from 'src/sockets/sockets.gateway';
import { UsersModule } from 'src/users/users.module';
import { SocketsModule } from 'src/sockets/sockets.module';
import { DBService } from 'src/db/db.service';
import { DBModule } from 'src/db/db.module';
import { PongService } from './pong.service';

@Module({
    imports: [DBModule],
    controllers: [],
    providers: [UsersService, PongService],
    exports: [PongService],
  })
export class PongModule {}
