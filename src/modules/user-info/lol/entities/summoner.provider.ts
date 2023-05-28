import { DataSource } from 'typeorm';
import { Summoner } from './summoner.entity';

export const summonerProviders = [
  {
    provide: 'SUMMONER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Summoner),
    inject: ['DATA_SOURCE'],
  },
];
