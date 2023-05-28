import { Rank, Tier } from '../types/lol.internal-types';
export class RiotUser {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export class RiotRankProfile {
  legueId: string;
  queueType: string;
  tier: Tier;
  rank: Rank;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}
