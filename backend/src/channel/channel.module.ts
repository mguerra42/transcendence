import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { UsersModule } from 'src/users/users.module';
import { DBModule } from 'src/db/db.module';

@Module({
    imports: [UsersModule, DBModule],
    controllers: [ChannelController],
    providers: [ChannelService],
    exports: [ChannelService],
})
export class ChannelModule {}
