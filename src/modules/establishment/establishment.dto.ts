export interface ICreateEstablishment {
  adresse: string;
  email: string;
  nom: string;
  telephone: string;
  ville: string;
  sigle: string;
  annees_scolaires: {
    libelle: string;
    date_debut: Date;
    date_fin: Date;
    active: boolean;
  };
}
