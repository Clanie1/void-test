import { Body, Controller, Get, Inject, Param } from '@nestjs/common';
import { LolService } from './lol.service';

@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/recent-matches/:summonerName/:summonerPlatform')
  getAccountMatchList(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: string,
  ): Promise<string[]> {
    return this.lolService.getAccountRecentMatches(
      summonerName,
      summonerPlatform,
    );
  }

  @Get('/player-summary/:summonerName/:summonerPlatform')
  getPlayerSummary(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: string,
  ): any {
    return this.lolService.getPlayerSummary(summonerName, summonerPlatform);
  }
}
