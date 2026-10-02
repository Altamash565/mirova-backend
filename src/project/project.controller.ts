import { Controller, Body, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';


@Controller('workspace/:workspaceId/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Post()
    create(
        @CurrentUser() user: { id: string },
        @Param('workspaceId') workspaceId: string,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectService.create(user.id, workspaceId, dto);
    }

    @Get()
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
    ) {
        return this.projectService.findAll(user.id, workspaceId)
    }

    @Get(':projectId')
    findOne(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.projectService.findOne(user.id, workspaceId, projectId)
    }

    @Patch(':projectId')
    update(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectService.update(
            user.id,
            workspaceId,
            projectId,
            dto,
        );
    }

    @Delete(':projectId') 
    remove(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.projectService.remove(user.id, workspaceId, projectId)
    }
}
