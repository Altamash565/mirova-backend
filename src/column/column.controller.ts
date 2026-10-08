import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { ColumnService } from './column.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('workspace/:workspaceId/projects/:projectId/boards/:boardId/columns')

@UseGuards(JwtAuthGuard)

export class ColumnController {
    constructor(
        private readonly columnService: ColumnService,
    ) {}

    @Post()
    create(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Body() dto: CreateColumnDto,
    ) {
        return this.columnService.create(
            user.id,
            workspaceId,
            projectId,
            boardId,
            dto,
        );
    }

    @Get()
    findAll(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
    ) {
        return this.columnService.findAll(
            user.id,
            workspaceId,
            projectId,
            boardId,
        );
    }

    @Get(':columnId')
    findOne(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
    ) {
        return this.columnService.findOne(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
        );
    }

    @Patch(':columnId')
    update(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string,
        @Body() dto: UpdateColumnDto,
    ) {
        return this.columnService.update(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
            dto
        );
    }

    @Delete(':columnId')
    remove(
        @CurrentUser() user: {id: string},
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('boardId') boardId: string,
        @Param('columnId') columnId: string
    ) {
        return this.columnService.remove(
            user.id,
            workspaceId,
            projectId,
            boardId,
            columnId,
        );
    }
}
