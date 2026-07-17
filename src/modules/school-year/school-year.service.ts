import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpError } from 'src/config/http.error';
import { PrismaService } from 'src/database/prisma.service';
import { ICreateSchoolYear, ITrimestreGenerate, IUpdateTrimestre } from './school-year.dto';

@Injectable()
export class SchoolYearService {
  constructor(private readonly prisma: PrismaService) {}

  async getSchoolYears() {
    return this.prisma.anneeScolaire.findMany({
      include: {
        trimestres: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async createSchoolYear(data: ICreateSchoolYear) {
    const { libelle, school_id, date_fin, date_debut } = data;

    const etablissement = await this.prisma.etablissement.findUnique({
      where: {
        id: school_id,
      },
    });

    if (!etablissement) {
      throw new HttpError('Etablissement introuvable', HttpStatus.NOT_FOUND);
    }

    const exist = await this.prisma.anneeScolaire.findUnique({
      where: {
        etablissement_id_libelle: {
          etablissement_id: school_id,
          libelle: data.libelle,
        },
      },
    });

    if (exist) {
      throw new HttpError(
        `Cette année scolaire existe déjà pour l'etablissement ${etablissement.nom}`,
        HttpStatus.CONFLICT,
      );
    }

    const trimestres = await this.generateTrimestres(
      new Date(data.date_debut),
      new Date(data.date_fin),
    );

    /**
     * Une école ne peut avoir qu'une seule année active
     * Si aucune année active existe
     * On active automatiquement celle-ci
     */

    const active = !(await this.prisma.anneeScolaire.findFirst({
      where: {
        etablissement_id: school_id,
        active: true,
      },
    }));

    return this.prisma.anneeScolaire.create({
      data: {
        libelle,
        date_debut,
        date_fin,
        active,
        etablissement: {
          connect: {
            id: school_id,
          },
        },
        trimestres: {
          createMany: {
            data: trimestres,
          },
        },
      },
      include: {
        trimestres: true,
      },
    });
  }

  async updateTrimestre(
    trimestre_id: string,
    data: IUpdateTrimestre,
  ): Promise<{ message: string }> {
    const trimestre = await this.prisma.trimestre.findUnique({
      where: { id: trimestre_id },
      include: {
        annee_scolaire: {
          include: { trimestres: { orderBy: { numero: 'asc' } } },
        },
      },
    });

    if (!trimestre) {
      throw new HttpError('Trimestre introuvable', HttpStatus.NOT_FOUND);
    }

    // ── Règle 1 : un trimestre verrouillé n'est jamais modifiable ──
    if (trimestre.verrouille) {
      throw new HttpError(
        'Ce trimestre est verrouillé et ne peut pas être modifié',
        HttpStatus.FORBIDDEN,
      );
    }

    // ── Règle 2 : impossible de modifier un trimestre déjà commencé ──
    const maintenant = new Date();
    if (trimestre.date_debut <= maintenant) {
      throw new HttpError(
        'Ce trimestre a déjà commencé, ses dates ne peuvent plus être modifiées',
        HttpStatus.FORBIDDEN,
      );
    }

    const nouvelle_date_debut = data.date_debut ?? trimestre.date_debut;
    const nouvelle_date_fin = data.date_fin ?? trimestre.date_fin;

    // ── Règle 3 : la nouvelle date de début ne peut pas être dans le passé ──
    // (sinon on rendrait le trimestre "déjà commencé" rétroactivement, ce qui viole la règle 2)
    if (nouvelle_date_debut <= maintenant) {
      throw new HttpError(
        'La nouvelle date de début doit être dans le futur',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ── Règle 4 : cohérence interne des dates ──
    if (nouvelle_date_fin <= nouvelle_date_debut) {
      throw new HttpError(
        'La date de fin doit être postérieure à la date de début',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ── Règle 5 : le trimestre doit rester dans les bornes de l'année scolaire ──
    const { annee_scolaire } = trimestre;
    if (
      nouvelle_date_debut < annee_scolaire.date_debut ||
      nouvelle_date_fin > annee_scolaire.date_fin
    ) {
      throw new HttpError(
        "Les dates du trimestre doivent rester dans les bornes de l'année scolaire",
        HttpStatus.BAD_REQUEST,
      );
    }

    // ── Règle 6 : pas de chevauchement avec le trimestre précédent ──
    const trimestrePrecedent = annee_scolaire.trimestres.find(
      (t) => t.numero === trimestre.numero - 1,
    );
    if (trimestrePrecedent && nouvelle_date_debut <= trimestrePrecedent.date_fin) {
      throw new HttpError(
        `La date de début doit être postérieure à la fin du trimestre ${trimestrePrecedent.numero}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // ── Règle 7 : pas de chevauchement avec le trimestre suivant ──
    const trimestreSuivant = annee_scolaire.trimestres.find(
      (t) => t.numero === trimestre.numero + 1,
    );
    if (
      trimestreSuivant &&
      nouvelle_date_debut <= trimestreSuivant.date_fin &&
      nouvelle_date_fin >= trimestreSuivant.date_debut
    ) {
      throw new HttpError(
        `La date de fin doit être antérieure au début du trimestre ${trimestreSuivant.numero}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.trimestre.update({
      where: { id: trimestre_id },
      data: {
        nom: data.nom ?? trimestre.nom,
        date_debut: nouvelle_date_debut,
        date_fin: nouvelle_date_fin,
      },
    });

    return {
      message: 'Trimestre mis à jour',
    };
  }

  async generateTrimestres(date_debut: Date, date_fin: Date): Promise<ITrimestreGenerate[]> {
    if (date_fin <= date_debut) {
      throw new HttpError(
        'La date de fin doit être postérieure à la date de début',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dureeTotaleMs = date_fin.getTime() - date_debut.getTime();
    const dureeParTrimestreMs = Math.floor(dureeTotaleMs / 3);

    const bornes: Date[] = [
      date_debut,
      new Date(date_debut.getTime() + dureeParTrimestreMs),
      new Date(date_debut.getTime() + dureeParTrimestreMs * 2),
      date_fin,
    ];

    return [1, 2, 3].map((numero) => ({
      numero,
      nom: `Trimestre ${numero}`,
      date_debut: bornes[numero - 1],
      date_fin: numero === 3 ? bornes[3] : new Date(bornes[numero].getTime() - 1),
    }));
  }

  /**
   * Vérifie quelle année doit être active
   */
  async refreshSchoolYearStatus(id: string) {
    const now = new Date();

    const years = await this.prisma.anneeScolaire.findMany({
      where: {
        etablissement_id: id,
      },
      include: {
        trimestres: true,
      },
    });

    for (const year of years) {
      const trimestreEnCours = year.trimestres.find(
        (t) => t.date_debut <= now && t.date_fin >= now,
      );

      /**
       * Une année est active uniquement
       * si un trimestre est en cours
       */

      const shouldBeEnabled = !!trimestreEnCours;

      if (year.active !== shouldBeEnabled) {
        await this.prisma.anneeScolaire.update({
          where: {
            id: year.id,
          },
          data: {
            active: shouldBeEnabled,
          },
        });
      }
    }
  }

  async deleteSchoolYear(
    annee_scolaire_id: string,
    etablissement_id: string,
  ): Promise<{ message: string }> {
    const annee = await this.prisma.anneeScolaire.findFirst({
      where: {
        id: annee_scolaire_id,
        etablissement_id,
      },
      include: {
        trimestres: true,
      },
    });

    if (!annee) {
      throw new HttpError(
        'Année scolaire introuvable pour cet établissement',
        HttpStatus.NOT_FOUND,
      );
    }

    const maintenant = new Date();

    /**
     * Vérification des trimestres
     */

    const trimestreActif = annee.trimestres.some(
      (trimestre) => trimestre.actif && !trimestre.verrouille,
    );

    if (trimestreActif) {
      throw new HttpError(
        'Impossible de supprimer une année scolaire avec un trimestre actif',
        HttpStatus.FORBIDDEN,
      );
    }

    /**
     * Vérifie si tous les trimestres sont terminés
     */

    const tousLesTrimestresTermines = annee.trimestres.every(
      (trimestre) => trimestre.date_fin < maintenant,
    );

    /**
     * Aucun trimestre actif mais certains
     * trimestres futurs existent
     * Exemple :
     * Création anticipée 2027-2028
     * T1 Octobre 2027
     * Suppression autorisée
     */

    const aucunTrimestreActif = !annee.trimestres.some((t) => t.actif);

    if (!tousLesTrimestresTermines && !aucunTrimestreActif) {
      throw new HttpError(
        'Cette année scolaire ne peut pas être supprimée actuellement',
        HttpStatus.FORBIDDEN,
      );
    }

    /**
     * Suppression transactionnelle
     *
     * Les trimestres sont supprimés
     * automatiquement grâce au onDelete Cascade
     */
    await this.prisma.$transaction([
      this.prisma.anneeScolaire.delete({
        where: {
          id: annee_scolaire_id,
        },
      }),
    ]);

    return {
      message: 'Année scolaire supprimée avec succès',
    };
  }
}
