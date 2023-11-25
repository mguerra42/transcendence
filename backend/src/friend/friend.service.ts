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
    // model User {
    //   id             Int           @id @default(autoincrement())
    //   username       String?       @unique
    //   status         String?       @default("OFFLINE")//online, playing, offline
    //   email          String        @unique
    //   password       String
    //   victories      Int           @default(0) //number of victories for stats
    //   defeats        Int           @default(0) //number of defeats for stats
    //   ladderPoint    Int           @default(1000) //level for stats
    //   avatar     String        @default("/avatars/default.jpg") //the path to the avatar image
    //   // friends        Friend[]      @relation("friends")
    //   // inverseFriends Friend[]      @relation("inverseFriends") // Only for prisma, not used
    //   friends Friendship[] @relation("friends")
    //   friendsOf  Friendship[] @relation("friendsOf")
    //   blockedUsers   BlockedUser[] @relation("blocked")
    //   wonGames       Game[]        @relation("winner")
    //   lostGames      Game[]        @relation("loser")
    //   channels       ChannelUser[] //channels the user is in
    // //  history        history[]    //history of DMs, and maybe channels soon
    //   gameLobby      GameLobby[]
    // //  messages       Message[]     @relation("sender")
    //   socketId       String        @default("") //socket id for the user
    //   queue          Queue?        // Define the Queue relation here
    //   twoFa           Int          @default(0) //'on' = 1  or 'off' = 0
    //   secret         String?       // Field to store the 2FA secret
    //   mfaEnabled       Boolean           @default(false)
    // }

    // model Friendship {
    //   friends   User @relation("friends", fields: [friendsId], references: [id])
    //   friendsId Int
    //   friendsOf    User @relation("friendsOf", fields: [friendsOfId], references: [id])
    //   friendsOfId  Int
    //   accepted  Boolean @default(false)

    //   @@id([friendsOfId, friendsId])
    // }

    async getUserFriends(userId: number) {
        // User can be friends with other users in two ways:
        // 1. User is friends with other users (user.friends)
        // 2. Other users are friends with the user (user.friendsOf)
        // We need to get both of these lists and merge them together
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: true,
                friendsOf: true,
            },
        });
        const friends = [
            ...user.friends.map((f) => ({
                id: f.friendsOfId,
                accepted: true,
            })),
            ...user.friendsOf.map((f) => ({
                id: f.friendsId,
                accepted: f.accepted,
            })),
        ];
        return friends;
    }
    async searchFriend(query: string): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });

        return users;
    }

    //   async addFriend(currentUserId: number, newFriendUsername: string): Promise<void> {
    //     const friend = await this.usersService.findByEmailOrUsername('', newFriendUsername);

    //     if (!friend) {
    //       throw new Error(`L'ami avec le nom d'utilisateur ${newFriendUsername} n'a pas été trouvé.`);
    //     }

    //     if (friend.id === currentUserId) {
    //         throw new Error(`Erreur : vous ne pouvez pas vous ajouter vous même en ami.`);
    //       }

    //     // Vérifier si une relation "friend" existe déjà entre les deux utilisateurs pour l'utilisateur actuel
    //     const existingFriendship = await this.prisma.friend.findFirst({
    //         where: {
    //           userOneId: currentUserId,
    //           userTwoId: friend.id,
    //         },
    //       });

    //       if (existingFriendship) {
    //         throw new Error(`Vous avez déjà ajouté l'utilisateur ${newFriendUsername} en tant qu'ami précédemment.`);
    //       }

    //     // Créez une nouvelle entrée dans le modèle Friend
    //     await this.prisma.friend.create({
    //       data: {
    //         userOneId : currentUserId,
    //         userTwoId : friend.id,
    //       },
    //     });
    //   }

    //   async getMutualFriends(userId: number): Promise<User[]> {
    //     try {
    //         const user = await this.prisma.user.findUnique({
    //             where: { id: userId },
    //             include: {
    //                 friends: {
    //                     include: {
    //                         userTwo: true
    //                     }
    //                 },
    //                 inverseFriends: {
    //                     include: {
    //                         userOne: true
    //                     }
    //                 }
    //             }
    //         });

    //         if (!user) {
    //             throw new Error('Utilisateur non trouvé');
    //         }

    //         // Filtrer les amis qui sont à la fois dans friends et inverseFriends
    //         const mutualFriends = user.friends.filter(friend => {
    //             const foundInverseFriend = user.inverseFriends.find(inverseFriend => inverseFriend.userOne.id === friend.userTwo.id);
    //             return foundInverseFriend !== undefined;
    //         });

    //         // Utilisez map pour extraire les amis mutuels complets
    //         const mutualFriendsList = mutualFriends.map(friend => friend.userTwo);

    //         return mutualFriendsList;
    //     } catch (error) {
    //         // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
    //         throw error;
    //     }
    // }

    //   async getPendingFriendRequests(userId: number): Promise<User[]> {
    //     try {
    //         const user = await this.prisma.user.findUnique({
    //             where: { id: userId },
    //             include: {
    //                 friends: {
    //                     include: {
    //                         userTwo: true
    //                     }
    //                 },
    //                 inverseFriends: {
    //                     include: {
    //                         userOne: true
    //                     }
    //                 }
    //             }
    //         });

    //         if (!user) {
    //             throw new Error('Utilisateur non trouvé');
    //         }

    //         // Filtrer les amis qui sont dans inverseFriends mais pas dans friends
    //         const pendingRequests = user.inverseFriends.filter(inverseFriend => {
    //             const foundFriend = user.friends.find(friend => friend.userTwo.id === inverseFriend.userOne.id);
    //             return foundFriend === undefined;
    //         });

    //         // Utilisez map pour extraire les demandes d'amis en attente complètes
    //         const pendingRequestsList = pendingRequests.map(inverseFriend => inverseFriend.userOne);

    //         return pendingRequestsList;
    //     } catch (error) {
    //         // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
    //         throw error;
    //     }
    // }

    // async getFriendRequestsReceived(userId: number): Promise<User[]> {
    //   try {
    //       const user = await this.prisma.user.findUnique({
    //           where: { id: userId },
    //           include: {
    //               friends: {
    //                   include: {
    //                       userTwo: true
    //                   }
    //               },
    //               inverseFriends: {
    //                   include: {
    //                       userOne: true
    //                   }
    //               }
    //           }
    //       });

    //       if (!user) {
    //           throw new Error('Utilisateur non trouvé');
    //       }

    //       // Filtrer les amis qui sont dans friends mais pas dans inverseFriends
    //       const friendRequestsReceived = user.friends.filter(friend => {
    //           const foundInverseFriend = user.inverseFriends.find(inverseFriend => inverseFriend.userOne.id === friend.userTwo.id);
    //           return foundInverseFriend === undefined;
    //       });

    //       // Utilisez map pour extraire les demandes d'amis reçues complètes
    //       const friendRequestsReceivedList = friendRequestsReceived.map(friend => friend.userTwo);

    //       return friendRequestsReceivedList;
    //   } catch (error) {
    //       // Gérer les erreurs (par exemple, l'utilisateur n'a pas été trouvé)
    //       throw error;
    //   }
    // }

    // async removeFriendship(currentId: number, friendUsername: string): Promise<void> {
    //     try {
    //         const friendUser = await this.usersService.findByEmailOrUsername('', friendUsername);
    //       // Supprimez la relation d'amitié en utilisant les IDs des utilisateurs
    //       await this.prisma.friend.deleteMany({
    //         where: {
    //           OR: [
    //             { userOneId: currentId, userTwoId: friendUser.id },
    //             { userOneId: friendUser.id, userTwoId: currentId },
    //           ],
    //         },
    //       });

    //       console.log(`Relation d'amitié entre les utilisateurs avec les IDs ${currentId} et ${friendUsername} supprimée.`);
    //     } catch (error) {
    //       console.error('Une erreur s\'est produite lors de la suppression d\'ami:', error);
    //       throw error;
    //     }
    //   }

    //   async isJustFriend(currentId: number, friendName : string): Promise<Boolean> {
    //     const friendUser = await this.usersService.findByEmailOrUsername('', friendName);
    //     const existingFriendship = await this.prisma.friend.findFirst({
    //       where: {
    //         userOneId: currentId,
    //         userTwoId: friendUser.id,
    //       },
    //     });

    //     if (existingFriendship)
    //       return true;
    //     return false;
    //     }

    // async areMutualFriends(currentUserId: number, otherUserName: string): Promise<boolean> {
    //   try {
    //       // Recherche de l'utilisateur par nom
    //       const otherUser = await this.prisma.user.findUnique({
    //           where: { username: otherUserName },
    //           include: {
    //               friends: {
    //                   include: {
    //                       userTwo: true
    //                   }
    //               },
    //               inverseFriends: {
    //                   include: {
    //                       userOne: true
    //                   }
    //               }
    //           }
    //       });

    //       if (!otherUser) {
    //           throw new Error('Autre utilisateur non trouvé');
    //       }

    //       // Obtenez la liste des amis mutuels de l'utilisateur actuel
    //       const currentUserMutualFriends = await this.getMutualFriends(currentUserId);

    //       // Vérifiez si l'autre utilisateur est dans la liste des amis mutuels de l'utilisateur actuel
    //       const hasMutualFriend = currentUserMutualFriends.some(friend => friend.id === otherUser.id);

    //       return hasMutualFriend;
    //   } catch (error) {
    //       // Gérer les erreurs, par exemple, si l'autre utilisateur n'est pas trouvé
    //       throw error;
    //   }
    // }
}
