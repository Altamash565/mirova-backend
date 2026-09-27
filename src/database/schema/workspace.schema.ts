import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

import {users} from './users.schema';

export const workspaces = pgTable('workspaces', {
    id: uuid('id')
    .defaultRandom()
    .primaryKey(),

    name: varchar('name', {
        length: 100,
    }).notNull(),

    slug: varchar('slug', {
        length: 100
    }).notNull().unique(),

    description: text('description'),

    ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, {
        onDelete: 'cascade',
    }),

    createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

    updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});