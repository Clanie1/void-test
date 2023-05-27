import { Module } from '@nestjs/common';
import 'reflect-metadata';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfoModule } from './user-info/user-info.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: 'root',
    //   database: 'test',
    //   entities: [],
    //   synchronize: true,
    // }),
    UserInfoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
