import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { Repository } from 'typeorm';
import { SummonerRankRecord } from './entities/summonerRankRecord.entity';

const ALLQUEUEID = 0;
@Injectable()
export class LolService {
  private readonly riotAxios: AxiosInstance;
  constructor(
    @Inject('SUMMONER_REPOSITORY')
    private summonerRepository: Repository<SummonerRankRecord>,
  ) {
    this.riotAxios = axios.create({
      headers: {
        'X-Riot-Token': 'RGAPI-a545ee70-1b59-4f13-a87d-56be79cfa97a',
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
    this.handleSummonerRankRecordIntoDb(summonerName, summonerPlatform);
    const summonerRegion = this.getRegionFromPlatform(summonerPlatform);
    const accountID = accountInfo.puuid;
    const startingMatchIndex = limit * (page - 1);
    const endingMatchIndex = limit * page;
    const matchIdList = await this.getMatchIdListFromAccountId(
      accountID,
      summonerRegion,
      startingMatchIndex,
      endingMatchIndex,
      queueId,
    );

    const matchListData = [];
    for (const matchId of matchIdList) {
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
  ): Promise<PlayerSummary[]> {
    const accountInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );
    this.handleSummonerRankRecordIntoDb(summonerName, summonerPlatform);
    const summonerID = accountInfo.id;
    const summonerRanks = await this.getSummonerRankFromSummonerID(
      summonerID,
      summonerPlatform,
    );
    const summonerPuuid = accountInfo.puuid;
    const summonerRegion = this.getRegionFromPlatform(summonerPlatform);
    const defaultPaginationForProfileSummary = [1, 5];

    const matchList = await this.getMatchIdListFromAccountId(
      summonerPuuid,
      summonerRegion,
      defaultPaginationForProfileSummary[0],
      defaultPaginationForProfileSummary[1],
      queueId,
    );

    const avgCsPerMinute = this.getAvgCSPerMinute(matchList);
    const avgVisionScore = this.getAvgVisionScore(matchList);

    let summonerRanksFiltered = [];
    for (const rankDetails of summonerRanks) {
      const playerSummary: PlayerSummary = {
        puuid: accountInfo.puuid,
        queueType: rankDetails.queueType,
        rank: {
          tier: rankDetails.tier,
          rank: rankDetails.rank,
          img:
            'http://localhost:3000/lol/rank-image/' +
            rankDetails.tier.toLowerCase(),
        },
        leaguePoints: rankDetails.leaguePoints,
        wins: rankDetails.wins,
        losses: rankDetails.losses,
        avgCsPerMinute: avgCsPerMinute,
        avgVisionScore: avgVisionScore,
      };
      summonerRanksFiltered.push(playerSummary);
    }
    return summonerRanksFiltered;
  }

  async getPlayerRank(
    summonerName: string,
    summonerPlatform: Platform,
  ): Promise<any> {
    const DEFAULT_QUEUE_TYPE = 'RANKED_SOLO_5x5';
    const leaderboardByLeaguePoints = await this.summonerRepository
      .createQueryBuilder('record')
      .where('record.queueType = :queueType', { queueType: DEFAULT_QUEUE_TYPE })
      .andWhere('record.platform = :platform', { platform: summonerPlatform })
      .orderBy('record.leaguePoints', 'DESC')
      .getMany();

    const leaderboardByWinrate = await this.summonerRepository
      .createQueryBuilder('record')
      .where('record.queueType = :queueType', { queueType: DEFAULT_QUEUE_TYPE })
      .andWhere('record.platform = :platform', { platform: summonerPlatform })
      .orderBy('record.winrate', 'DESC')
      .getMany();

    const byLeaguePointsPosition =
      1 +
      leaderboardByLeaguePoints.findIndex(
        (summoner) => summoner.username === summonerName,
      );
    const byWinratePosition =
      1 +
      leaderboardByWinrate.findIndex(
        (summoner) => summoner.username === summonerName,
      );
    if (byLeaguePointsPosition == 0 || byWinratePosition == 0) {
      throw new HttpException('No summoner found', HttpStatus.BAD_REQUEST);
    }
    return {
      leaguePoints: 'top: ' + byLeaguePointsPosition.toString(),
      winRate: 'top: ' + byWinratePosition.toString(),
    };
  }

  async handleSummonerRankRecordIntoDb(
    summonerName: string,
    summonerPlatform: Platform,
  ) {
    const region = this.getRegionFromPlatform(summonerPlatform);
    const summonerInfo = await this.getAccountFromSummoner(
      summonerName,
      summonerPlatform,
    );

    const summonerID = summonerInfo.id;
    const summonerPuuid = summonerInfo.puuid;
    const summonerRanks = await this.getSummonerRankFromSummonerID(
      summonerID,
      summonerPlatform,
    );
    for (const rankDetails of summonerRanks) {
      const summonerRankRecord = new SummonerRankRecord();
      summonerRankRecord.puuid = summonerPuuid;
      summonerRankRecord.username = summonerName;
      summonerRankRecord.queueType = rankDetails.queueType;
      summonerRankRecord.platform = summonerPlatform;
      summonerRankRecord.winrate =
        rankDetails.wins / (rankDetails.wins + rankDetails.losses);
      summonerRankRecord.leaguePoints = rankDetails.leaguePoints;
      const exists = await this.getSummonerRankRecordExists(summonerRankRecord);
      exists
        ? this.updateSummonerRankRecord(exists)
        : this.insertSummonerRankRecord(summonerRankRecord);
      ``;
    }
  }
  async updateSummonerRankRecord(summonerRankRecord: SummonerRankRecord) {
    const summonerRankRecordEntity =
      this.summonerRepository.create(summonerRankRecord);
    const savedSummonerRankRecord = await this.summonerRepository.save(
      summonerRankRecordEntity,
    );
  }

  async getSummonerRankRecordExists(
    summonerRankRecord: Partial<SummonerRankRecord>,
  ): Promise<SummonerRankRecord> {
    const summonerRankRecordExists = await this.summonerRepository.findOne({
      where: {
        puuid: summonerRankRecord.puuid,
        queueType: summonerRankRecord.queueType,
      },
    });
    return summonerRankRecordExists;
  }

  async insertSummonerRankRecord(
    summonerRankRecord: Partial<SummonerRankRecord>,
  ) {
    const summonerRankRecordEntity =
      this.summonerRepository.create(summonerRankRecord);
    const savedSummonerRankRecord = await this.summonerRepository.save(
      summonerRankRecordEntity,
    );
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

  async getSummonerRankFromSummonerID(
    summonerID,
    summonerPlatform,
  ): Promise<RiotRankProfile[]> {
    const summonerRank = await this.riotAxios.get(
      `https://${summonerPlatform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}`,
    );
    return summonerRank.data;
  }

  async getMatchFromMatchId(matchId: string, summonerRegion: string) {
    try {
      const match = await this.riotAxios.get(
        `https://${summonerRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      );
      return match.data;
    } catch (e) {
      throw new HttpException('Match not found', HttpStatus.BAD_REQUEST);
    }
  }

  async getAccountFromSummoner(
    summonerName: string,
    summonerRegion: string,
  ): Promise<RiotUser> {
    try {
      const accountID = await this.riotAxios.get(
        `https://${summonerRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
      );
      return accountID.data;
    } catch (e) {
      throw new HttpException('Summoner not found', HttpStatus.BAD_REQUEST);
    }
  }

  async getMatchIdListFromAccountId(
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
