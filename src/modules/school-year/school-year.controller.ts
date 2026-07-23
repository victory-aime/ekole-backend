import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { SchoolYearService } from './school-year.service';
import { API_URL } from '../../config/api';
import { BASE_APIS_URL } from '../../config/enum';
import { ICreateSchoolYear, IUpdateTrimestre } from './school-year.dto';

@Controller(BASE_APIS_URL.SECURED)
export class SchoolYearController {
  constructor(private readonly schoolYearService: SchoolYearService) {}

  @Get(API_URL.SCHOOL_YEAR.GET_ALL)
  async getAllSchoolYears() {
    return this.schoolYearService.getSchoolYears();
  }

  @Post(API_URL.SCHOOL_YEAR.UPDATE_TERMS)
  async updateTrims(@Query('trimestre_id') trimestre_id: string, @Body() data: IUpdateTrimestre) {
    return this.schoolYearService.updateTrimestre(trimestre_id, data);
  }

  @Post(API_URL.SCHOOL_YEAR.CREATE_YEAR)
  async createSchoolYear(@Query('school_id') school_id: string, @Body() data: ICreateSchoolYear) {
    return this.schoolYearService.createSchoolYear({
      ...data,
      school_id,
    });
  }

  @Delete(API_URL.SCHOOL_YEAR.DELETE_YEAR)
  async deleteYear(
    @Query('school_id')
    school_id: string,
    @Query('year_id') year_id: string,
  ) {
    return this.schoolYearService.deleteSchoolYear(year_id, school_id);
  }
}
