import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  initMessage(): string {
    return 'Server is running!';
  }
}
