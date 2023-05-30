import { Test, TestingModule } from '@nestjs/testing';
import { LolController } from './lol.controller';
import { LolService } from './lol.service';
import { Platform, QueueId } from './types/lol.internal-types';
import { summonerRankRecordProviders } from './entities/summonerRankRecord.provider';
import { Match, PlayerSummary } from './types/lol.network-types';

describe('LolController', () => {
  let lolController: LolController;
  let lolService: LolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LolController],
      providers: [LolService],
    }).compile();

    lolController = module.get<LolController>(LolController);
    lolService = module.get<LolService>(LolService);
  });

  describe('getAccountMatchList', () => {
    it('should return an array of matches', async () => {
      const summonerName = 'Jauny';
      const summonerPlatform = 'LA1';
      const page = 1;
      const limit = 10;
      const queueId = 420;

      const expectedMatches: Match[] = [
        /* Array of expected matches */
      ];
      jest
        .spyOn(lolService, 'getAccountRecentMatches')
        .mockResolvedValue(expectedMatches);

      const result = await lolController.getAccountMatchList(
        summonerName,
        summonerPlatform,
        page,
        limit,
        queueId,
      );

      expect(result).toEqual(expectedMatches);
      expect(lolService.getAccountRecentMatches).toHaveBeenCalledWith(
        summonerName,
        summonerPlatform,
        page,
        limit,
        queueId,
      );
    });
  });
});
