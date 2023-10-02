// friend.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DBService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';
import { User } from '@prisma/client';

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

    // Créez une nouvelle entrée dans le modèle Friend
    await this.prisma.friend.create({
      data: {
        userOneId : currentUserId,
        userTwoId : friend.id,
      },
    });

    // // Mettez à jour la liste d'amis des deux utilisateurs
    // await this.updateUserFriends(userOneId, userTwoId);
    // await this.updateUserFriends(userTwoId, userOneId);
  }
  
  async getMutualFriends(userId: number): Promise<User[]> {
    try {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: {
                    include: {
                        userTwo: true
                    }
                },
                inverseFriends: {
                    include: {
                        userOne: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Filtrer les amis qui sont à la fois dans friends et inverseFriends
        const mutualFriends = user.friends.filter(friend => {
            const foundInverseFriend = user.inverseFriends.find(inverseFriend => inverseFriend.userOne.id === friend.userTwo.id);
            return foundInverseFriend !== undefined;
        });

        // Utilisez map pour extraire les amis mutuels complets
        const mutualFriendsList = mutualFriends.map(friend => friend.userTwo);

        return mutualFriendsList;
    } catch (error) {
        // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
        throw error;
    }
}

  // async getFriendList(userId: number): Promise<{ id: number; username: string }[]> {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //       include: { friends: { include: { userTwo: true } } },
  //     });
  
  //     if (!user) {
  //       throw new Error('Utilisateur non trouvé');
  //     }
  
  //     // Utilisez map pour extraire les amis userTwo avec uniquement id et username
  //     const friendsUserTwo = user.friends.map(friend => friend.userTwo);
  
  //     return friendsUserTwo;
  //   } catch (error) {
  //     // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
  //     throw error;
  //   }
  // }

  async getInverseFriendList(userId: number): Promise<{ id: number; username: string }[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { friends: { include: { userTwo: true } } },
      });
  
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
  
      // Use map to extract userTwo from friends
      const friendsUserTwo = user.friends.map((friend) => friend.userTwo);
  
      // Get all users except the current user and the user's friends
      const allUsers = await this.prisma.user.findMany({
        where: {
          NOT: [
            { id: userId }, // Exclude the current user
            { id: { in: friendsUserTwo.map((friend) => friend.id) } }, // Exclude friends
          ],
        },
        select: {
          id: true,
          username: true,
        },
      });
  
      return allUsers;
    } catch (error) {
      // Handle errors (e.g., user not found)
      throw error;
    }
  }

  // async getPendingFriendList(userId: number): Promise<{ id: number; username: string }[]> {
  //   try {
  //       const user = await this.prisma.user.findUnique({
  //           where: { id: userId },
  //           include: { friends: { include: { userTwo: true } } },
  //       });

  //       if (!user) {
  //           throw new Error('Utilisateur non trouvé');
  //       }

  //       // Utilize map to extract the friends' userTwo with only id and username
  //       const friendsUserTwo = user.friends.map(friend => friend.userTwo);

  //       // Filter out friends who have an inverseFriends relationship with the current user
  //       const filteredFriends = friendsUserTwo.filter(friend => {
  //           const hasInverseFriend = friend.inverseFriends.some(inverseFriend => inverseFriend.id === userId);
  //           return !hasInverseFriend;
  //       });

  //       return filteredFriends.map(friend => ({ id: friend.id, username: friend.username }));
  //   } catch (error) {
  //       // Handle errors (e.g., user not found)
  //       throw error;
  //   }
  // }
 
  // //PARTIAL BUGFIX 
  // private async updateUserFriends(userId: number, friendId: number): Promise<void> {
  //   // Obtenez l'utilisateur actuel
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: userId,
  //     },
  //     include: {
  //       friends: true, // Assurez-vous d'inclure la relation "friends"
  //     },
  //   });

  //   // Recup l'objet de l'utilisateur dont on va update la friendlist
  //   const friend = await this.usersService.findByEmail(user.email);

  //   // Vérifiez si l'ami n'est pas déjà dans la liste
  //   const isFriendAlreadyAdded = user.friends.some((friend:any) => friend.id === friendId);

  //   //recuperer sa friend list
  //   const friendlist = user.friends;
    
  //   //update sa friendlist
  //   //FIX PARTIEL : je maitrise pas la relation friends donc je laisse ca pour plus tard
  //   friendlist.push();

  //   //On cree une interface pour update l'objet user sans causer une erreur de type
  //   //FIX PARTIEL : A matcher avec la definition de l'objet userToUpdateDto dans le model
  //   interface userToUpdateObject {
  //     email?: string;
  //     password?: string;
  //     username?: string;
  //     avatarPath?: string;
  //     friends?: string;
  //     status?: string;
  //   }

  //     //On crée l'objet userToUpdate qui va contenir les infos a update
  //     const userToUpdate: userToUpdateObject = {};
  //     //FIX PARTIEL : a decommenter apres avoir fix la relation friends
  //     // userToUpdate.friends = friendlist;
  //     //On fait l'update
  //     await this.usersService.update(user.id, userToUpdate);
  // }
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

