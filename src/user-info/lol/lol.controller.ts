import { Controller, Get, Inject } from '@nestjs/common';
import { LolService } from './lol.service';

@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/match-list')
  getAccountMatchList(): Promise<string> {
    return this.lolService.getAccountRecentMatches('clanie1', 'la1');
  }
}
