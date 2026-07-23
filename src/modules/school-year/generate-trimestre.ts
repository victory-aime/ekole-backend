export function generateTerms(start: Date, end: Date) {
  const duration = end.getTime() - start.getTime();
  const third = Math.floor(duration / 3);

  const t1Start = start;
  const t1End = new Date(start.getTime() + third);

  const t2Start = new Date(t1End);
  t2Start.setDate(t2Start.getDate() + 1);

  const t2End = new Date(t2Start.getTime() + third);

  const t3Start = new Date(t2End);
  t3Start.setDate(t3Start.getDate() + 1);

  return [
    {
      numero: 1,
      nom: 'Premier trimestre',
      date_debut: t1Start,
      date_fin: t1End,
      actif: true,
    },
    {
      numero: 2,
      nom: 'Deuxième trimestre',
      date_debut: t2Start,
      date_fin: t2End,
      actif: false,
    },
    {
      numero: 3,
      nom: 'Troisième trimestre',
      date_debut: t3Start,
      date_fin: end,
      actif: false,
    },
  ];
}
