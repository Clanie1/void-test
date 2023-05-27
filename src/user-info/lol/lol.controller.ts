import { Controller, Get, Inject } from '@nestjs/common';
import { LolService } from './lol.service';

@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/recent-match-list')
  getAccountMatchList(): Promise<string[]> {
    return this.lolService.getAccountRecentMatches('clanie1', 'la1');
  }

  @Get('/player-summary')
  getPlayerSummary(): any {
    return this.lolService.getPlayerSummary('COOKIEMONSTER123', 'na1');
  }
}
