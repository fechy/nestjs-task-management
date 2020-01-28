import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTaskFilteredDto } from './dto/get-task-filtered.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const newTask = new Task();
    newTask.title = title;
    newTask.description = description;
    newTask.status = TaskStatus.OPEN;
    newTask.user = user;

    await newTask.save();

    delete newTask.user;

    return newTask;
  }

  async getTasks(filterDto: GetTaskFilteredDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where(`task.userId = :userId`, { userId: user.id });

    if (status) {
      query.andWhere(`task.status = :status`, { status });
    }

    if (search) {
      query.andWhere(
        `task.title LIKE :search OR task.description LIKE :search`,
        { search: `%${search}%` },
      );
    }

    return await query.getMany();
  }
}
