import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { eq, and } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';
import { workspaces } from '../database/schema';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = this.generateSlug(dto.name);

    const existingWorkspace = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug));

    if (existingWorkspace.length > 0) {
      throw new ConflictException('Workspace with this name already exists');
    }

    const [workspace] = await this.db
      .insert(workspaces)
      .values({
        name: dto.name,
        slug,
        description: dto.description,
        ownerId: userId,
      })
      .returning();

    return workspace;
  }

  async findAll(userId: string) {
    return this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, userId));
  }

  async findOne(userId: string, workspaceId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.findOne(userId, workspaceId);

    const [workspace] = await this.db
      .update(workspaces)
      .set({
        ...dto,
        updatedAt: new Date(),
      })

      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      )
      .returning();

    return workspace;
  }

  async remove(userId: string, workspaceId: string) {
    await this.findOne(userId, workspaceId);

    const [workspace] = await this.db
      .delete(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      )
      .returning();

    return workspace;
  }

  private generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
