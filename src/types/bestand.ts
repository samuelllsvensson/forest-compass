export interface Bestand {
  id: string;
  namn: string;
  geometry: GeoJSON.Polygon;
  areal: number;
  tradslag: string[];
  virkesvolym_per_ha: number;
  virkesvolym_totalt: number;
  alder: number;
  bonitet: string;
  slutenhet: number;
  created_at: string;
  updated_at: string;
}

export interface Atgard {
  id: string;
  bestand_id: string;
  typ: string;
  planerat_datum: string | null;
  tidsram: string;
  status: 'planerad' | 'pågående' | 'slutförd';
  anteckningar: string;
  created_at: string;
  updated_at: string;
}

export const TRADSLAG_OPTIONS = [
  'Tall', 'Gran', 'Björk', 'Ek', 'Bok', 'Asp', 'Al', 'Lärk', 'Lönn', 'Övrigt'
];

export const ATGARD_TYPER = [
  'Avverkning', 'Gallring', 'Plantering', 'Röjning', 'Markberedning', 'Gödsling', 'Inventering', 'Övrigt'
];

export const ATGARD_STATUS = ['planerad', 'pågående', 'slutförd'] as const;
