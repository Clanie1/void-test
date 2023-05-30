import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Platform } from '../types/lol.internal-types';

@Entity()
export class SummonerRankRecord {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  puuid: string;
  @Column()
  platform: Platform;
  @Column()
  username: string;
  @Column()
  queueType: string;
  @Column('decimal', { precision: 5, scale: 2 })
  winrate: number;
  @Column()
  leaguePoints: number;
}
