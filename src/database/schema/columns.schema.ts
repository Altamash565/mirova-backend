import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

import { boards } from './boards.schema';
import { idText } from 'typescript';

export const columns = pgTable('columns', {
  id: uuid('id').defaultRandom().primaryKey(),

  boardId: uuid('board_id')
    .notNull()
    .references(() => boards.id, {
      onDelete: 'cascade',
    }),

  name: varchar('name', {
    length: 100,
  }).notNull(),

  description: text('description'),

  position: integer('position').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
