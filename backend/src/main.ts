import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  await app.listen(3000);
}
bootstrap();

//backed 
//1 POST api/v0/login
// receives credentials email password

//2 check in database
// compare hash
// generate JWT token and save in a cookie

//3 send cookie back to user
// next requests should include this cookie
// check cookie and validate JWT token

//login42
//loginGoogle

//front
//create une form with email and password
//form connects to API endpoint
//if success, redirect to dashboard