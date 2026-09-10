import { uuid, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";

import { users } from "./users.schema";


export const refreshSessions = pgTable (
    'refresh_sessions',
    {
        id: uuid('id').defaultRandom().primaryKey(),

        userId: uuid('user_id')
        .notNull()
        .references(() => users.id , {
          onDelete: 'cascade',

        }),

        tokenHash: varchar('token_hash' , {
            length: 255,
        }).notNull(),

        expiresAt: timestamp('expires_at')
        .notNull(),

        revokedAt: timestamp('revoked_at'),

        createdAt: timestamp('created_at')
        .defaultNow()
        .notNull(),
    },
);