import { Module } from "@nestjs/common";
import { Pool } from 'pg'
import {drizzle} from 'drizzle-orm/node-postgres';

import { DATABASE } from './database.constants';

@Module({
    providers: [
        {
            provide: DATABASE,
            useFactory: () => {
                const pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                });

                return drizzle(pool);
            },
        },
    ],
    exports: [DATABASE]
})

export class DatabaseModule {}