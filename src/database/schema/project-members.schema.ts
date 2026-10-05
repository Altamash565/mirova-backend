import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users.schema';
import { projects } from './projects.schema';

export const projectMembers = pgTable('project_members', {
  id: uuid('id').defaultRandom().primaryKey(),

  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, {
      onDelete: 'cascade',
    }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  role: varchar('role', {
    length: 50,
  })
    .notNull()
    .default('member'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
