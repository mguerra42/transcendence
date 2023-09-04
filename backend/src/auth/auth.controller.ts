import { AuthRequest, AuthResponse } from '../../types';
import * as bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('/api/v0/signup')
  async signup(@Body() requestObject: AuthRequest): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(
      requestObject.password.toString(),
      10,
    );
    const jwtToken = sign({ email: requestObject.email }, 'secret-key', {
      expiresIn: '24h',
    });

    requestObject.password = hashedPassword;
    const response: AuthResponse = {
      status: 200,
      headers: {},
      body: {
        username: requestObject.username,
        token: jwtToken,
      },
    };
    return response;
  }

  //TODO : Check credentials, generate JWT token, send back appropriate response
  @Post('/api/v0/login')
  login(@Body() requestObject: AuthRequest): AuthResponse {
    const jwtToken = sign({ email: requestObject.email }, 'secret-key', {
      expiresIn: '24h',
    });

    const response: AuthResponse = {
      status: 200,
      headers: {},
      body: {
        username: requestObject.username,
        token: jwtToken,
      },
    };
    return response;
  }
}
