import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

interface userToUpdateObject {
    email?: string;
    password?: string;
    username?: string;
    avatarPath?: string;
    socketId?: string;
    status?: string;
}


@Injectable()
export class UsersService {
    constructor(private db: DBService) {}
    async create(data: CreateUserDto) {
        const hash = bcrypt.hashSync(data.password, 10);
        data.password = hash;
        return this.db.user.create({
            data,
        });
    }

    findAll() {
        return this.db.user.findMany({
            //skip,
            //take,
            //cursor,
            //where,
            //orderBy,
        });
    }
    findOne(id: number) {
        return this.db.user.findUnique({
            where: {
                id,
            },
        });
    }
    findByEmail(email: string) {
        return this.db.user.findFirst({
            where: {
                email,
            },
        });
    }
    findByUsername(username: string) {
        return this.db.user.findFirst({
            where: {
                username,
            },
        });
    }
    findByEmailOrUsername(email: string, username: string) {
        return this.db.user.findFirst({
            where: {
                OR: [
                    {
                        email,
                    },
                    {
                        username,
                    },
                ],
            },
        });
    }
    findAllOnlineUsers(){
        return this.db.user.findMany({
            where: {
                status: 'ONLINE',
            },
        });
    }

    findAllUsers(){
        return this.db.user.findMany();
    }

    findAllOfflineUsers(){
        return this.db.user.findMany({
            where: {
                status: 'OFFLINE',
            },
        });
    }

    findAllChannels(){
        return this.db.channel.findMany();
    }

    findChannelByName(name: string) {
        return this.db.channel.findFirst({
            where: {
                name,
            },
            select: {
                id: true,
                name: true,
                creationDate: true,
                userList: true,
            },
        });
    }
    
    addChannelUser(channelId: number, userId: number, role: Role) {
        return this.db.channelUser.create({
          data: {
            role,
            user: { connect: { id: userId } }, // Connect the user by ID
            channel: { connect: { id: channelId } }, // Connect the channel by ID
          },
        });
    }

    getUserInChannelUser(id: number) {
        return this.db.channelUser.findFirst({
            where: {
                userId: id,
            },
            select: {
                user: true,
            },
        });
    }

    getUsersInChannel(channelName: string) {
        return this.db.channel.findMany({
            where: {
                name: channelName,
            },
            select: {
                userList: true,
            },
        });
    }

    //Changed this to any but we can export the userToUpdateObject interface into this file
    //TODO : import userToUpdateObject interface here and use it instead of any
    update(id: number, data: userToUpdateObject) {
        //console.log(data);
        return this.db.user.update({
            data,
            where: {
                id,
            },
        });
    }
    remove(id: number) {
        return this.db.user.delete({
            where: {
                id,
            },
        });
    }
    formatUser(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
        };
    }

    generateRandomString(length: number): string {
        const characters =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWYZ-_.abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }
}
