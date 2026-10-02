import {
  Inject,
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import { projects, workspaceMembers, workspaces } from '../database/schema';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  // =========================
  // CREATE PROJECT
  // =========================

  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    // Only workspace owner can create projects
    await this.checkWorkspaceOwner(userId, workspaceId);

    // Check whether project key already exists
    const [existingProject] = await this.db
      .select()
      .from(projects)
      .where(
        and(eq(projects.workspaceId, workspaceId), eq(projects.key, dto.key.toUpperCase())),
      );

    if (existingProject) {
      throw new ConflictException(
        'A project with this key already exists in this workspace',
      );
    }

    const [project] = await this.db
      .insert(projects)
      .values({
        workspaceId,
        name: dto.name,
        key: dto.key.toUpperCase(),
        description: dto.description,
      })
      .returning();

    return project;
  }

  // =============================
  // GET ALL PROJECTS
  // =============================

  async findAll(userId: string, workspaceId: string) {
    await this.checkWorkspaceAccess(userId, workspaceId);

    return this.db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));
  }

  // =========================
  // GET ONE PROJECT
  // =========================

  async findOne(userId: string, workspaceId: string, projectId: string) {
    await this.checkWorkspaceAccess(userId, workspaceId);

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

  // ============================================
  // UPDATE PROJECT
  // ============================================

  async update(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    // Only owner can update
    await this.checkWorkspaceOwner(userId, workspaceId);

    // Make sure project exists in this workspace
    await this.findProject(projectId, workspaceId);

    // If key is being changed, check duplicate
    if (dto.key) {
      const [existingProject] = await this.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.workspaceId, workspaceId),
            eq(projects.key, dto.key.toUpperCase()),
          ),
        );

      if (existingProject && existingProject.id !== projectId) {
        throw new ConflictException('A project with this key already exists');
      }
    }

    const [project] = await this.db
      .update(projects)
      .set({
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.key !== undefined && {
          key: dto.key.toUpperCase(),
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        updatedAt: new Date(),
      })
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )

      .returning();

    return project;
  }

  // ============================================
  // DELETE PROJECT
  // ============================================

  async remove(userId: string, workspaceId: string, projectId: string) {
    // Only owner can delete
    await this.checkWorkspaceOwner(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [project] = await this.db
      .delete(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )

      .returning();

    return project;
  }

  // ============================================
  // CHECK PROJECT EXISTS
  // ============================================

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

  // ============================================
  // CHECK WORKSPACE OWNER
  // ============================================

  private async checkWorkspaceOwner(userId: string, workspaceId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (!workspace) {
      throw new ForbiddenException(
        'Only the workspace owner can perform this action',
      );
    }

    return workspace;
  }

  // ============================================
  // CHECK WORKSPACE ACCESS
  // ============================================

  private async checkWorkspaceAccess(userId: string, workspaceId: string) {
    // Owner
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (workspace) {
      return workspace;
    }

    // Member
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
