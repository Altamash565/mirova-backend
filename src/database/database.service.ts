import { Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

@Injectable() 
export class DatabaseService {
    private readonly pool: Pool;
    public readonly db;

    constructor() {
        this.pool = new Pool ({
            connectionString: process.env.DATABASE_URL,
        });

        this.db = drizzle(this.pool);
    }
}