import { Controller, Body, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { ProjectMembersService } from './project-members.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';


@Controller('workspace/:workspaceId/projects/:projectId/members',)

@UseGuards(JwtAuthGuard)
export class ProjectMembersController {
    constructor(
        private readonly projectMemberService: ProjectMembersService,
    ) {}

    @Post()
    addMember(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Body() dto: AddProjectMemberDto,
    ) {
        return this.projectMemberService.addMember(
            user.id,
            workspaceId,
            projectId,
            dto
        );
    }

    @Get()
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.projectMemberService.findAll(
            user.id,
            workspaceId,
            projectId
        );
    }

    @Patch(':/memberId')
    updateRole(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
        @Body() dto: UpdateProjectMemberRoleDto,
    ) {
        return this.projectMemberService.updateRole(
            user.id,
            workspaceId,
            projectId,
            memberId,
            dto,
        );
    }

    @Delete(':memberId')
    removeMember(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
    ) {
        return this.projectMemberService.removeMember(
            user.id,
            workspaceId,
            projectId,
            memberId
        )
    }
}

