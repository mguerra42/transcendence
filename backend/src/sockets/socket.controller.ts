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

    @Get('getallusers')
    async GetAllUsers() {
        const allUsersArray = await this.userService.findAllUsers();
        return allUsersArray;
    }

    @Get('getofflineusers')
    async GetOfflineUsers() {
        const offlineUsersArray = await this.userService.findAllOfflineUsers();
        return offlineUsersArray;
    }
}
