import { uuid, varchar, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

import { workspaces } from './workspace.schema';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),

  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, {
      onDelete: 'cascade',
    }),

  name: varchar('name', {
    length: 100,
  }).notNull(),

  key: varchar('key', {
    length: 10,
  }).notNull(),

  description: text('description'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
