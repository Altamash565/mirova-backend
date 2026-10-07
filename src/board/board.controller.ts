import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BoardService } from './board.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('workspace/:workspaceId/projects/:projectId/boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardService.create(user.id, workspaceId, projectId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.boardService.findAll(user.id, workspaceId, projectId);
  }

  @Get(':boardId')
  findOne(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.boardService.findOne(user.id, workspaceId, projectId, boardId);
  }

  @Patch(':boardId')
  update(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardService.update(
      user.id,
      workspaceId,
      projectId,
      boardId,
      dto,
    );
  }

  @Delete(':boardId')
  remove(
    @CurrentUser() user: { id: string },
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.boardService.remove(user.id, workspaceId, projectId, boardId);
  }
}
