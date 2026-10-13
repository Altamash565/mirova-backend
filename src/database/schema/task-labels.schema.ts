import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { tasks } from './tasks.schema';
import { labels } from './labels.schema';

export const taskLabels = pgTable(
  'task_labels',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),

    labelId: uuid('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('task_labels_task_label_unique').on(
      table.taskId,
      table.labelId,
    ),
  ],
);
