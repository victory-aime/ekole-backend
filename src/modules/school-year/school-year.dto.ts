interface ITrimestreGenerate {
  numero: number;
  nom: string;
  date_debut: Date;
  date_fin: Date;
}

interface IUpdateTrimestre {
  nom?: string;
  date_debut?: Date;
  date_fin?: Date;
}

interface ICreateSchoolYear {
  school_id: string;
  libelle: string;
  date_debut: Date;
  date_fin: Date;
}

export type { ITrimestreGenerate, IUpdateTrimestre, ICreateSchoolYear };
