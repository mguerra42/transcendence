import { Controller, Post, Get, Query, Body, Request, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addFriend(@Request() req, @Body() friendUsername) {
    const currentUserId = req.user.id;
    console.log(`Current User ID: ${currentUserId}`);
    console.log('Friendadd : ', friendUsername);

    // Utilisez le service FriendsService pour ajouter l'ami dans la base de données
    await this.friendService.addFriend(currentUserId, friendUsername.newFriendName);
    return { message: 'Ami ajouté avec succès'};
  }

  @Get('amis')
  @UseGuards(JwtAuthGuard)
  async getFriendList(@Request() req) {
    const currentUserId = req.user.id;
    const friendList = await this.friendService.getMutualFriends(currentUserId);
  
    return { friends: friendList };
  }

  @Get('enAttente')
  @UseGuards(JwtAuthGuard)
  async inverseList(@Request() req) {
    const currentUserId = req.user.id;
    const friendList = await this.friendService.getFriendRequestsReceived(currentUserId);
  
    return { friends: friendList };
  }

  @Get('demandes')
  @UseGuards(JwtAuthGuard)
  async pendingList(@Request() req) {
    const currentUserId = req.user.id;
    const friendList = await this.friendService.getPendingFriendRequests(currentUserId);
  
    return { friends: friendList };
  }

  @Post('remove')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Request() req, @Body() friendNameObj) {
    const currentUserId = req.user.id;
    const friendList = await this.friendService.removeFriendship(currentUserId, friendNameObj.friendName);
  
    return { friends: friendList };
  }

  @Post('isJustFriend')
  @UseGuards(JwtAuthGuard)
  async isFriend(@Request() req, @Body() friendNameObj) {
    const currentUserId = req.user.id;
    const result = await this.friendService.isJustFriend(currentUserId, friendNameObj.friendName);

    return { Boolean : result };
  }

  @Post('areMutualFriends')
  @UseGuards(JwtAuthGuard)
  async isMutualFriend(@Request() req, @Body() friendNameObj) {
    const currentUserId = req.user.id;
    const result = await this.friendService.areMutualFriends(currentUserId, friendNameObj.friendName);

    console.log("controller mutualfriends result : ", result);
    return { Boolean : result };
  }

  @Get('closest')
  @UseGuards(JwtAuthGuard)
  async getClosestUsers(@Request() req, @Query('search') search: string) {
    const currentUserId = req.user.id;
    const closestUsers = await this.friendService.getClosestUsers(currentUserId, search, 10);
    return { closestUsers };
  }
}
