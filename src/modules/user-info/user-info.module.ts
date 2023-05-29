import { Module } from '@nestjs/common';
import { LolController } from './lol/lol.controller';
import { LolService } from './lol/lol.service';
import { databaseProviders } from 'src/database.providers';
import { summonerRankRecordProviders } from './lol/entities/summonerRankRecord.provider';

@Module({
  imports: [],
  controllers: [LolController],
  providers: [
    LolService,
    ...databaseProviders,
    LolService,
    ...summonerRankRecordProviders,
  ],
  exports: [...databaseProviders],
})
export class UserInfoModule {}
