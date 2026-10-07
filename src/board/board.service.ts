import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import {
  boards,
  projects,
  workspaceMembers,
  workspaces,
} from '../database/schema';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateBoardDto,
  ) {
    // Only workspace owner can create boards
    await this.checkWorkspaceOwner(userId, workspaceId);

    // Make sure project belongs to workspace
    await this.findProject(projectId, workspaceId);

    // Prevent duplicate board names inside the same project
    const [existingBoard] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.projectId, projectId), eq(boards.name, dto.name)));

    if (existingBoard) {
      throw new ConflictException(
        'A board with this name already exists in this project',
      );
    }

    const [board] = await this.db
      .insert(boards)
      .values({
        projectId,
        name: dto.name,
        description: dto.description,
      })
      .returning();

    return board;
  }

  async findAll(userId: string, workspaceId: string, projectId: string) {
    await this.checkWorkspaceAccess(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    return this.db.select().from(boards).where(eq(boards.projectId, projectId));
  }

  async findOne(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
  ) {
    await this.checkWorkspaceAccess(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [board] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)));

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async update(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
    dto: UpdateBoardDto,
  ) {
    await this.checkWorkspaceOwner(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [existingBoard] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)));

    if (!existingBoard) {
      throw new NotFoundException('Board not found');
    }

    if (dto.name && dto.name !== existingBoard.name) {
      const [duplicateBoard] = await this.db
        .select()
        .from(boards)
        .where(and(eq(boards.projectId, projectId), eq(boards.name, dto.name)));

      if (duplicateBoard) {
        throw new ConflictException(
          'A board with this name already exists in this project',
        );
      }
    }

    const [board] = await this.db
      .update(boards)
      .set({
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        updatedAt: new Date(),
      })
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)))
      .returning();

    return board;
  }

  async remove(
    userId: string,
    workspaceId: string,
    projectId: string,
    boardId: string,
  ) {
    await this.checkWorkspaceOwner(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [board] = await this.db
      .delete(boards)
      .where(and(eq(boards.id, boardId), eq(boards.projectId, projectId)))
      .returning();

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
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

  private async checkWorkspaceOwner(userId: string, workspaceId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (!workspace) {
      throw new ForbiddenException(
        'Only the workspace owner can manage boards',
      );
    }

    return workspace;
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
