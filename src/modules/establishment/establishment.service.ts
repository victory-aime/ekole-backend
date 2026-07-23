import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ICreateEstablishment } from './establishment.dto';
import { HttpError } from 'src/config/http.error';
import { SchoolYearService } from '../school-year/school-year.service';

@Injectable()
export class EstablishmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schoolYearService: SchoolYearService,
  ) {}

  async getEstablishment() {
    const establishments = await this.prisma.etablissement.findMany({
      include: {
        annees_scolaires: {
          include: {
            classes: {
              include: {
                _count: {
                  select: {
                    eleves: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
    return establishments.map((item) => {
      const activeYear = item.annees_scolaires[0];
      return {
        adresse: item.adresse,
        sigle: item.sigle,
        created_at: item.created_at,
        email: item.email,
        id: item.id,
        logo_url: item.logo_url,
        nom: item.nom,
        telephone: item.telephone,
        updated_at: item.updated_at,
        ville: item.ville,
        annee_scolaire: {
          libelle: activeYear?.libelle,
          total_eleves:
            activeYear?.classes.reduce((sum, classroom) => sum + classroom._count.eleves, 0) ?? 0,
        },
      };
    });
  }

  async createEstablishment(data: ICreateEstablishment): Promise<{ message: string }> {
    const { adresse, annees_scolaires, email, nom, sigle, telephone, ville } = data;
    const find = await this.prisma.etablissement.findUnique({
      where: { nom_sigle: { nom, sigle } },
    });
    if (find) {
      throw new HttpError('Cet etablissement exist deja', HttpStatus.CONFLICT);
    }
    const trimestres = await this.schoolYearService.generateTrimestres(
      new Date(data.annees_scolaires.date_debut),
      new Date(data.annees_scolaires.date_fin),
    );

    await this.prisma.etablissement.create({
      data: {
        adresse,
        email,
        telephone,
        ville,
        nom,
        sigle,
        annees_scolaires: {
          create: {
            ...annees_scolaires,
            active: new Date() === new Date(data.annees_scolaires.date_debut),
            trimestres: {
              createMany: { data: trimestres },
            },
          },
        },
      },
    });

    return {
      message: 'Etablissement engeristré',
    };
  }
}
