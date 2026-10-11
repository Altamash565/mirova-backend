import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

import { tasks } from './tasks.schema';
import { users } from './users.schema';

export const taskComments = pgTable('task_comments', {
  id: uuid('id').defaultRandom().primaryKey(),

  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, {
      onDelete: 'cascade',
    }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  content: text('content').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
