import { Controller, Body, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { WorkspaceMembersService } from './workspace-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';



@Controller('workspace/:workspaceId/members')
@UseGuards(JwtAuthGuard)
export class WorkspaceMembersController {
    constructor(
        private readonly workspaceMembersService: WorkspaceMembersService,
    ) {}

    @Post()
    addMember(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Body() dto: AddMemberDto,
    ) {
        return this.workspaceMembersService.addMember(
            user.id,
            workspaceId,
            dto,
        );
    }

    @Get() 
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
    ) {
        return this.workspaceMembersService.findAll(
            user.id,
            workspaceId,
        );
    }

    @Patch(':memberId')
    updateRole(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('memberId') memberId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.workspaceMembersService.updateRole(
            user.id,
            workspaceId,
            memberId,
            dto
        );
    }

    @Delete(':memberId')
    removeMember(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('memberId') memberId: string
    ) {
        return this.workspaceMembersService.removeMember(
            user.id,
            workspaceId,
            memberId
        );
    }
}
