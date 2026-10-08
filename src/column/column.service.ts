import { Injectable, Inject, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { and, asc, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';

import { boards, columns, projects, workspaceMembers, workspaces } from '../database/schema';

import { CreateColumnDto } from './dto/create-column.dto';

import { UpdateColumnDto } from './dto/update-column.dto';



@Injectable()
export class ColumnService {

    constructor(
        @Inject(DATABASE)
        private readonly db: any,
    ) {}

    async create(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        dto: CreateColumnDto,
    ) {
        await this.checkWorkspaceOwner(userId, workspaceId);

        await this.findProject(projectId, workspaceId);

        await this.findBoard(boardId, projectId);

        const [existingColumn] = await this.db
        .select()
        .from(columns)
        .where(
            and(
                eq(columns.boardId, boardId),
                eq(columns.name, dto.name),
            ),
        );

        if(existingColumn) {
            throw new ConflictException(
                'A column with this name already exists on this board',
            );
        }

        const [column] = await this.db
        .insert(columns)
        .values({
            boardId,
            name: dto.name,
            description: dto.description,
            position: dto.position ?? 0,
        })
        .returning();

        return column;
    }

    async findAll(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string

    ) {
        await this.checkWorkspaceAccess(userId, workspaceId);

        await this.findProject(projectId, workspaceId);

        await this.findBoard(boardId, projectId);

        return this.db
        .select()
        .from(columns)
        .where(eq(columns.boardId, boardId))
        .orderBy(asc(columns.position));
    }

    async findOne(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
    ) {
        await this.checkWorkspaceAccess(userId, workspaceId);

        await this.findProject(projectId, workspaceId);

        await this.findBoard(boardId, projectId);


        const [column] = await this.db
        .select()
        .from(columns)
        .where(
            and(
                eq(columns.id, columnId),
                eq(columns.boardId, boardId),
            ),
        );

        if(!column) {
            throw new NotFoundException('Column not found');
        }

        return column;
    }

    async update(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
        dto: UpdateColumnDto,
    ) {
        await this.checkWorkspaceOwner(userId, workspaceId)

        await this.findProject(projectId, workspaceId);

        await this.findBoard(boardId, projectId);

        const [existingColumn] = await this.db
        .select()
        .from(columns)
        .where(
            and(
                eq(columns.id, columnId),
                eq(columns.boardId, boardId),
            ),
        );

        if(!existingColumn) {
            throw new NotFoundException('Column not found');
        }

        if (
            dto.name !== undefined && 
            dto.name !== existingColumn.name
        ) {
            const [duplicateColumn] = await this.db
            .select()
            .from(columns)
            .where(
                and(
                    eq(columns.boardId, boardId),
                    eq(columns.name, dto.name),
                ),
            );


            if (duplicateColumn) {
                throw new ConflictException(
                    'A column with this name already exists on this board',
                );
            }
        }

        const [column] = await this.db
        .update(columns)
        .set({
            ...(dto.name !== undefined && {
                name: dto.name,
            }),

            ...(dto.description !== undefined && {
                description: dto.description,
            }),

            ...(dto.position !== undefined && {
                position: dto.position,
            }),


            updatedAt: new Date(),
        })
        .where(
            and(
                eq(columns.id, columnId),
                eq(columns.boardId, boardId),
            ),
        )
        .returning();

        return column;
    }

    async remove(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
    ) {
        await this.checkWorkspaceOwner(userId, workspaceId);

        await this.findProject(projectId, workspaceId);

        await this.findBoard(boardId, projectId);

        const [column] = await this.db
        .delete(columns)
        .where(
            and(
                eq(columns.id, columnId),
                eq(columns.boardId, boardId),
            ),
        )

        .returning();


        if (!column) {
            throw new NotFoundException('Column not found');
        }


        return column;
    }

    private async findProject(
        projectId: string,
        workspaceId: string
    ) {
        const [project] = await this.db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.id, projectId),
                eq(projects.workspaceId, workspaceId)
            ),
        );

        if(!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    private async findBoard(
        boardId: string,
        projectId: string,
    ) {
        const [board] = await this.db
        .select()
        .from(boards)
        .where(
            and(
                eq(boards.id, boardId),
                eq(boards.projectId, projectId),
            ),
        );

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return board;
    }

    private async checkWorkspaceOwner(
        userId: string,
        workspaceId: string,
    ) {
        const [workspace] = await this.db
        .select()
        .from(workspaces)
        .where(
            and(
                eq(workspaces.id, workspaceId),
                eq(workspaces.ownerId, userId),
            )
        );

        if (!workspace) {
            throw new ForbiddenException(
                'Only the workspace owner can manage columns'
            );
        }

        return workspace;
    }

    private async checkWorkspaceAccess(
        userId: string,
        workspaceId: string
    ) {
        const [workspace] = await this.db
        .select()
        .from(workspaces)
        .where(
            and(
                eq(workspaces.id, workspaceId),
                eq(workspaces.ownerId, userId),
            ),
        );

        if(workspace) {
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

        if(!member) {
            throw new ForbiddenException(
                'You do not have access to this workspace',
            );
        }

        return member;
    }
}
