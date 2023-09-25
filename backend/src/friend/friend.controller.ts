import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
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
  // @Post('list')
  // @UseGuards(JwtAuthGuard)
  // async addFriend(@Request() req, @Body() friendUsername) {
  //   const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
  //   console.log(`Current User ID: ${currentUserId}`);
  //   console.log('Friendadd : ', friendUsername);

  //   // Utilisez le service FriendsService pour ajouter l'ami dans la base de données
  //   return { message: 'Ami ajouté avec succès'};
  // }
}
