import { Module } from '@nestjs/common';
// import { Pool } from 'pg';
// import { drizzle } from 'drizzle-orm/node-postgres';

import { DATABASE } from './database.constants';
import { DatabaseService } from './database.service';

@Module({
  providers: [
    DatabaseService,
    {
      provide: DATABASE,
      useFactory: (databaseService: DatabaseService) => {
        return databaseService.db;
      },
      inject: [DatabaseService],
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
