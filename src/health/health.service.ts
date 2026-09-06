import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../database/database.constants';

@Injectable()
export class HealthService {
    constructor(
       @Inject(DATABASE) 
       private readonly db: any,

    ) {}
    async getHealth() {

        const result = await this.db.execute('SELECT NOW()');
        
        return {
            status: "ok",
            service: "mirova-backend",
            database: 'connected',
            time: result.rows[0].now,
        };
    }
}
