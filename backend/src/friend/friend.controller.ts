import { Controller, Post, Body, Request } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  async addFriend(@Request() req, @Body() friendUsername: string) {
    const currentUserId = req.user.id; // Récupérez l'ID de l'utilisateur à partir de req.user.id
    console.log(`Current User ID: ${currentUserId}`);
    console.log('Friendadd : ' + friendUsername);

    // Utilisez le service FriendsService pour ajouter l'ami dans la base de données
    await this.friendService.addFriend(currentUserId, friendUsername);
    return { message: 'Ami ajouté avec succès'};
  }
}
