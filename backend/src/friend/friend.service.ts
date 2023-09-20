// friend.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaClient,
    private usersService: UsersService,
  ) {}

  async addFriend(currentUserId: number, newFriendUsername: string): Promise<void> {
    // Recherchez l'ami par nom d'utilisateur
    const friend = await this.usersService.findByEmailOrUsername('', newFriendUsername);

    if (!friend) {
      // L'ami n'a pas été trouvé dans la base de données, gérer l'erreur ici
      throw new Error(`L'ami avec le nom d'utilisateur ${newFriendUsername} n'a pas été trouvé.`);
    }

    // Utilisez l'ID de l'ami pour créer la relation d'amitié
    await this.prisma.friend.create({
      data: {
        userOneId: currentUserId,
        userTwoId: friend.id,
      },
    });
  }

  // Ajoutez d'autres méthodes pour gérer les amis ici en utilisant le modèle Prisma
}

