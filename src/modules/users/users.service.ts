import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(where: { id?: string; email?: string }) {
    if (!where.id && !where.email) return null;

    const uniqueWhere = where.id ? { id: where.id } : { email: where.email };

    const user = await this.prisma.user.findUnique({
      where: uniqueWhere,
      include: {
        role: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      display_username: user.displayUsername,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async userInfo(id: string) {
    try {
      const user = await this.findUser({ id });
      if (!user) {
        throw new NotFoundException('No user');
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
