import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';
import { SchoolYearService } from './school-year.service';

@Injectable()
export class SchoolYearCronService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: SchoolYearService,
  ) {}

  /**
   * Synchronisation quotidienne
   *
   * verrouille les trimestres terminés
   * active le trimestre en cours
   * met à jour l'année active
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verifySchoolTerms() {
    const now = new Date();

    /**
     * 1 - Verrouillage des trimestres terminés
     */
    await this.prisma.trimestre.updateMany({
      where: {
        date_fin: {
          lt: now,
        },
        verrouille: false,
      },

      data: {
        actif: false,
        verrouille: true,
      },
    });

    /**
     * 2 - Désactivation des anciens trimestres
     * puis activation du trimestre courant
     */
    const trimestresEnCours = await this.prisma.trimestre.findMany({
      where: {
        date_debut: {
          lte: now,
        },

        date_fin: {
          gte: now,
        },

        verrouille: false,
      },
    });

    for (const trimestre of trimestresEnCours) {
      /**
       * Sécurité :
       * un seul trimestre actif par année
       */
      await this.prisma.trimestre.updateMany({
        where: {
          annee_scolaire_id: trimestre.annee_scolaire_id,

          id: {
            not: trimestre.id,
          },

          actif: true,
        },

        data: {
          actif: false,
        },
      });

      await this.prisma.trimestre.update({
        where: {
          id: trimestre.id,
        },

        data: {
          actif: true,
        },
      });
    }

    /**
     * 3 - Mise à jour année scolaire active
     */
    const etablissements = await this.prisma.etablissement.findMany({
      select: {
        id: true,
      },
    });

    for (const etablissement of etablissements) {
      await this.service.refreshSchoolYearStatus(etablissement.id);
    }
  }
}
