import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('socket')
export class SocketController {
    constructor(private readonly userService: UsersService){}

    @Get('getonlineusers')
    async GetOnlineUsers() {
        const onlineUsersArray = await this.userService.findAllOnlineUsers();
        return onlineUsersArray;
    }
}
