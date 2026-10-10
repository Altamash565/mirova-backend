import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { TaskService } from './task.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('workspace/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks')

@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
    ) {}

    @Post()
    create(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Body() dto: CreateTaskDto,
    ) {
        return this.taskService.create(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            dto,
        );
    }

    @Get()
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string
    ) {
        return this.taskService.findAll(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
        );
    }

    @Get(':taskId')
    findOne(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.taskService.findOne(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId
        );
    }

    @Patch(':taskId')
    update(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.taskService.update(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
            dto,
        );
    }

    @Delete(':taskId') 
    remove(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.taskService.remove(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
        );
    }
}
