import { Injectable } from '@nestjs/common';
import axios, { Axios, AxiosInstance } from 'axios';
import { RiotUser } from './dto/lol.dto';

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

  async getAccountIdFromSummonerName(
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
  ): Promise<string> {
    const matchList = await this.riotAxios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountId}/ids`,
    );
    return matchList.data;
  }

  async getAccountRecentMatches(
    summonerName: string,
    summonerRegion: string,
  ): Promise<string> {
    const accountInfo = await this.getAccountIdFromSummonerName(
      summonerName,
      summonerRegion,
    );
    const accountID = accountInfo.accountId;

    const matchList = await this.getMatchListFromAccountId(
      accountID,
      summonerRegion,
    );
    return matchList;
  }
}
