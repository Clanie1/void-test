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

@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/recent-matches/:summonerName/:summonerPlatform')
  getAccountMatchList(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('queueId') queueId: number,
  ): Promise<string[]> {
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
    @Param('summonerPlatform') summonerPlatform: string,
    @Query('queueId') queueId: number,
  ): any {
    return this.lolService.getPlayerSummary(
      summonerName,
      summonerPlatform,
      queueId,
    );
  }
}
