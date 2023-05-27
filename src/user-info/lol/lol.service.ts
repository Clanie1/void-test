import { Injectable } from '@nestjs/common';
import axios, { Axios, AxiosInstance } from 'axios';
import { RiotRankProfile, RiotUser } from './dto/lol.dto';
import { match } from 'assert';
import { on } from 'events';

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
    summonerPlatform: string,
  ): Promise<string[]> {
    const accountInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );
    const summonerRegion = this.getRegionFromPlatform(summonerPlatform);
    const accountID = accountInfo.puuid;

    const matchList = await this.getMatchListFromAccountId(
      accountID,
      summonerRegion,
    );

    const matchListData = [];
    for (const matchId of matchList) {
      const match = await this.getMatchFromMatchId(matchId, summonerRegion);
      matchListData.push(match);
    }

    return matchListData;
  }

  async getPlayerSummary(summonerName: string, summonerPlatform: string) {
    const accountInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );

    const summonerID = accountInfo.id;
    const summonerRank = await this.getSommonerRankFromSummonerID(
      summonerID,
      summonerPlatform,
    );

    const playerSummary = {
      puuid: accountInfo.puuid,
      rank: {
        title: summonerRank[0].tier + ' ' + summonerRank[0].rank,
        img: '',
      },
      leaguePoints: summonerRank[0].leaguePoints,
      wins: summonerRank[0].wins,
      losses: summonerRank[0].losses,
      avgCsPerMinute: 0,
      avgVisionScore: 0,
    };

    return playerSummary;
  }

  async getLastDdragonVersion() {
    const ddragonVersion = await this.riotAxios.get(
      `https://ddragon.leagueoflegends.com/api/versions.json`,
    );
    return ddragonVersion.data[0];
  }

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
  ): Promise<string[]> {
    const matchList = await this.riotAxios.get(
      `https://${summonerRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountId}/ids?start=0&count=4`,
    );
    return matchList.data;
  }

  getRegionFromPlatform(platform: string): string {
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
}
