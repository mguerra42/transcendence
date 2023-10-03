import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';

@Injectable()
export class ChannelService {
    constructor(private db: DBService) {}

    findAllChannels() {
        return this.db.channel.findMany();
    }
}
