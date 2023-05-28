import { Tier, Rank, SummonerSpellName } from './lol.internal-types';

export type PlayerSummary = {
  puuid: string;
  queueType: string;
  rank: {
    tier: Tier;
    rank: Rank;
    img: string;
  };
  leaguePoints: number;
  wins: number;
  losses: number;
  avgCsPerMinute: number;
  avgVisionScore: number;
};

export type Match = {
  gameDuration: number;
  champion: string;
  win: boolean;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  minions: number;
  avgVision: number;
  csPerMinute: number;
  summoners: SummonerSpellName[];
};
