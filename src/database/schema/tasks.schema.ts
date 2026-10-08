import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { columns } from './columns.schema';

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),

  columnId: uuid('column_id')
    .notNull()
    .references(() => columns.id, {
      onDelete: 'cascade',
    }),

  creatorId: uuid('created_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  assigneeId: uuid('assignee_id').references(() => users.id, {
    onDelete: 'set null',
  }),

  title: varchar('title', {
    length: 200,
  }).notNull(),

  description: text('description'),

  priority: varchar('priority', {
    length: 20,
  })
    .notNull()
    .default('medium'),

  status: varchar('status', {
    length: 30,
  })
    .notNull()
    .default('todo'),

  position: integer('position').notNull().default(0),

  dueDate: timestamp('due_date'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
