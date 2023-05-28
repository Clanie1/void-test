export enum SummonerSpell {
  Barrier = 21,
  Cleanse = 1,
  Exhaust = 3,
  Flash = 4,
  Ghost = 6,
  Heal = 7,
  Ignite = 14,
  Mark = 32,
  PoroToss = 31,
  Smite = 11,
  Teleport = 12,
}

export type SummonerSpellName =
  | 'Barrier'
  | 'Cleanse'
  | 'Exhaust'
  | 'Flash'
  | 'Ghost'
  | 'Heal'
  | 'Ignite'
  | 'Mark'
  | 'PoroToss'
  | 'Smite'
  | 'Teleport'
  | 'Unknown';

export type SummonerSpellID = 21 | 1 | 3 | 4 | 6 | 7 | 14 | 32 | 31 | 11 | 12;

export type Platform =
  | 'BR1'
  | 'EUN1'
  | 'EUW1'
  | 'JP1'
  | 'KR'
  | 'LA1'
  | 'LA2'
  | 'NA1'
  | 'OC1'
  | 'RU'
  | 'TR1'
  | 'PH2'
  | 'SG2'
  | 'TH2'
  | 'TW2'
  | 'VN2'
  | 'Unknown';

export type Region = 'AMERICAS' | 'EUROPE' | 'ASIA' | 'SEA' | 'Unknown';

export type QueueId = 420 | 440 | 430 | 400 | 450 | 0;

export type Tier =
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER';

export type Rank = 'I' | 'II' | 'III' | 'IV' | 'V' | 'Unknown';
