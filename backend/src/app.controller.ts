import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthRequest, AuthResponse } from './app.types';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/hello')
		getHello(): string {
			return this.appService.getHello();
	}

	@Post('/api/v0/signup')
	async signup(@Body() requestObject: AuthRequest): Promise<AuthResponse> {
		const jwt = require('jsonwebtoken');
		const hashedPassword = await bcrypt.hash(requestObject.password.toString(), 10);
		const jwtToken = jwt.sign(
			{ email: requestObject.email },
			'secret-key',
			{ expiresIn: '24h' }
		  );

		requestObject.password = hashedPassword;
		let response : AuthResponse = {
			status : 200,
			headers : {},
			body : {
				username : requestObject.username,
				token : jwtToken,
			}
		}
		return response;
	}

	//TODO : Check credentials, generate JWT token, send back appropriate response
	@Post('/api/v0/login')
	login(@Body() requestObject:AuthRequest): AuthResponse {
		const jwt = require('jsonwebtoken');
		const jwtToken = jwt.sign(
			{ email: requestObject.email },
			'secret-key',
			{ expiresIn: '24h' }
		  );

		let response : AuthResponse = {
			status : 200,
			headers : {},
			body : {
				username : requestObject.username,
				token : jwtToken,
			}
		}
		return response;
	}
}
