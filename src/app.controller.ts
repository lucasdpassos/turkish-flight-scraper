import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {

  // Lucas: the ping endpoint is used to check if the server is reachable and running
  @Get('ping') 
  getPing() {
    return 'pong';
  }
}
