import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async signup(credentials: SignUpDto) {
    if (!credentials.email || !credentials.username) {
      throw new HttpException(
        'Email and Username are required.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const exists = await this.usersService.findByEmailOrUsername(
      credentials.email,
      credentials.username,
    );
    if (exists) {
      throw new HttpException(
        'Email or Username is already taken.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const user = await this.usersService.create(credentials);
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return null;
    }
    return user;
  }

  async validateToken(token: string) {
    return this.jwtService.verify(token);
  }
}
