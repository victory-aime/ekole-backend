import { Module } from '@nestjs/common';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { SchoolYearCronService } from './school-year.cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SchoolYearService, SchoolYearCronService],
  controllers: [SchoolYearController],
})
export class SchoolYearModule {}
