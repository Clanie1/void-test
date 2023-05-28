import { Module } from '@nestjs/common';
import { LolController } from './lol/lol.controller';
import { LolService } from './lol/lol.service';
import { databaseProviders } from 'src/database.providers';
import { summonerProviders } from './lol/entities/summoner.provider';

@Module({
  imports: [],
  controllers: [LolController],
  providers: [
    LolService,
    ...databaseProviders,
    LolService,
    ...summonerProviders,
  ],
  exports: [...databaseProviders],
})
export class UserInfoModule {}
