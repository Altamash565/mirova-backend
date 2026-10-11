import { Body, Controller, Delete, Get, Post, Param, Patch, UseGuards } from '@nestjs/common';

import { TaskCommentsService } from './task-comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';


@Controller('workspace/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments')

@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
    constructor(
        private readonly taskCommentService: TaskCommentsService,
    ) {}

    @Post()
    create(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskCommentDto,
    ) {
        return this.taskCommentService.create(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
            dto,
        );
    }

    @Get()
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.taskCommentService.findAll(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
        );
    }

    @Patch(':commentId')
    update(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateTaskCommentDto,
    ) {
        return this.taskCommentService.update(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
            commentId,
            dto
        );
    }

    @Delete(':commentId')
    remove(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Param('taskId') taskId: string,
        @Param('commentId') commentId: string,
    ) {
        return this.taskCommentService.remove(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
            commentId,
        );
    }

}
