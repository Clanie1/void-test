import { DataSource } from 'typeorm';
import { SummonerRankRecord } from './summonerRankRecord.entity';

export const summonerRankRecordProviders = [
  {
    provide: 'SUMMONER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SummonerRankRecord),
    inject: ['DATA_SOURCE'],
  },
];
