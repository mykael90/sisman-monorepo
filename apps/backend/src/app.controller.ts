import { BadRequestException, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('delay')
  async delay() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return 'Delayed response';
  }

  @Get('error-http')
  errorHttp() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }



  //error not http for test
  @Get('error-not-http')
  errorNotHttp() {
    throw new Error('This is a non-HTTP exception');
  }

}
