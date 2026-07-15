import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { API_URL } from '../../config/api';

@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(API_URL.USER.INFO)
  async getUserInfo(@Query('userId') userId: string) {
    return this.userService.userInfo(userId);
  }
}
