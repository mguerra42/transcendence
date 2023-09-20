import { Controller, Post, Body, Request } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  async addFriend(@Request() req) {
    console.log('Friendadd : ' + req)
    // Utilisez le service FriendsService pour ajouter l'ami dans la base de données
    return { message: 'Ami ajouté avec succès'};
  }
}
