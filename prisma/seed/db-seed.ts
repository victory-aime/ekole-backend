// ============================================================================
// EKOLE — Seed de démonstration
// Complexe Scolaire Les Flamboyants — Brazzaville
// ============================================================================
// Installation :
//   npm install -D tsx
//   npm install bcryptjs && npm install -D @types/bcryptjs
// Dans package.json :
//   "prisma": { "seed": "tsx prisma/seed.ts" }
// Exécution :
//   npx prisma db push
//   npx prisma db seed
// ============================================================================

import {
  CanalNotification,
  Cycle,
  Genre,
  JourSemaine,
  LienParente,
  ModePaiement,
  StatutContrat,
  StatutEleve,
  StatutNotification,
  StatutPaiement,
  StatutPersonnel,
  StatutPresence,
  StatutUtilisateur,
  Trimestre,
  TypeContrat,
  TypeEvaluation,
  TypeFrais,
} from '../generated/enums';
import { prisma } from './client';
import { randomUUID } from 'crypto';
import { getAuthInstance } from '../../src/lib/auth';

// ----------------------------------------------------------------------------
// CONSTANTES AJUSTABLES
// ----------------------------------------------------------------------------
const STUDENTS_PER_CLASS_MIN = 8;
const STUDENTS_PER_CLASS_MAX = 12;
const JOURS_PRESENCE = 10; // nb de jours d'école récents à générer
const MOT_DE_PASSE_DEMO = 'Password123!';

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------
const id = () => randomUUID();
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const pad = (n: number, size = 4) => n.toString().padStart(size, '0');
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// ----------------------------------------------------------------------------
// DONNÉES DE RÉFÉRENCE — NOMS CONGOLAIS
// ----------------------------------------------------------------------------
const PRENOMS_M = [
  'Divin',
  'Merveil',
  'Christ',
  'Prince',
  'Béni',
  'Exaucé',
  'Trésor',
  'Bienvenu',
  'Emmanuel',
  'Fortuné',
  'Rodrigue',
  'Ghislain',
  'Duval',
  'Brice',
  'Cédric',
  'Franck',
  'Hervé',
  'Landry',
  'Nathan',
  'Patrick',
  'Serge',
  'Ulrich',
  'Yannick',
  'Bertrand',
  'Christian',
  'Davy',
  'Joachim',
  'Mardochée',
  'Roger',
  'Vainqueur',
];
const PRENOMS_F = [
  'Grâce',
  'Divine',
  'Merveille',
  'Bénie',
  'Exaucée',
  'Christelle',
  'Prisca',
  'Rosine',
  'Nathalie',
  'Vanessa',
  'Chancelvie',
  'Ornella',
  'Bella',
  'Kethia',
  'Judith',
  'Esther',
  'Rachel',
  'Deborah',
  'Priscille',
  'Sandra',
  'Carine',
  'Larissa',
  'Bénédicte',
  'Clarisse',
  'Sancia',
  'Rovanie',
  'Ketsia',
  'Loyce',
  'Anaelle',
  'Gracia',
];
const NOMS = [
  'Mabiala',
  'Nkounkou',
  'Mouyabi',
  'Ngouabi',
  'Massamba',
  'Bemba',
  'Loubaki',
  'Tchicaya',
  'Milandou',
  'Ondongo',
  'Kimbembe',
  'Bikindou',
  'Moutou',
  'Nzaba',
  'Samba',
  'Malonga',
  'Foutou',
  'Batchi',
  'Ganga',
  'Loko',
  'Mavoungou',
  'Ntsiba',
  'Poaty',
  'Yhombi',
  'Ibara',
  'Goma',
  'Elenga',
  'Mfoutou',
  'Diata',
  'Bantsimba',
];
const PROFESSIONS = [
  'Commerçant(e)',
  'Fonctionnaire',
  'Infirmier(ère)',
  'Chauffeur',
  'Couturier(ère)',
  'Ingénieur',
  'Médecin',
  'Menuisier',
  'Électricien',
  'Comptable',
  'Agent immobilier',
  'Agriculteur(trice)',
  'Enseignant(e)',
  'Sans emploi',
];
const QUARTIERS = [
  'Bacongo',
  'Poto-Poto',
  'Moungali',
  'Talangaï',
  'Ouenzé',
  'Makélékélé',
  'Mfilou',
  'Djiri',
];

let compteurEleve = 0;
let compteurPersonnel = 0;
let compteurRecu = 0;
const nextMatriculeEleve = () => `ELV-2026-${pad(++compteurEleve)}`;
const nextMatriculePersonnel = () => `PER-2026-${pad(++compteurPersonnel)}`;
const nextNumeroRecu = () => `REC-2026-${pad(++compteurRecu, 6)}`;

async function main() {
  console.log('Nettoyage de la base...');
  await prisma.notification.deleteMany();
  await prisma.presence.deleteMany();
  await prisma.bulletin.deleteMany();
  await prisma.note.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.echeance.deleteMany();
  await prisma.fraisScolaire.deleteMany();
  await prisma.emploiTemps.deleteMany();
  await prisma.enseignement.deleteMany();
  await prisma.matiereNiveau.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.bulletinSalaire.deleteMany();
  await prisma.contrat.deleteMany();
  await prisma.eleveParent.deleteMany();
  await prisma.eleve.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.niveau.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.anneeScolaire.deleteMany();
  await prisma.etablissement.deleteMany();

  // --------------------------------------------------------------------------
  // ÉTABLISSEMENT & ANNÉE SCOLAIRE
  // --------------------------------------------------------------------------
  console.log("Création de l'établissement...");
  const etablissement = await prisma.etablissement.create({
    data: {
      nom: 'Complexe Scolaire Les Flamboyants',
      ville: 'Brazzaville',
      adresse: 'Avenue de la Paix, Quartier Bacongo',
      telephone: '+242 06 123 45 67',
      email: 'contact@lesflamboyants.cg',
      devise: 'FCFA',
    },
  });

  const anneeScolaire = await prisma.anneeScolaire.create({
    data: {
      libelle: '2025-2026',
      date_debut: new Date('2025-10-01'),
      date_fin: new Date('2026-07-31'),
      active: true,
      etablissement_id: etablissement.id,
    },
  });

  // --------------------------------------------------------------------------
  // RÔLES, PERMISSIONS, UTILISATEURS
  // --------------------------------------------------------------------------
  console.log('Création des rôles et utilisateurs...');
  const modules = [
    'eleves',
    'parents',
    'classes',
    'frais',
    'paiements',
    'personnel',
    'matieres',
    'notes',
    'bulletins',
    'presences',
    'utilisateurs',
    'parametres',
  ];
  const actions = ['lire', 'creer', 'modifier', 'supprimer'];

  const permissions = await Promise.all(
    modules.flatMap((module) =>
      actions.map((action) => prisma.permission.create({ data: { module, action } })),
    ),
  );

  const roleAdmin = await prisma.role.create({
    data: { nom: 'Administrateur', description: 'Accès complet à la plateforme' },
  });
  const roleDirecteur = await prisma.role.create({
    data: { nom: 'Directeur', description: 'Pilotage pédagogique et administratif' },
  });
  const roleComptable = await prisma.role.create({
    data: { nom: 'Comptable', description: 'Gestion des frais et paiements' },
  });
  const roleEnseignant = await prisma.role.create({
    data: { nom: 'Enseignant', description: 'Saisie des notes et présences' },
  });
  const roleSecretaire = await prisma.role.create({
    data: { nom: 'Secrétaire', description: 'Gestion des inscriptions' },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({ role_id: roleAdmin.id, permission_id: p.id })),
  });
  const permByModule = (mods: string[], acts = actions) =>
    permissions.filter((p) => mods.includes(p.module) && acts.includes(p.action));

  await prisma.rolePermission.createMany({
    data: permByModule(['eleves', 'classes', 'notes', 'bulletins', 'presences', 'personnel']).map(
      (p) => ({ role_id: roleDirecteur.id, permission_id: p.id }),
    ),
  });
  await prisma.rolePermission.createMany({
    data: permByModule(['frais', 'paiements', 'eleves']).map((p) => ({
      role_id: roleComptable.id,
      permission_id: p.id,
    })),
  });
  await prisma.rolePermission.createMany({
    data: permByModule(['notes', 'bulletins', 'presences']).map((p) => ({
      role_id: roleEnseignant.id,
      permission_id: p.id,
    })),
  });
  await prisma.rolePermission.createMany({
    data: permByModule(['eleves', 'parents', 'classes']).map((p) => ({
      role_id: roleSecretaire.id,
      permission_id: p.id,
    })),
  });

  async function createUser({
    name,
    username,
    email,
    displayUsername,
    password,
    roleId,
  }: {
    name: string;
    username: string;
    displayUsername: string;
    email: string;
    password: string;
    roleId: string;
  }) {
    const { user } = await getAuthInstance().api.signUpEmail({
      body: {
        name,
        username,
        email,
        password,
        displayUsername,
      },
    });

    return prisma.user.update({
      where: { id: user.id },
      data: {
        role_id: roleId,
        status: StatutUtilisateur.ACTIVE,
      },
    });
  }

  const utilisateurAdmin = await createUser({
    name: 'Nkounkou',
    username: 'nkounkou.patrick',
    displayUsername: 'Nkounkou Patrick',
    email: 'admin@lesflamboyants.cg',
    password: 'V1ct0r!!A@dm!!n',
    roleId: roleAdmin.id,
  });

  const utilisateurComptable = await createUser({
    name: 'Malonga',
    username: 'malonga.christelle',
    displayUsername: 'malonga.christelle',
    email: 'comptable@lesflamboyants.cg',
    password: 'Password123!',
    roleId: roleComptable.id,
  });

  await createUser({
    name: 'Mabiala',
    username: 'mabiala.serge',
    displayUsername: 'Mabiala Serge',
    email: 'directeur@lesflamboyants.cg',
    password: 'Password123!',
    roleId: roleDirecteur.id,
  });

  await createUser({
    name: 'Loubaki',
    username: 'loubaki.esther',
    displayUsername: 'Loubaki Esther',
    email: 'secretaire@lesflamboyants.cg',
    password: 'Password123!',
    roleId: roleSecretaire.id,
  });

  // --------------------------------------------------------------------------
  // NIVEAUX (NURSERY → Lycée)
  // --------------------------------------------------------------------------
  console.log('Création des niveaux...');
  const niveauxData = [
    { nom: 'Petite Section', cycle: Cycle.NURSERY, ordre: 1 },
    { nom: 'Moyenne Section', cycle: Cycle.NURSERY, ordre: 2 },
    { nom: 'Grande Section', cycle: Cycle.NURSERY, ordre: 3 },
    { nom: 'CP1', cycle: Cycle.PRIMARY, ordre: 4 },
    { nom: 'CP2', cycle: Cycle.PRIMARY, ordre: 5 },
    { nom: 'CE1', cycle: Cycle.PRIMARY, ordre: 6 },
    { nom: 'CE2', cycle: Cycle.PRIMARY, ordre: 7 },
    { nom: 'CM1', cycle: Cycle.PRIMARY, ordre: 8 },
    { nom: 'CM2', cycle: Cycle.PRIMARY, ordre: 9 },
    { nom: '6e', cycle: Cycle.MIDDLE, ordre: 10 },
    { nom: '5e', cycle: Cycle.MIDDLE, ordre: 11 },
    { nom: '4e', cycle: Cycle.MIDDLE, ordre: 12 },
    { nom: '3e', cycle: Cycle.MIDDLE, ordre: 13 },
    { nom: '2nde', cycle: Cycle.SECONDARY, ordre: 14 },
    { nom: '1ère A', cycle: Cycle.SECONDARY, ordre: 15 },
    { nom: '1ère C', cycle: Cycle.SECONDARY, ordre: 16 },
    { nom: '1ère D', cycle: Cycle.SECONDARY, ordre: 17 },
    { nom: 'Tle A', cycle: Cycle.SECONDARY, ordre: 18 },
    { nom: 'Tle C', cycle: Cycle.SECONDARY, ordre: 19 },
    { nom: 'Tle D', cycle: Cycle.SECONDARY, ordre: 20 },
  ];
  const niveaux: any[] = [];
  for (const n of niveauxData) niveaux.push(await prisma.niveau.create({ data: n }));

  // --------------------------------------------------------------------------
  // MATIÈRES
  // --------------------------------------------------------------------------
  console.log('Création des matières...');
  const matiereDefs: any[] = [
    { nom: 'Éveil', coefficient: 1, cycles: [Cycle.NURSERY] },
    { nom: 'Graphisme', coefficient: 1, cycles: [Cycle.NURSERY] },
    { nom: 'Chant & Motricité', coefficient: 1, cycles: [Cycle.NURSERY] },
    { nom: 'Français', coefficient: 4, cycles: [Cycle.PRIMARY, Cycle.MIDDLE, Cycle.SECONDARY] },
    {
      nom: 'Mathématiques',
      coefficient: 4,
      cycles: [Cycle.PRIMARY, Cycle.MIDDLE, Cycle.SECONDARY],
    },
    { nom: 'Anglais', coefficient: 2, cycles: [Cycle.PRIMARY, Cycle.MIDDLE, Cycle.SECONDARY] },
    {
      nom: 'Histoire-Géographie',
      coefficient: 2,
      cycles: [Cycle.PRIMARY, Cycle.MIDDLE, Cycle.SECONDARY],
    },
    {
      nom: 'Sciences de la Vie et de la Terre',
      coefficient: 2,
      cycles: [Cycle.MIDDLE, Cycle.SECONDARY],
    },
    { nom: 'Physique-Chimie', coefficient: 3, cycles: [Cycle.MIDDLE, Cycle.SECONDARY] },
    { nom: 'Éducation Civique et Morale', coefficient: 1, cycles: [Cycle.PRIMARY, Cycle.MIDDLE] },
    {
      nom: 'Éducation Physique et Sportive',
      coefficient: 1,
      cycles: [Cycle.PRIMARY, Cycle.MIDDLE, Cycle.SECONDARY],
    },
    { nom: 'Philosophie', coefficient: 3, cycles: [Cycle.SECONDARY] },
  ];
  const matieres: Record<string, { id: string; coefficient: number }> = {};
  for (const m of matiereDefs) {
    const created = await prisma.matiere.create({
      data: { nom: m.nom, coefficient: m.coefficient },
    });
    matieres[m.nom] = created;
    for (const niveau of niveaux.filter((n) => m.cycles.includes(n.cycle))) {
      await prisma.matiereNiveau.create({ data: { matiere_id: created.id, niveau_id: niveau.id } });
    }
  }

  // --------------------------------------------------------------------------
  // PERSONNEL & CONTRATS
  // --------------------------------------------------------------------------
  console.log('Création du personnel...');
  const postesAdmin = [
    'Directeur',
    'Censeur',
    'Comptable',
    'Économe',
    'Surveillant Général',
    'Secrétaire',
  ];
  const personnel: any[] = [];

  for (const poste of postesAdmin) {
    const genre = randItem([Genre.M, Genre.F]);
    const p = await prisma.personnel.create({
      data: {
        matricule: nextMatriculePersonnel(),
        nom: randItem(NOMS),
        prenom: genre === Genre.M ? randItem(PRENOMS_M) : randItem(PRENOMS_F),
        telephone: `+242 0${randInt(5, 6)} ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`,
        email: null,
        poste,
        dateEmbauche: new Date(2018 + randInt(0, 6), randInt(0, 11), randInt(1, 28)),
        statut: StatutPersonnel.ACTIVE,
      },
    });
    await prisma.contrat.create({
      data: {
        type: TypeContrat.CDI,
        salaire: randInt(250, 450) * 1000,
        date_debut: p.dateEmbauche,
        statut: StatutContrat.ACTIVE,
        personnel_id: p.id,
      },
    });
    personnel.push(p);
  }

  const enseignants: any[] = [];
  for (let i = 0; i < 18; i++) {
    const genre = randItem([Genre.M, Genre.F]);
    const p = await prisma.personnel.create({
      data: {
        matricule: nextMatriculePersonnel(),
        nom: randItem(NOMS),
        prenom: genre === Genre.M ? randItem(PRENOMS_M) : randItem(PRENOMS_F),
        telephone: `+242 0${randInt(5, 6)} ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`,
        poste: 'Enseignant',
        dateEmbauche: new Date(2016 + randInt(0, 8), randInt(0, 11), randInt(1, 28)),
        statut: StatutPersonnel.ACTIVE,
      },
    });
    const type = randItem([
      TypeContrat.CDI,
      TypeContrat.CDI,
      TypeContrat.CDD,
      TypeContrat.VACATAIRE,
    ]);
    await prisma.contrat.create({
      data: {
        type,
        salaire: randInt(150, 350) * 1000,
        date_debut: p.dateEmbauche,
        statut: StatutContrat.ACTIVE,
        personnel_id: p.id,
      },
    });
    enseignants.push(p);
  }

  // Bulletins de salaire du mois en cours pour tout le personnel
  const tousPersonnel = [...personnel, ...enseignants];
  await prisma.bulletinSalaire.createMany({
    data: await Promise.all(
      tousPersonnel.map(async (p) => {
        const contrat = await prisma.contrat.findFirst({ where: { personnel_id: p.id } });
        const base = contrat?.salaire! ?? 0;
        const primes = randInt(0, 2) === 0 ? 0 : randInt(10, 30) * 1000;
        const retenues = Math.round(base.toNumber() * 0.05);
        return {
          id: id(),
          mois: 6,
          annee: 2026,
          salaire: base,
          primes,
          retenues,
          net_payer: base.toNumber() + primes - retenues,
          statut: randItem([StatutPaiement.PAID, StatutPaiement.PAID, StatutPaiement.UNPAID]),
          date_paiement: randInt(0, 1) ? new Date('2026-06-28') : null,
          personnel_id: p.id,
        };
      }),
    ),
  });

  // --------------------------------------------------------------------------
  // CLASSES (1 par niveau, année active) + professeur principal
  // --------------------------------------------------------------------------
  console.log('Création des classes...');
  const classes: any[] = [];
  for (const niveau of niveaux) {
    const profPrincipal =
      niveau.cycle === Cycle.NURSERY ? randItem(enseignants) : randItem(enseignants);
    const c = await prisma.classe.create({
      data: {
        nom: `${niveau.nom} A`,
        effectif_max: niveau.cycle === Cycle.NURSERY ? 20 : 45,
        niveau_id: niveau.id,
        annee_scolaire_id: anneeScolaire.id,
        professeur_principal_id: profPrincipal.id,
      },
    });
    classes.push({ ...c, cycle: niveau.cycle });
  }

  // --------------------------------------------------------------------------
  // ENSEIGNEMENTS (affectation matière ↔ classe ↔ enseignant)
  // --------------------------------------------------------------------------
  console.log('Affectation des enseignants aux matières...');
  const enseignementsParClasse: Record<
    string,
    { matiere_id: string; matiereNom: string; coefficient: number; personnel_id: string }[]
  > = {};
  for (const classe of classes) {
    if (classe.cycle === Cycle.NURSERY) continue;
    const matieresDeLaClasse = matiereDefs.filter((m) => m.cycles.includes(classe.cycle));
    enseignementsParClasse[classe.id] = [];
    for (const m of matieresDeLaClasse) {
      const enseignant = randItem(enseignants);
      await prisma.enseignement.create({
        data: { personnel_id: enseignant.id, matiere_id: matieres[m.nom].id, classe_id: classe.id },
      });
      enseignementsParClasse[classe.id].push({
        matiere_id: matieres[m.nom].id,
        matiereNom: m.nom,
        coefficient: m.coefficient,
        personnel_id: enseignant.id,
      });
    }
  }

  // --------------------------------------------------------------------------
  // EMPLOI DU TEMPS (échantillon : 4 créneaux/semaine par classe non-NURSERY)
  // --------------------------------------------------------------------------
  console.log('Génération des emplois du temps...');
  const jours = [
    JourSemaine.LUNDI,
    JourSemaine.MARDI,
    JourSemaine.MERCREDI,
    JourSemaine.JEUDI,
    JourSemaine.VENDREDI,
  ];
  const creneaux = [
    ['07:30', '08:30'],
    ['08:30', '09:30'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
  ];
  for (const classe of classes) {
    const enseignementsClasse = enseignementsParClasse[classe.id];
    if (!enseignementsClasse || enseignementsClasse.length === 0) continue;
    for (let i = 0; i < 4; i++) {
      const ens = enseignementsClasse[i % enseignementsClasse.length];
      const [heureDebut, heureFin] = creneaux[i];
      await prisma.emploiTemps.create({
        data: {
          jour: jours[i % jours.length],
          heure_debut: heureDebut,
          heure_fin: heureFin,
          salle: `Salle ${randInt(1, 20)}`,
          classe_id: classe.id,
          matiere_id: ens.matiere_id,
          personnel_id: ens.personnel_id,
        },
      });
    }
  }

  // --------------------------------------------------------------------------
  // GRILLE TARIFAIRE (frais + échéances par cycle)
  // --------------------------------------------------------------------------
  console.log('Création de la grille tarifaire...');
  const grilleTarifaire: Record<Cycle, { inscription: number; scolarite: number }> = {
    [Cycle.NURSERY]: { inscription: 30000, scolarite: 300000 },
    [Cycle.PRIMARY]: { inscription: 35000, scolarite: 360000 },
    [Cycle.MIDDLE]: { inscription: 40000, scolarite: 420000 },
    [Cycle.SECONDARY]: { inscription: 50000, scolarite: 480000 },
  };
  const echeancesParCycle: Record<string, { inscription: string; tranches: string[] }> = {};
  for (const cycle of Object.keys(grilleTarifaire) as Cycle[]) {
    const tarif = grilleTarifaire[cycle];

    const fraisInscription = await prisma.fraisScolaire.create({
      data: {
        libelle: `Frais d'inscription - ${cycle}`,
        type: TypeFrais.REGISTRATION,
        cycle,
        montant: tarif.inscription,
        annee_scolaire_id: anneeScolaire.id,
      },
    });
    const echeanceInscription = await prisma.echeance.create({
      data: {
        libelle: 'Inscription',
        montant: tarif.inscription,
        date_echeance: new Date('2025-10-05'),
        frais_id: fraisInscription.id,
      },
    });

    const fraisScolarite = await prisma.fraisScolaire.create({
      data: {
        libelle: `Scolarité annuelle - ${cycle}`,
        type: TypeFrais.SCHOOL_FEES,
        cycle,
        montant: tarif.scolarite,
        annee_scolaire_id: anneeScolaire.id,
      },
    });
    const t1 = await prisma.echeance.create({
      data: {
        libelle: '1ère tranche',
        montant: Math.round(tarif.scolarite / 3),
        date_echeance: new Date('2025-11-15'),
        frais_id: fraisScolarite.id,
      },
    });
    const t2 = await prisma.echeance.create({
      data: {
        libelle: '2e tranche',
        montant: Math.round(tarif.scolarite / 3),
        date_echeance: new Date('2026-02-15'),
        frais_id: fraisScolarite.id,
      },
    });
    const t3 = await prisma.echeance.create({
      data: {
        libelle: '3e tranche',
        montant: Math.round(tarif.scolarite / 3),
        date_echeance: new Date('2026-05-15'),
        frais_id: fraisScolarite.id,
      },
    });

    echeancesParCycle[cycle] = {
      inscription: echeanceInscription.id,
      tranches: [t1.id, t2.id, t3.id],
    };
  }

  // --------------------------------------------------------------------------
  // ÉLÈVES + PARENTS + PAIEMENTS + NOTES + PRÉSENCES
  // --------------------------------------------------------------------------
  console.log('Création des élèves, parents, paiements, notes et présences...');

  for (const classe of classes) {
    const nbEleves = randInt(STUDENTS_PER_CLASS_MIN, STUDENTS_PER_CLASS_MAX);
    const elevesClasse: { id: string; nom: string; prenom: string }[] = [];

    for (let i = 0; i < nbEleves; i++) {
      const genre = randItem([Genre.M, Genre.F]);
      const nomEleve = randItem(NOMS);
      const prenomEleve = genre === Genre.M ? randItem(PRENOMS_M) : randItem(PRENOMS_F);
      const ageApprox = 3 + niveaux.findIndex((n) => n.id === classe.niveauId);

      const eleve = await prisma.eleve.create({
        data: {
          matricule: nextMatriculeEleve(),
          nom: nomEleve,
          prenom: prenomEleve,
          date_naissance: new Date(2026 - ageApprox, randInt(0, 11), randInt(1, 28)),
          lieu_naissance: 'Brazzaville',
          genre,
          statut: StatutEleve.ACTIVE,
          date_inscription: new Date('2025-09-' + randInt(1, 28)),
          classe_id: classe.id,
        },
      });
      elevesClasse.push(eleve);

      // Parent(s)
      const lienPrincipal = randItem([LienParente.FATHER, LienParente.MOTHER]);
      const parent1 = await prisma.parent.create({
        data: {
          nom: nomEleve,
          prenom: lienPrincipal === LienParente.FATHER ? randItem(PRENOMS_M) : randItem(PRENOMS_F),
          telephone: `+242 0${randInt(5, 6)} ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`,
          email: Math.random() > 0.5 ? `${prenomEleve.toLowerCase()}.parent@gmail.com` : null,
          profession: randItem(PROFESSIONS),
          adresse: `Quartier ${randItem(QUARTIERS)}, Brazzaville`,
        },
      });
      await prisma.eleveParent.create({
        data: {
          eleve_id: eleve.id,
          parent_id: parent1.id,
          lien_parente: lienPrincipal,
          contact_principal: true,
        },
      });

      if (Math.random() > 0.3) {
        const lienSECONDARY =
          lienPrincipal === LienParente.FATHER ? LienParente.MOTHER : LienParente.FATHER;
        const parent2 = await prisma.parent.create({
          data: {
            nom: nomEleve,
            prenom:
              lienSECONDARY === LienParente.FATHER ? randItem(PRENOMS_M) : randItem(PRENOMS_F),
            telephone: `+242 0${randInt(5, 6)} ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`,
            profession: randItem(PROFESSIONS),
          },
        });
        await prisma.eleveParent.create({
          data: {
            eleve_id: eleve.id,
            parent_id: parent2.id,
            lien_parente: lienSECONDARY,
            contact_principal: false,
          },
        });
      }

      // Paiements (inscription toujours, tranches progressivement)
      const echeances = echeancesParCycle[classe.cycle];
      await prisma.paiement.create({
        data: {
          numero: nextNumeroRecu(),
          montant: grilleTarifaire[classe.cycle].inscription,
          mode: randItem([ModePaiement.CASH, ModePaiement.MOBILE_MONEY]),
          date_paiement: new Date('2025-10-' + randInt(1, 25)),
          statut: StatutPaiement.PAID,
          eleve_id: eleve.id,
          echeance_id: echeances.inscription,
          caissier_id: utilisateurComptable.id,
        },
      });
      const probaTranche = [0.9, 0.6, 0.25]; // proba de paiement par tranche
      const moisTranche = [
        ['11', '12'],
        ['02', '03'],
        ['05', '06'],
      ];
      for (let t = 0; t < 3; t++) {
        if (Math.random() < probaTranche[t]) {
          const mois = randItem(moisTranche[t]);
          const annee = Number(mois) >= 10 ? 2025 : 2026;
          await prisma.paiement.create({
            data: {
              numero: nextNumeroRecu(),
              montant: Math.round(grilleTarifaire[classe.cycle].scolarite / 3),
              mode: randItem([
                ModePaiement.CASH,
                ModePaiement.MOBILE_MONEY,
                ModePaiement.BANK_TRANSFER,
              ]),
              reference: Math.random() > 0.5 ? `MM${randInt(100000, 999999)}` : null,
              date_paiement: new Date(annee, Number(mois) - 1, randInt(1, 27)),
              statut: StatutPaiement.PAID,
              eleve_id: eleve.id,
              echeance_id: echeances.tranches[t],
              caissier_id: utilisateurComptable.id,
            },
          });
        }
      }

      // Notes + présences (hors NURSERY)
      if (classe.cycle !== Cycle.NURSERY) {
        const enseignementsClasse = enseignementsParClasse[classe.id] || [];
        for (const ens of enseignementsClasse) {
          await prisma.note.create({
            data: {
              type: randItem([
                TypeEvaluation.HOMEWORK,
                TypeEvaluation.TEST,
                TypeEvaluation.COMPOSITION,
              ]),
              valeur: Math.round((randInt(60, 195) / 10) * 10) / 10, // 6.0 à 19.5
              noteSur: 20,
              trimestre: Trimestre.T1,
              date: new Date('2025-12-' + randInt(1, 15)),
              appreciation: randItem([
                'Bon travail',
                'Peut mieux faire',
                'Excellent',
                'Assez bien',
                'Effort à fournir',
                null,
              ]),
              eleve_id: eleve.id,
              matiere_id: ens.matiere_id,
              enseignant_id: ens.personnel_id,
              annee_scolaire_id: anneeScolaire.id,
            },
          });
        }

        for (let j = 0; j < JOURS_PRESENCE; j++) {
          const date = addDays(new Date(), -j);
          if (date.getDay() === 0 || date.getDay() === 6) continue; // pas le week-end
          const statut =
            Math.random() > 0.9
              ? Math.random() > 0.5
                ? StatutPresence.ABSENT
                : StatutPresence.LATE
              : StatutPresence.PRESENT;
          await prisma.presence.create({
            data: {
              date,
              statut,
              justificatif:
                statut === StatutPresence.ABSENT && Math.random() > 0.5
                  ? 'Certificat médical'
                  : null,
              eleve_id: eleve.id,
              classe_id: classe.id,
              user_id: utilisateurAdmin.id,
            },
          });
        }
      }
    }

    // Bulletins T1 (calcul de la moyenne pondérée à partir des notes créées)
    if (classe.cycle !== Cycle.NURSERY) {
      const enseignementsClasse = enseignementsParClasse[classe.id] || [];
      const moyennes: { eleve_id: string; moyenne: number }[] = [];
      for (const eleve of elevesClasse) {
        const notesEleve = await prisma.note.findMany({
          where: { eleve_id: eleve.id, trimestre: Trimestre.T1 },
        });
        let totalPondere = 0;
        let totalCoef = 0;
        for (const n of notesEleve) {
          const coef =
            enseignementsClasse.find((e) => e.matiere_id === n.matiere_id)?.coefficient ?? 1;
          totalPondere += n.valeur * coef;
          totalCoef += coef;
        }
        moyennes.push({
          eleve_id: eleve.id,
          moyenne: totalCoef > 0 ? Math.round((totalPondere / totalCoef) * 100) / 100 : 0,
        });
      }
      moyennes.sort((a, b) => b.moyenne - a.moyenne);
      for (let r = 0; r < moyennes.length; r++) {
        const { eleve_id, moyenne } = moyennes[r];
        const appreciation =
          moyenne >= 16
            ? 'Excellent trimestre, continuez ainsi.'
            : moyenne >= 14
              ? 'Très bon travail.'
              : moyenne >= 12
                ? 'Bon trimestre.'
                : moyenne >= 10
                  ? 'Trimestre moyen, peut mieux faire.'
                  : 'Trimestre difficile, des efforts sont nécessaires.';
        await prisma.bulletin.create({
          data: {
            trimestre: Trimestre.T1,
            moyenne_generale: moyenne,
            rang: r + 1,
            appreciation_generale: appreciation,
            date_generation: new Date('2025-12-20'),
            eleve_id,
            classe_id: classe.id,
            annee_scolaire_id: anneeScolaire.id,
          },
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS (échantillon)
  // --------------------------------------------------------------------------
  console.log('Création des notifications...');
  const quelquesEleves = await prisma.eleve.findMany({
    take: 15,
    include: { parents: { include: { parent: true } } },
  });
  for (const eleve of quelquesEleves) {
    const parentPrincipal = eleve.parents.find((ep) => ep.contact_principal)?.parent;
    if (!parentPrincipal) continue;
    const canal = randItem([CanalNotification.EMAIL]);
    const type = randItem(['rappel_paiement', 'bulletin_disponible', 'reunion_parents']);
    const messages: Record<string, string> = {
      rappel_paiement: `Cher(e) parent, la tranche de scolarité de ${eleve.prenom} ${eleve.nom} reste à régler. Merci de vous rapprocher de la comptabilité.`,
      bulletin_disponible: `Le bulletin du 1er trimestre de ${eleve.prenom} ${eleve.nom} est disponible. Vous pouvez le consulter ou le retirer à l'accueil.`,
      reunion_parents: `Une réunion des parents d'élèves se tiendra samedi à 9h. Votre présence est vivement souhaitée.`,
    };
    await prisma.notification.create({
      data: {
        canal,
        sujet:
          type === 'rappel_paiement'
            ? 'Rappel de paiement'
            : type === 'bulletin_disponible'
              ? 'Bulletin disponible'
              : 'Réunion des parents',
        message: messages[type],
        statut: randItem([
          StatutNotification.SEND,
          StatutNotification.SEND,
          StatutNotification.PENDING,
        ]),
        dateEnvoi: new Date(),
        eleve_id: eleve.id,
        parent_id: parentPrincipal.id,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RÉSUMÉ
  // --------------------------------------------------------------------------
  const [nbEleves, nbPersonnel, nbClasses, nbPaiements, nbNotes, nbPresences] = await Promise.all([
    prisma.eleve.count(),
    prisma.personnel.count(),
    prisma.classe.count(),
    prisma.paiement.count(),
    prisma.note.count(),
    prisma.presence.count(),
  ]);

  console.log('\nSeed terminé avec succès !');
  console.log('----------------------------------------');
  console.log(`Élèves        : ${nbEleves}`);
  console.log(`Personnel     : ${nbPersonnel}`);
  console.log(`Classes       : ${nbClasses}`);
  console.log(`Paiements     : ${nbPaiements}`);
  console.log(`Notes         : ${nbNotes}`);
  console.log(`Présences     : ${nbPresences}`);
  console.log('----------------------------------------');
  console.log(`Connexion admin : admin@lesflamboyants.cg / ${MOT_DE_PASSE_DEMO}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
