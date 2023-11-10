import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { UsersModule } from '../users/users.module';
import { DBModule } from 'src/db/db.module';

@Module({
  imports: [UsersModule, DBModule],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
