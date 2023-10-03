import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addFriend(@Request() req, @Body() friendUsername) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    console.log(`Current User ID: ${currentUserId}`);
    console.log('Friendadd : ', friendUsername);

    // Utilisez le service FriendsService pour ajouter l'ami dans la base de données
    await this.friendService.addFriend(currentUserId, friendUsername.newFriendName);
    return { message: 'Ami ajouté avec succès'};
  }

  @Get('amis')
  @UseGuards(JwtAuthGuard)
  async getFriendList(@Request() req) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    const friendList = await this.friendService.getMutualFriends(currentUserId); // Remplacez getFriendList par la méthode réelle de votre service
  
    return { friends: friendList }; // Renvoyez la liste d'amis sous la clé "friends"
  }

  @Get('enAttente')
  @UseGuards(JwtAuthGuard)
  async inverseList(@Request() req) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    const friendList = await this.friendService.getFriendRequestsReceived(currentUserId);
  
    return { friends: friendList }; // Renvoyez la liste d'amis sous la clé "friends"
  }

  @Get('demandes')
  @UseGuards(JwtAuthGuard)
  async pendingList(@Request() req) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    const friendList = await this.friendService.getPendingFriendRequests(currentUserId);
  
    return { friends: friendList }; // Renvoyez la liste d'amis sous la clé "friends"
  }

  @Post('remove')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Request() req, @Body() friendUsername) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    const friendList = await this.friendService.removeFriendship(currentUserId, friendUsername.friendName);
  
    return { friends: friendList }; // Renvoyez la liste d'amis sous la clé "friends"
  }
}
