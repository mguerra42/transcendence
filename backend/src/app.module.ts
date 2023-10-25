import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';
import { FriendModule } from './friend/friend.module';
import { MatchmakingController } from './matchmaking/matchmaking.controller';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

@Module({
  controllers: [AppController, MatchmakingController],
  providers: [AppService],
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
  ],
})
export class AppModule {}
