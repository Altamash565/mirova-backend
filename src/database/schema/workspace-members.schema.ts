import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users.schema';
import { workspaces } from './workspace.schema';

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),

  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, {
      onDelete: 'cascade',
    }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  role: varchar('role', {
    length: 20,
  })
    .notNull()
    .default('MEMBER'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
