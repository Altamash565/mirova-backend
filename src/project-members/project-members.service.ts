import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import {
  users,
  projects,
  workspaceMembers,
  projectMembers,
  workspaces,
} from '../database/schema';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';

@Injectable()
export class ProjectMembersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async addMember(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: AddProjectMemberDto,
  ) {
    // 1. Only workspace owner can manage project members
    await this.checkWorkspaceOwner(userId, workspaceId);

    // 2. Make sure project belongs to this workspace
    await this.findProject(projectId, workspaceId);

    // 3. Find target user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 4. Make sure target user belongs to workspace
    const [workspaceMember] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, user.id),
        ),
      );

    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, user.id)),
      );

    if (!workspaceMember && !workspace) {
      throw new ForbiddenException(
        'User must be a member of the workspace first',
      );
    }

    // 5. Check if already a project member
    const [existingMember] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, user.id),
        ),
      );

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    // 6. Add member
    const [member] = await this.db
      .insert(projectMembers)
      .values({
        projectId,
        userId: user.id,
        role: dto.role ?? 'member',
      })

      .returning();

    return member;
  }

  async findAll(userId: string, workspaceId: string, projectId: string) {
    // User must have access to workspace
    await this.checkWorkspaceAccess(userId, workspaceId);

    // Project must belong to workspace
    await this.findProject(projectId, workspaceId);

    const members = await this.db
      .select({
        id: projectMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: projectMembers.role,
        createdAt: projectMembers.createdAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));

    return members;
  }

  async updateRole(
    userId: string,
    workspaceId: string,
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberRoleDto,
  ) {
    await this.checkWorkspaceOwner(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.id, memberId),
          eq(projectMembers.projectId, projectId),
        ),
      );

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    const [updatedMember] = await this.db
      .update(projectMembers)
      .set({
        role: dto.role,
        updatedAt: new Date(),
      })
      .where(eq(projectMembers.id, memberId))
      .returning();

    return updatedMember;
  }

  async removeMember(
    userId: string,
    workspaceId: string,
    projectId: string,
    memberId: string,
  ) {
    await this.checkWorkspaceOwner(userId, workspaceId);

    await this.findProject(projectId, workspaceId);

    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.id, memberId),
          eq(projectMembers.projectId, projectId),
        ),
      );

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    const [deletedMember] = await this.db
      .delete(projectMembers)
      .where(eq(projectMembers.id, memberId))
      .returning();

    return deletedMember;
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
        'Only the workspace owner can manage project members',
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
        throw new ForbiddenException(
            'You do not have access to this workspace',
        );
      }

      return member;
    }
}
