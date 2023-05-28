import { Module } from '@nestjs/common';
import 'reflect-metadata';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfoModule } from './modules/user-info/user-info.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5001,
      username: 'void',
      password: 'void',
      database: 'void',
      entities: [],
      synchronize: true,
    }),
    UserInfoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
