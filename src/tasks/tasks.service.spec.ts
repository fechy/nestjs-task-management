import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTaskFilteredDto } from './dto/get-task-filtered.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser = {
  id: 1,
  username: 'test-user',
};

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('returned');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTaskFilteredDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'some search query',
      };

      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('returned');
    });
  });

  describe('getTaskById', () => {
    it('get a task from the repository by id', async () => {
      const mockTask = { title: 'test', description: 'descr' };
      taskRepository.findOne.mockResolvedValue(mockTask);
      expect(taskRepository.findOne).not.toHaveBeenCalled();

      const result = await tasksService.getTaskById(1, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalled();
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
      expect(result).toEqual(mockTask);
    });

    it('throws an error if task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskRepository.findOne).not.toHaveBeenCalled();

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });
  });

  describe('CreateTask', () => {
    it('Calls taskRepository.createTask(), creates and returns a new task', async () => {
      const createTaskDto = {
        title: 'title',
        description: 'description',
      };

      taskRepository.createTask.mockResolvedValue('new task');
      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result).toEqual('new task');
    });
  });

  describe('deleteTaskById', () => {
    it('Calls taskRepository.delete() and deletes a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('Throws new NotFoundException when trying to delete an nonexistent task', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('Updates a task status', async () => {
      const response = {
        status: TaskStatus.OPEN,
        save: jest.fn().mockResolvedValue(true),
      };

      tasksService.getTaskById = jest
        .fn()
        .mockResolvedValue(Promise.resolve(response));

      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(response.save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });

    it('Throw NotFoundException if the task does not exist', () => {
      tasksService.getTaskById = jest
        .fn()
        .mockResolvedValue(Promise.resolve(null));

      expect(
        tasksService.updateTaskStatus(1, TaskStatus.IN_PROGRESS, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
