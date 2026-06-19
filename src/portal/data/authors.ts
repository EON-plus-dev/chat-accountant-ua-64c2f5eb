export interface Author {
  id: string;
  initials: string;
  name: string;
  title: string;
  yearsExperience: number;
  articlesCount: number;
  linkedinUrl?: string;
  avatarUrl?: string;
}

export const AUTHORS: Author[] = [
  { id: 'editorial', initials: 'FT', name: 'Редакція FINTODO', title: 'Фінансовий портал', yearsExperience: 0, articlesCount: 0 },
];
