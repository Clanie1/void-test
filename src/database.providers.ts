import { join } from 'path';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5001,
        username: 'void',
        password: 'void',
        database: 'void',

        // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
