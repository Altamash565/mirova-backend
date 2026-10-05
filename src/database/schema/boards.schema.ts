import {pgTable, uuid, varchar, text, timestamp} from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';

export const boards = pgTable('boards', {
    id: uuid('id').defaultRandom().primaryKey(),

    projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, {
        onDelete: 'cascade',
    }),

    name: varchar('name', {
        length: 100
    }).notNull(),

    description: text('description'),


    createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

    updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
})