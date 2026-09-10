export interface NetworkConfig {
  id: string;
  name: string;
  code: string;
  country: string;
  color: string;
  textColor: string;
  badgeBg: string;
  badgeDarkBg: string;
  borderColor: string;
}

export const TIVO_NETWORKS: NetworkConfig[] = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    code: 'MTN',
    country: 'Bénin',
    color: '#EAB308', // Vibrant yellow
    textColor: 'var(--net-mtn-text, #854D0E)',
    badgeBg: 'var(--net-mtn-bg, #FEF9C3)',
    badgeDarkBg: 'rgba(234, 179, 8, 0.18)',
    borderColor: 'var(--net-mtn-border, #FACC15)',
  },
  {
    id: 'moov',
    name: 'Moov Money',
    code: 'MOOV',
    country: 'Bénin',
    color: '#0284C7', // Sky Blue
    textColor: 'var(--net-moov-text, #0369A1)',
    badgeBg: 'var(--net-moov-bg, #E0F2FE)',
    badgeDarkBg: 'rgba(2, 132, 199, 0.2)',
    borderColor: 'var(--net-moov-border, #7DD3FC)',
  },
  {
    id: 'celtis',
    name: 'Celtis Cash',
    code: 'CELTIS',
    country: 'Bénin',
    color: '#10B981', // Emerald green
    textColor: 'var(--net-celtis-text, #065F46)',
    badgeBg: 'var(--net-celtis-bg, #D1FAE5)',
    badgeDarkBg: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'var(--net-celtis-border, #6EE7B7)',
  },
  {
    id: 'smt',
    name: 'SMT / Monétique',
    code: 'SMT',
    country: 'UEMOA',
    color: '#8B5CF6', // Purple
    textColor: 'var(--net-smt-text, #5B21B6)',
    badgeBg: 'var(--net-smt-bg, #EDE9FE)',
    badgeDarkBg: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'var(--net-smt-border, #C4B5FD)',
  },
  {
    id: 'other',
    name: 'Autre réseau',
    code: 'AUTRE',
    country: 'Afrique de l’Ouest',
    color: '#64748B', // Slate
    textColor: 'var(--net-other-text, #1E293B)',
    badgeBg: 'var(--net-other-bg, #F1F5F9)',
    badgeDarkBg: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'var(--net-other-border, #CBD5E1)',
  },
];

export const TIVO_THEME_TOKENS = {
  primary: '#0A2540',
  accent: '#2563EB',
  gradient: 'linear-gradient(180deg, #0A2540 0%, #0F172A 100%)',
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    field: '#F1F5F9',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    bg: '#090D16',
    card: '#0F172A',
    field: '#1E293B',
    text: '#F8FAFC',
    muted: '#94A3B8',
    border: '#1E293B',
  },
  status: {
    success: '#16A34A', // Dépôt / Succès
    error: '#EF4444',   // Retrait / Erreur
    warning: '#F59E0B', // Offline / Seuil critique
  },
};
