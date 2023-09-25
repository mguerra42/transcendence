// friend.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DBService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class FriendService {
  constructor(
    private prisma: DBService,
    private usersService: UsersService,
  ) {}

  async addFriend(currentUserId: number, newFriendUsername: string): Promise<void> {
    const friend = await this.usersService.findByEmailOrUsername('', newFriendUsername);

    if (!friend) {
      throw new Error(`L'ami avec le nom d'utilisateur ${newFriendUsername} n'a pas été trouvé.`);
    }

    // Obtenez les ID des deux utilisateurs impliqués
    const userOneId = currentUserId;
    const userTwoId = friend.id;

    // Créez une nouvelle entrée dans le modèle Friend
    await this.prisma.friend.create({
      data: {
        userOneId,
        userTwoId,
      },
    });

    // Mettez à jour la liste d'amis des deux utilisateurs
    await this.updateUserFriends(userOneId, userTwoId);
    await this.updateUserFriends(userTwoId, userOneId);
  }

  private async updateUserFriends(userId: number, friendId: number): Promise<void> {
    // Obtenez l'utilisateur actuel
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        friends: true, // Assurez-vous d'inclure la relation "friends"
      },
    });

    // Vérifiez si l'ami n'est pas déjà dans la liste
    const isFriendAlreadyAdded = user.friends.some((friend) => friend.id === friendId);

    if (!isFriendAlreadyAdded) {
      // Ajoutez l'ami à la liste
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          friends: {
            connect: {
              id: friendId,
            },
          },
        },
      });
    }
  }
}



// const friendCreateInput = {
//   userOneId: currentUserId,
//   userTwoId: friend.id,
//   userOne: { connect: { id: currentUserId } },
//   userTwo: { connect: { id: friend.id } },
// };
// await this.prisma.friend.create({
//   data: friendCreateInput,
// });

