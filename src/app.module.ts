import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { typeOrmConfig } from './config/typorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), TasksModule],
})
export class AppModule {}
