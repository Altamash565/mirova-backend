import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', {
        length: 100,
    }).notNull().unique(),

    email: varchar('email', {
        length: 255,
    }).notNull().unique(),

    passwordHash: varchar('password_hash', {
        length: 255,
    }).notNull(),
    
    avatar: varchar('avatar', {
        length: 500,
    }),

    isVerified: boolean('is_verified')
    .default(false)
    .notNull(),

    refreshToken: varchar('refresh_token', {
        length: 500,
    }),

    createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

    updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});