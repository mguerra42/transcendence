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

  async getPendingFriendRequests(userId: number): Promise<User[]> {
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

        // Filtrer les amis qui sont dans inverseFriends mais pas dans friends
        const pendingRequests = user.inverseFriends.filter(inverseFriend => {
            const foundFriend = user.friends.find(friend => friend.userTwo.id === inverseFriend.userOne.id);
            return foundFriend === undefined;
        });

        // Utilisez map pour extraire les demandes d'amis en attente complètes
        const pendingRequestsList = pendingRequests.map(inverseFriend => inverseFriend.userOne);

        return pendingRequestsList;
    } catch (error) {
        // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
        throw error;
    }
}

async getFriendRequestsReceived(userId: number): Promise<User[]> {
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

      // Filtrer les amis qui sont dans friends mais pas dans inverseFriends
      const friendRequestsReceived = user.friends.filter(friend => {
          const foundInverseFriend = user.inverseFriends.find(inverseFriend => inverseFriend.userOne.id === friend.userTwo.id);
          return foundInverseFriend === undefined;
      });

      // Utilisez map pour extraire les demandes d'amis reçues complètes
      const friendRequestsReceivedList = friendRequestsReceived.map(friend => friend.userTwo);

      return friendRequestsReceivedList;
  } catch (error) {
      // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
      throw error;
  }
}

async removeFriendship(currentId: number, friendUsername: string): Promise<void> {
    try {
        const friendId = await this.usersService.findByEmailOrUsername('', friendUsername);
      // Supprimez la relation d'amitié en utilisant les IDs des utilisateurs
      await this.prisma.friend.deleteMany({
        where: {
          OR: [
            { userOneId: currentId, userTwoId: friendId.id },
            { userOneId: friendId.id, userTwoId: currentId },
          ],
        },
      });
  
      console.log(`Relation d'amitié entre les utilisateurs avec les IDs ${currentId} et ${friendId} supprimée.`);
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la suppression d\'ami:', error);
      throw error;
    }
  }
}