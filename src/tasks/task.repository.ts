import { EntityRepository, FindManyOptions, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTaskFilteredDto } from './dto/get-task-filtered.dto';
import { FindConditions } from 'typeorm/find-options/FindConditions';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const newTask = new Task();
    newTask.title = title;
    newTask.description = description;
    newTask.status = TaskStatus.OPEN;

    await newTask.save();

    return newTask;
  }

  async getTasks(filterDto: GetTaskFilteredDto): Promise<Task[]> {
    const criteria: FindManyOptions = {
      where: {
        status: filterDto.status,
      } as FindConditions<Task>,
    };
    return await this.find(criteria);
  }
}
