import { Test, TestingModule } from '@nestjs/testing';
import { TaskCommentsController } from './task-comments.controller';

describe('TaskCommentsController', () => {
  let controller: TaskCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskCommentsController],
    }).compile();

    controller = module.get<TaskCommentsController>(TaskCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
