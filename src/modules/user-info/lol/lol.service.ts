import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { RiotRankProfile, RiotUser } from './dto/lol.dto';
import {
  Platform,
  Region,
  SummonerSpell,
  SummonerSpellName,
  SummonerSpellID,
} from './types/lol.internal-types';
import { PlayerSummary, Match } from './types/lol.network-types';
// import { SummonerSpell } from './types/lol.internal-types';

const ALLQUEUEID = 0;
@Injectable()
export class LolService {
  private readonly riotAxios: AxiosInstance;

  constructor() {
    this.riotAxios = axios.create({
      headers: {
        'X-Riot-Token': 'RGAPI-7aa91717-0b3f-441b-939f-94fa48ebf65b',
      },
    });
  }

  async getAccountRecentMatches(
    summonerName: string,
    summonerPlatform: Platform,
    page: number,
    limit: number,
    queueId: number,
  ): Promise<Match[]> {
    const accountInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );
    const summonerRegion = this.getRegionFromPlatform(summonerPlatform);
    const accountID = accountInfo.puuid;

    const startingMatchIndex = limit * (page - 1);
    const endingMatchIndex = limit * page;
    const matchList = await this.getMatchListFromAccountId(
      accountID,
      summonerRegion,
      startingMatchIndex,
      endingMatchIndex,
      queueId,
    );

    const matchListData = [];
    for (const matchId of matchList) {
      const RiotMatch = await this.getMatchFromMatchId(matchId, summonerRegion);
      const RiotMatchInfo = RiotMatch.info;
      const summonerMatchInfo = RiotMatchInfo.participants.find(
        (participant) => participant.puuid === accountInfo.puuid,
      );
      const totalMinutes = RiotMatchInfo.gameDuration / 60;
      const match = {
        gameDuration: RiotMatchInfo.gameDuration,
        champion: summonerMatchInfo.championName,
        win: summonerMatchInfo.win,
        kda: summonerMatchInfo.challenges.kda,
        kills: summonerMatchInfo.kills,
        deaths: summonerMatchInfo.deaths,
        assists: summonerMatchInfo.assists,
        minions: summonerMatchInfo.totalMinionsKilled,
        avgVision: summonerMatchInfo.challenges.visionScorePerMinute,
        csPerMinute: summonerMatchInfo.totalMinionsKilled / totalMinutes,
        summoners: [
          this.getSummonerSpellNameFromId(summonerMatchInfo.summoner1Id),
          this.getSummonerSpellNameFromId(summonerMatchInfo.summoner2Id),
        ],
      };

      matchListData.push(match);
    }
    return matchListData;
  }

  async getPlayerSummary(
    summonerName: string,
    summonerPlatform: Platform,
    queueId: number,
  ): Promise<PlayerSummary> {
    const accountInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );

    const summonerID = accountInfo.id;
    const summonerRank = await this.getSommonerRankFromSummonerID(
      summonerID,
      summonerPlatform,
    );
    console.log(summonerRank);
    const defaultPaginationForProfileSummary = [1, 5];
    const matchList = await this.getAccountRecentMatches(
      summonerName,
      summonerPlatform,
      defaultPaginationForProfileSummary[0],
      defaultPaginationForProfileSummary[1],
      queueId,
    );

    const avgCsPerMinute = this.getAvgCSPerMinute(matchList);
    const avgVisionScore = this.getAvgVisionScore(matchList);

    const playerSummary = {
      puuid: accountInfo.puuid,
      rank: {
        tier: summonerRank[0].tier,
        rank: summonerRank[0].rank,
        img: '',
      },
      leaguePoints: summonerRank[0].leaguePoints,
      wins: summonerRank[0].wins,
      losses: summonerRank[0].losses,
      avgCsPerMinute: avgCsPerMinute,
      avgVisionScore: avgVisionScore,
    };

    return playerSummary;
  }

  getAvgCSPerMinute(matchList): number {
    let totalCSPerMinute = 0;
    for (const match of matchList) {
      totalCSPerMinute += match.csPerMinute;
    }
    return totalCSPerMinute / matchList.length;
  }

  getAvgVisionScore(matchList): number {
    let totalVisionScore = 0;
    for (const match of matchList) {
      totalVisionScore += match.avgVision;
    }
    return totalVisionScore / matchList.length;
  }

  // async getLastDdragonVersion() {
  //   const ddragonVersion = await this.riotAxios.get(
  //     `https://ddragon.leagueoflegends.com/api/versions.json`,
  //   );
  //   return ddragonVersion.data[0];
  // }

  async getSommonerRankFromSummonerID(
    summonerID,
    summonerPlatform,
  ): Promise<RiotRankProfile> {
    const summonerRank = await this.riotAxios.get(
      `https://${summonerPlatform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}`,
    );
    return summonerRank.data;
  }

  async getMatchFromMatchId(matchId: string, summonerRegion: string) {
    const match = await this.riotAxios.get(
      `https://${summonerRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    );
    return match.data;
  }

  async getAccountFromSummoner(
    summonerName: string,
    summonerRegion: string,
  ): Promise<RiotUser> {
    const accountID = await this.riotAxios.get(
      `https://${summonerRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
    );
    return accountID.data;
  }

  async getMatchListFromAccountId(
    accountId: string,
    summonerRegion: string,
    startingMatchIndex: number,
    endingMatchIndex: number,
    queueId: number = 0,
  ): Promise<string[]> {
    let queueStr = '';
    if (queueId != 0) {
      queueStr = `&queue=${queueId}`;
    }

    const matchList = await this.riotAxios.get(
      `https://${summonerRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountId}/ids?start=${startingMatchIndex}&count=${endingMatchIndex}${queueStr}`,
    );
    return matchList.data;
  }

  getRegionFromPlatform(platform: Platform): Region {
    const upperPlatform = platform.toUpperCase();
    switch (upperPlatform) {
      case 'BR1':
      case 'LA1':
      case 'LA2':
      case 'NA1':
        return 'AMERICAS';
      case 'EUN1':
      case 'EUW1':
      case 'RU':
      case 'TR1':
        return 'EUROPE';
      case 'KR':
      case 'JP1':
        return 'ASIA';
      case 'OC1':
      case 'PH2':
      case 'SG2':
      case 'TH2':
      case 'TW2':
      case 'VN2':
        return 'SEA';
      default:
        return 'Unknown';
    }
  }
  getSummonerSpellNameFromId(summonerId: SummonerSpellID): SummonerSpellName {
    switch (summonerId) {
      case SummonerSpell.Barrier:
        return 'Barrier';
      case SummonerSpell.Cleanse:
        return 'Cleanse';
      case SummonerSpell.Exhaust:
        return 'Exhaust';
      case SummonerSpell.Flash:
        return 'Flash';
      case SummonerSpell.Ghost:
        return 'Ghost';
      case SummonerSpell.Heal:
        return 'Heal';
      case SummonerSpell.Ignite:
        return 'Ignite';
      case SummonerSpell.Mark:
        return 'Mark';
      case SummonerSpell.PoroToss:
        return 'PoroToss';
      case SummonerSpell.Smite:
        return 'Smite';
      case SummonerSpell.Teleport:
        return 'Teleport';
      default:
        return 'Unknown';
    }
  }
}
