import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Summoner {
  @PrimaryGeneratedColumn()
  puuid: number;
  @Column()
  winrate: number;
  @Column()
  leaguePoints: number;
}
