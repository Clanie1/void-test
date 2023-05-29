import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { LolService } from './lol.service';
import { Platform, QueueId } from './types/lol.internal-types';
import { Match, PlayerSummary } from './types/lol.network-types';

@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/recent-matches/:summonerName/:summonerPlatform')
  getAccountMatchList(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: Platform,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('queueId') queueId: QueueId,
  ): Promise<Match[]> {
    return this.lolService.getAccountRecentMatches(
      summonerName,
      summonerPlatform,
      page,
      limit,
      queueId,
    );
  }

  @Get('/player-summary/:summonerName/:summonerPlatform')
  getPlayerSummary(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: Platform,
    @Query('queueId') queueId: QueueId,
  ): Promise<PlayerSummary[]> {
    return this.lolService.getPlayerSummary(
      summonerName,
      summonerPlatform,
      queueId,
    );
  }

  @Get('/summoner-rank/:summonerName/:summonerPlatform')
  getPlayerRank(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: Platform,
  ): Promise<any> {
    return this.lolService.getPlayerRank(summonerName, summonerPlatform);
  }
}
