import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserExistsException } from 'src/auth/auth.exception';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(credentials: LoginDto): Promise<{
    access_token: string;
  }> {
    const user = await this.usersService.findByEmail(credentials.email);

    if (!bcrypt.compareSync(credentials.password, user.password)) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async signup(credentials: SignUpDto) {
    const exists = await this.usersService.findByEmail(credentials.email);
    if (exists) {
      throw new UserExistsException();
    }
    const user = await this.usersService.create(credentials);
    return user;
  }
}
