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

  //PARTIAL BUGFIX 
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

    // Recup l'objet de l'utilisateur dont on va update la friendlist
    const friend = await this.usersService.findByEmail(user.email);

    // Vérifiez si l'ami n'est pas déjà dans la liste
    const isFriendAlreadyAdded = user.friends.some((friend:any) => friend.id === friendId);

    //recuperer sa friend list
    const friendlist = user.friends;
    
    //update sa friendlist
    //FIX PARTIEL : je maitrise pas la relation friends donc je laisse ca pour plus tard
    friendlist.push();

    //On cree une interface pour update l'objet user sans causer une erreur de type
    //FIX PARTIEL : A matcher avec la definition de l'objet userToUpdateDto dans le model
    interface userToUpdateObject {
      email?: string;
      password?: string;
      username?: string;
      avatarPath?: string;
      friends?: string;
      status?: string;
    }

      //On crée l'objet userToUpdate qui va contenir les infos a update
      const userToUpdate: userToUpdateObject = {};
      //FIX PARTIEL : a decommenter apres avoir fix la relation friends
      // userToUpdate.friends = friendlist;
      //On fait l'update
      await this.usersService.update(user.id, userToUpdate);
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

