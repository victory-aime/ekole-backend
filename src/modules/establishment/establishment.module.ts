import { Module } from '@nestjs/common';
import { EstablishmentService } from './establishment.service';
import { EstablishmentController } from './establishment.controller';
import { SchoolYearService } from '../school-year/school-year.service';

@Module({
  providers: [EstablishmentService, SchoolYearService],
  controllers: [EstablishmentController],
})
export class EstablishmentModule {}
