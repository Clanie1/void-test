import { Module } from '@nestjs/common';
import { LolController } from './lol/lol.controller';
import { LolService } from './lol/lol.service';

@Module({
  imports: [],
  controllers: [LolController],
  providers: [LolService],
})
export class UserInfoModule {}
