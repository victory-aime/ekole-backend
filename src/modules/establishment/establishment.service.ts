import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EstablishmentService {
  constructor(private readonly prisma: PrismaService) {}
  async getEstablishment() {
    return this.prisma.etablissement.findMany();
  }
}
