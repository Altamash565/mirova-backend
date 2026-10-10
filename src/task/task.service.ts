import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { and, asc, eq, Update } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import {
  boards,
  columns,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from '../database/schema';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
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
    dto: CreateTaskDto,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);
    await this.findProject(projectId, workspaceId);
    await this.findBoard(boardId, projectId);
    await this.findColumn(columnId, boardId);

    if (dto.assigneeId) {
      await this.validateAssignee(dto.assigneeId, workspaceId);
    }

    const [task] = await this.db
      .insert(tasks)
      .values({
        columnId,
        createId: userId,
        assigneeId: dto.assigneeId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'medium',
        status: dto.status ?? 'todo',
        position: dto.position ?? 0,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      })
      .returning();

    return task;
  }

  async findAll(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);
    await this.findProject(projectId, workspaceId);
    await this.findBoard(boardId, projectId);
    await this.findColumn(columnId, boardId);

    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.columnId, columnId))
      .orderBy(asc(tasks.position));
  }

  async findOne(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);
    await this.findProject(projectId, workspaceId);
    await this.findBoard(boardId, projectId);
    await this.findColumn(columnId, boardId);

    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.columnId, columnId)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);
    await this.findProject(projectId, workspaceId);
    await this.findBoard(boardId, projectId);
    await this.findColumn(columnId, boardId);

    const [existingTask] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.columnId, columnId)));

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    if (dto.assigneeId) {
      await this.validateAssignee(dto.assigneeId, workspaceId);
    }

    const [task] = await this.db
      .update(tasks)
      .set({
        ...(dto.title !== undefined && {
          title: dto.title,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.priority !== undefined && {
          priority: dto.priority,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),

        ...(dto.position !== undefined && {
          position: dto.position,
        }),

        ...(dto.assigneeId !== undefined && {
          assigneeId: dto.assigneeId,
        }),

        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate,
        }),

        updateAt: new Date(),
      })

      .where(and(eq(tasks.id, taskId), eq(tasks.columnId, columnId)))

      .returning();

    return task;
  }

  async remove(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);
    await this.findProject(projectId, workspaceId);
    await this.findBoard(boardId, projectId);
    await this.findColumn(columnId, boardId);

    const [task] = await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.columnId, columnId)))

      .returning();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async validateAssignee(assigneeId: string, workspaceId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, assigneeId)),
      );

    if (workspace) {
      return;
    }

    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, assigneeId),
        ),
      );

    if (!member) {
      throw new ForbiddenException(
        'Assignee must be a member of this workspace',
      );
    }
  }

  private async findProject(projectId: string, workspaceId: string) {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async findBoard(boardId: string, projectId: string) {
    const [board] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)));

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  private async findColumn(columnId: string, boardId: string) {
    const [column] = await this.db
      .select()
      .from(columns)
      .where(and(eq(columns.id, columnId), eq(columns.boardId, boardId)));

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  private async checkWorkspaceAccess(userId: string, workspaceId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (workspace) {
      return workspace;
    }

    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (!member) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return member;
  }
}
