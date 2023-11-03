import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';
import { PongModule } from './pong/pong.module';

import { FriendModule } from './friend/friend.module';
import { MatchmakingController } from './matchmaking/matchmaking.controller';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { PongService } from './pong/pong.service';

@Module({
  controllers: [AppController, MatchmakingController],
  providers: [AppService, PongService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DBModule,
    UsersModule,
    AuthModule,
    SocketsModule,
    FriendModule,
    MatchmakingModule,
    PongModule,
  ],
})
export class AppModule {}
