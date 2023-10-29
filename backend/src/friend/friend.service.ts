// friend.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DBService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';
import { User } from '@prisma/client';
import * as levenshtein from 'fast-levenshtein';

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

    if (friend.id === currentUserId) {
        throw new Error(`Erreur : vous ne pouvez pas vous ajouter vous même en ami.`);
      }
    
    // Vérifier si une relation "friend" existe déjà entre les deux utilisateurs pour l'utilisateur actuel
    const existingFriendship = await this.prisma.friend.findFirst({
        where: {
          userOneId: currentUserId,
          userTwoId: friend.id,
        },
      });
      
      if (existingFriendship) {
        throw new Error(`Vous avez déjà ajouté l'utilisateur ${newFriendUsername} en tant qu'ami précédemment.`);
      }

    // Créez une nouvelle entrée dans le modèle Friend
    await this.prisma.friend.create({
      data: {
        userOneId : currentUserId,
        userTwoId : friend.id,
      },
    });
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
        const friendUser = await this.usersService.findByEmailOrUsername('', friendUsername);
      // Supprimez la relation d'amitié en utilisant les IDs des utilisateurs
      await this.prisma.friend.deleteMany({
        where: {
          OR: [
            { userOneId: currentId, userTwoId: friendUser.id },
            { userOneId: friendUser.id, userTwoId: currentId },
          ],
        },
      });
  
      console.log(`Relation d'amitié entre les utilisateurs avec les IDs ${currentId} et ${friendUsername} supprimée.`);
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la suppression d\'ami:', error);
      throw error;
    }
  }

  async isJustFriend(currentId: number, friendName : string): Promise<Boolean> {
    const friendUser = await this.usersService.findByEmailOrUsername('', friendName);
    const existingFriendship = await this.prisma.friend.findFirst({
      where: {
        userOneId: currentId,
        userTwoId: friendUser.id,
      },
    });
    
    if (existingFriendship)
      return true;
    return false;
    }


async areMutualFriends(currentUserId: number, otherUserName: string): Promise<boolean> {
  try {
      // Recherche de l'utilisateur par nom
      const otherUser = await this.prisma.user.findUnique({
          where: { username: otherUserName },
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

      if (!otherUser) {
          throw new Error('Autre utilisateur non trouvé');
      }

      // Obtenez la liste des amis mutuels de l'utilisateur actuel
      const currentUserMutualFriends = await this.getMutualFriends(currentUserId);

      // Vérifiez si l'autre utilisateur est dans la liste des amis mutuels de l'utilisateur actuel
      const hasMutualFriend = currentUserMutualFriends.some(friend => friend.id === otherUser.id);

      return hasMutualFriend;
  } catch (error) {
      // Gérer les erreurs, par exemple, si l'autre utilisateur n'est pas trouvé
      throw error;
  }
}


async getClosestUsers(search: string, numberOfResults: number): Promise<User[]> {
  const users = await this.prisma.user.findMany();
  const results: { user: User, distance: number }[] = [];

  users.forEach(user => {
    const distance = levenshtein.get(search, user.username);
    results.push({ user, distance });
  });

  results.sort((a, b) => a.distance - b.distance);

  const closestUsers: User[] = results.slice(0, numberOfResults).map(result => result.user);

  return closestUsers;
}
}