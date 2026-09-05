import {
    pgTable,
    uuid,
    varchar,
    timestamp
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', {
        length: 100,
    }).notNull().unique(),

    email: varchar('email', {
        length: 255,
    }).notNull().unique(),

    createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
} )