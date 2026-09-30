import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';
import { users, workspaces, workspaceMembers } from '../database/schema';

import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  // =============================
  // ADD MEMBER
  // =============================

  async addMember(userId: string, workspaceId: string, dto: AddMemberDto) {
    // 1. Check workspace ownership
    await this.checkWorkspaceOwner(userId, workspaceId);

    // 2. Find user by email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Prevent owner from being added as a member
    if (user.id === userId) {
      throw new ConflictException(
        'Workspace owner cannot be added as a member',
      );
    }

    // 4. Check whether user is already a member
    const [existingMember] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, user.id),
        ),
      );

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    // 5. Create membership
    const [member] = await this.db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: user.id,
        role: dto.role,
      })

      .returning();

    return member;
  }

  // ===========================
  // GET MEMBERS
  // ===========================

  async findAll(userId: string, workspaceId: string) {
    // User must be owner or member
    await this.checkWorkspaceAccess(userId, workspaceId);

    const members = await this.db
      .select({
        id: workspaceMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
      })

      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return members;
  }

  // ==========================
  // UPDATE MEMBER ROLE
  // ==========================

  async updateRole(
    userId: string,
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
    // Only owner can change roles

    await this.checkWorkspaceOwner(userId, workspaceId);

    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );

    if (!member) {
      throw new NotFoundException('workspace member not found');
    }

    const [updatedMember] = await this.db
      .update(workspaceMembers)
      .set({
        role: dto.role,
        updatedAt: new Date(),
      })
      .where(eq(workspaceMembers.id, memberId))
      .returning();

    return updatedMember;
  }

  // =============================
  // REMOVE MEMBER
  // =============================

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    // Only owner can remove members
    await this.checkWorkspaceOwner(userId, workspaceId);

    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );

    if (!member) {
      throw new NotFoundException('Workspace member not found');
    }

    const [deletedMember] = await this.db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))
      .returning();

    return deletedMember;
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
      throw new ForbiddenException('You are not the owner of this workspace');
    }

    return workspace;
  }

  // ============================================
  // CHECK WORKSPACE ACCESS
  // ============================================

  private async checkWorkspaceAccess(userId: string, workspaceId: string) {
    // Check owner first
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)),
      );

    if (workspace) {
      return workspace;
    }

    // Check member
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
