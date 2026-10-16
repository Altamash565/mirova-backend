import { Injectable, Inject, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

import {and, eq} from 'drizzle-orm';

import {DATABASE} from '../database/database.constants';
import { boards, columns, labels, projects, taskLabels, tasks, workspaceMembers, workspaces } from '../database/schema';

import { CreateLabelDto } from './dto/create-labels.dto';
import { UpdateLabelDto } from './dto/update-labels.dto';

@Injectable()
export class LabelsService {
    constructor(
        @Inject(DATABASE)
        private readonly db: any
    ) {}

    async create(
        userId: string,
        workspaceId: string,
        projectId: string,
        dto: CreateLabelDto,
    ) {
        await this.validateProjectAccess(
            userId,
            workspaceId,
            projectId,
            true,
        );

        const [existingLabel] = await this.db
        .select({id: labels.id})
        .from(labels)
        .where(
            and(
                eq(labels.projectId, projectId),
                eq(labels.name, dto.name),
            ),
        )
        .limit(1);

        if (existingLabel) {
            throw new BadRequestException(
                'A label with this name already exists in the project',
            );
        }

        const [label] = await this.db
        .insert(labels)
        .values({
            projectId,
            name: dto.name,
            ...(dto.color !== undefined && {color: dto.color}),
        })
        .returning();

        return label
    }

    // List all labels belonging to a project.
    async findAll(
        userId: string,
        workspaceId: string,
        projectId: string,
    ) {
        await this.validateProjectAccess(
            userId,
            workspaceId,
            projectId
        );

        return this.db
        .select()
        .from(labels)
        .where(eq(labels.projectId, projectId));
    }

    // Get a single label.
    async findOne(
        userId: string,
        workspaceId: string,
        projectId: string,
        labelId: string
    ) {
        await this.validateProjectAccess(
            userId,
            workspaceId,
            projectId,
        );

        return this.getLabelOrThrow(projectId, labelId)
    }

    // Update a label. Only the workspace owner can manage labels.
    async update(
        userId: string,
        workspaceId: string,
        projectId: string,
        labelId: string,
        dto: UpdateLabelDto,
    ) {
        await this.validateProjectAccess(
            userId,
            workspaceId,
            projectId,
            true,
        );

        await this.getLabelOrThrow(projectId, labelId);

        if (dto.name !== undefined) {
            const [existingLabel] = await this.db
            .select({id: labels.id})
            .from(labels)
            .where(
                and(
                    eq(labels.projectId, projectId),
                    eq(labels.name, dto.name),
                ),
            )
            .limit(1);

            if (existingLabel && existingLabel.id !== labelId) {
                throw new BadRequestException(
                    'A label with this name already exists in the project',
                );
            }
        }

        const [updatedLabel] = await this.db
        .update(labels)
        .set({
            ...dto,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(labels.id, labelId),
                eq(labels.projectId, projectId),
            ),
        )

        .returning();

        return updatedLabel;
    }

    // Delete a label. Its task assignments are deleted by the FK cascade.

    async remove(
        userId: string,
        workspaceId: string,
        projectId: string,
        labelId: string
    ){
        await this.validateProjectAccess(
            userId, 
            workspaceId,
            projectId,
            true
        );

        await this.getLabelOrThrow(projectId, labelId);

        const [deletedLabel] = await this.db
        .delete(labels)
        .where(
            and(
                eq(labels.id, labelId),
                eq(labels.projectId, projectId),
            ),
        )
        .returning();

        return {
            message: 'Label deleted successfully',
            label: deletedLabel,
        };
    }

    // List labels assigned to a task.
    async findTaskLabels(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
        taskId: string
    ) {
        await this.validateTaskAccess(
            userId,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
        );

        const assignments = await this.db
        .select({ label: labels })
        .from(taskLabels)
        .innerJoin(labels, eq(taskLabels.labelId, labels.id))
        .where(eq(taskLabels.taskId, taskId));

        return assignments.map((assignments: { label: unknown}) => assignments.label)
    }

    // Assign a project label to a task.
    async assignToTask(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
        taskId: string,
        labelId: string,
    ) {
        await this.validateTaskAccess(
            userId, 
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId
        );

        await this.getLabelOrThrow(projectId, labelId);

        const [existingAssignment] = await this.db
        .select({id : taskLabels.id})
        .from(taskLabels)
        .where(
            and(
                eq(taskLabels.taskId, taskId),
                eq(taskLabels.labelId, labelId),
            ),
        )

        .limit(1);

        if (existingAssignment) {
            throw new BadRequestException(
                'This label is already assigned to the task',
            );
        }

        const [assignment] = await this.db
        .insert(taskLabels)
        .values({ taskId, labelId})
        .returning()

        return assignment
    }

    // Remove a label from a task
    async removeFromTask(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
        taskId: string,
        labelId: string
    ) {
        await this.validateTaskAccess(
            userId,
            workspaceId,
            projectId,
            boardId,
            columnId,
            taskId,
        );

        const [assignment] = await this.db
        .select({ id: taskLabels.id})
        .from(taskLabels)
        .innerJoin(labels, eq(taskLabels.labelId, labels.id))
        .where(
            and(
                eq(taskLabels.taskId, taskId),
                eq(taskLabels.labelId, labelId),
                eq(labels.projectId, projectId),
            ),
        )
        .limit(1);

        if (!assignment) {
            throw new NotFoundException(
                'This label is not assigned to the task',
            );
        }

        await this.db
        .delete(taskLabels)
        .where(eq(taskLabels.id, assignment.id));

        return {message: 'Label removed from task successfully'}
    }

    private async getLabelOrThrow(
        projectId: string,
        labelId: string,
    ) {
        const [label] = await this.db
        .select()
        .from(labels)
        .where(
            and(
                eq(labels.id, labelId),
                eq(labels.projectId, projectId),
            ),
        )
        .limit(1);

        if (!label) {
            throw new NotFoundException('Label not found');
        }

        return label;
    }

    private async validateProjectAccess(
        userId: string,
        workspaceId: string,
        projectId: string,
        ownerOnly: boolean = false, 
    ) {
        const [workspace] = await this.db
        .select({
            id: workspaces.id,
            ownerId: workspaces.ownerId
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

        if (!workspace) {
            throw new NotFoundException('Workspace not found')
        }

        const isOnwer = workspace.ownerId == userId;

        if (!isOnwer) {
            const [memebership] = await this.db
            .select({id: workspaceMembers.id})
            .from(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, userId),
                ),
            )

            .limit(1);

            if (!memebership) {
                throw new ForbiddenException(
                    'You do not have access to this workspace',
                );
            }
        }

        if (ownerOnly && !isOnwer) {
            throw new ForbiddenException(
                'Only the workspace owner can manage labels'
            );
        }

        const [project] = await this.db
        .select({ id: projects.id})
        .from(projects)
        .where(
            and(
                eq(projects.id, projectId),
                eq(projects.workspaceId, workspaceId),
            ),
        )
        .limit(1);

        if(!project) {
            throw new NotFoundException(
                'Project not found in this workspace',
            );
        }
    }

    private async validateTaskAccess(
        userId: string,
        workspaceId: string,
        projectId: string,
        boardId: string,
        columnId: string,
        taskId: string
    ) {
        await this.validateProjectAccess(
            userId,
            workspaceId,
            projectId
        );

        const [board] = await this.db
        .select({id: boards.id})
        .from(boards)
        .where(
            and(
                eq(boards.id, boardId),
                eq(boards.projectId, projectId),
            ),
        )
        .limit(1);

        if (!board) {
            throw new NotFoundException(
                'Board not found in this project',
            );
        }


        const [column] = await this.db
        .select({id: columns.id})
        .from(columns)
        .where(
            and(
                eq(columns.id, columnId),
                eq(columns.boardId, boardId),
            ),
        )
        .limit(1);

        if (!column) {
            throw new NotFoundException(
                'Column not found in this board',
            );
        }

        const [task] = await this.db
        .select({id: tasks.id})
        .from(tasks)
        .where(
            and(
                eq(tasks.id, taskId),
                eq(tasks.columnId, columnId),
            ),
        )
        .limit(1);

        if (!task) {
            throw new NotFoundException(
                'Task not found in this column',
            );
        }
    }
}
