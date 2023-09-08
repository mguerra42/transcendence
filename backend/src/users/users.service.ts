import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

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

    findByUsername(username: string) {
        return this.db.user.findFirst({
            where: {
                username,
            },
        });
    }

    update(id: number, data: UpdateUserDto) {
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
}
