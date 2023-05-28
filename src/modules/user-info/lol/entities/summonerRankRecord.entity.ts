import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SummonerRankRecord {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  puuid: string;
  @Column()
  username: string;
  @Column()
  queueType: string;
  @Column('decimal', { precision: 5, scale: 2 })
  winrate: number;
  @Column()
  leaguePoints: number;
}
