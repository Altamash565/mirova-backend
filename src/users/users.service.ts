import { BadRequestException, Inject, NotFoundException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {DATABASE} from '../database/database.constants'
import {users} from '../database/schema'

@Injectable()
export class UsersService {
    constructor(
        @Inject(DATABASE) 
        private readonly db: any,
    ) {}

    async create(name: string, email: string) {
        const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));

        if (existingUser.length > 0) {
            throw new BadRequestException('Email already exists');
        }

        const [user] = await this.db
        .insert(users)
        .values({
            name,
            email,
        })
        .returning();

        return users;
    }

    async findAll() {
        return this.db.select().from(users);
    }

    async findOne(id: string){
        const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id));

        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return user;
    }

    async update(id: string, name?: string, email?: string) {
        const [user] = await this.db
        .update(users)
        .set({
            ...(name !== undefined && {name}),
            ...(email !== undefined && {email}),
        })
        .where(eq(users.id, id))
        .returning();

        return user;
    }

    async remove(id: string) {
        await this.findOne(id);

        const [user] = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();


        return user;
    }
}
