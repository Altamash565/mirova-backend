import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateLabelDto } from './dto/create-labels.dto';
import { UpdateLabelDto } from './dto/update-labels.dto';


@Controller('workspace/:workspaceId/projects/:projectId')
@UseGuards(JwtAuthGuard)
export class LabelsController {
    constructor(
        private readonly labelsService: LabelsService,
    ) {}

    // Create a label
    @Post('labels') 
    create(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateLabelDto,
) {
    return this.labelsService.create(
        user.id,
        workspaceId,
        projectId,
        dto
    );
}

// List project labels
@Get('labels') 
    findAll(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
) {
    return this.labelsService.findAll(
        user.id,
        workspaceId,
        projectId,
    );
}

// Get one label
@Get('labels/:labelId') 
    findOne(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    
) {
    return this.labelsService.findOne(
        user.id,
        workspaceId,
        projectId,
        labelId
    );
}

// Update a label
@Patch('labels/:labelId') 
    update(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
) {
    return this.labelsService.update(
        user.id,
        workspaceId,
        projectId,
        labelId,
        dto
    );
}

// Delete a label
@Delete('labels/:labelId') 
    remove(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
) {
    return this.labelsService.remove(
        user.id,
        workspaceId,
        projectId,
        labelId
    );
}

// List labels assigned to a task

@Get('boards/:boardId/columns/:columnId/tasks/:taskId/labels') 
    findTaskLabels(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
) {
    return this.labelsService.findTaskLabels(
        user.id,
        workspaceId,
        projectId,
        boardId,
        columnId,
        taskId,
    );
}

// Assign a label to a taks
@Post('boards/:boardId/columns/:columnId/tasks/:taskId/labels/:labelId') 
    assignToTask(
    @CurrentUser() user: {id: string},
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
) {
    return this.labelsService.assignToTask(
        user.id,
        workspaceId,
        projectId,
        boardId,
        columnId,
        taskId,
        labelId,
    );
}

// Remove a label from a task
  @Delete(
    'boards/:boardId/columns/:columnId/tasks/:taskId/labels/:labelId',
  )
  removeFromTask(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.removeFromTask(
      user.id,
      workspaceId,
      projectId,
      boardId,
      columnId,
      taskId,
      labelId,
    );
  }
}
