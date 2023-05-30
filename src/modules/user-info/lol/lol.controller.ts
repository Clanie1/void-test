import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { LolService } from './lol.service';
import { Platform, QueueId } from './types/lol.internal-types';
import { Match, PlayerSummary } from './types/lol.network-types';
import { Response } from 'express';
import * as path from 'path';
import { of } from 'rxjs';

@UseInterceptors(CacheInterceptor)
@Controller('lol')
export class LolController {
  constructor(private lolService: LolService) {}

  @Get('/recent-matches/:summonerName/:summonerPlatform')
  getAccountMatchList(
    @Param('summonerName') summonerName: string,
    @Param('summonerPlatform') summonerPlatform: Platform,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('queueId') queueId: QueueId,
  ): Promise<Match[]> {
    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);
    return this.lolService.getAccountRecentMatches(
      summonerName,
      summonerPlatform,
      pageNumber,
      limitNumber,
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

  @Get('/rank-image/:tier')
  getRankImage(@Param('tier') tier: string, @Res() res: Response) {
    return of(
      res.sendFile(
        path.join(
          process.cwd(),
          'src/assets/img/lol/ranks/emblem-' + tier + '.png',
        ),
      ),
    );
  }
}
