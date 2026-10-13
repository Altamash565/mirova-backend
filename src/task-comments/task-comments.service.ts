import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import {
  boards,
  columns,
  projects,
  tasks,
  workspaceMembers,
  workspaces,
  taskComments,
} from '../database/schema';

import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';

@Injectable()
export class TaskCommentsService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: CreateTaskCommentDto,
  ) {
    await this.validateTaskAccess(
      userId,
      workspaceId,
      projectId,
      boardId,
      columnId,
      taskId,
    );

    const [comment] = await this.db
      .insert(taskComments)
      .values({
        taskId,
        userId,
        content: dto.content,
      })
      .returning();

    return comment;
  }

  async findAll(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    await this.validateTaskAccess(
      userId,
      workspaceId,
      projectId,
      boardId,
      columnId,
      taskId,
    );

    return this.db
      .select({
        id: taskComments.id,
        taskId: taskComments.taskId,
        userId: taskComments.userId,
        content: taskComments.content,
        createdAt: taskComments.createdAt,
        updatedAt: taskComments.updatedAt,
      })
      .from(taskComments)
      .where(eq(taskComments.taskId, taskId));
  }

  async update(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    commentId: string,
    dto: UpdateTaskCommentDto,
  ) {
    await this.validateTaskAccess(
      userId,
      workspaceId,
      projectId,
      boardId,
      columnId,
      taskId,
    );

    const [comment] = await this.db
      .select()
      .from(taskComments)
      .where(
        and(eq(taskComments.id, commentId), eq(taskComments.taskId, taskId)),
      );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const [updatedComment] = await this.db
      .update(taskComments)
      .set({
        content: dto.content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(taskComments.id, commentId),
          eq(taskComments.taskId, taskId),
          eq(taskComments.userId, userId),
        ),
      )

      .returning();

    return updatedComment;
  }

  async remove(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    commentId: string,
  ) {
    await this.validateTaskAccess(
      userId,
      workspaceId,
      projectId,
      boardId,
      columnId,
      taskId,
    );

    const [comment] = await this.db
      .select()
      .from(taskComments)
      .where(
        and(
          eq(taskComments.id, commentId),
          eq(taskComments.taskId, taskId),
          eq(taskComments.userId, userId),
        ),
      );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const [deletedComment] = await this.db
      .delete(taskComments)
      .where(
        and(eq(taskComments.id, commentId), eq(taskComments.taskId, taskId)),
      )
      .returning();

    return deletedComment;
  }

  private async validateTaskAccess(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (!workspace) {
      const [membership] = await this.db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        );

      if (!membership) {
        throw new ForbiddenException(
          'You do not have access to this workspace',
        );
      }
    }

    const [project] = await this.db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [board] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)));

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const [column] = await this.db
      .select()
      .from(columns)
      .where(and(eq(columns.id, columnId), eq(columns.boardId, boardId)));

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.columnId, columnId)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
