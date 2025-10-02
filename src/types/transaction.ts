// Types pour les transactions
export interface Transaction {
  id: number;
  montant: number;
  type: string; // "ENTREE" ou "SORTIE"
  description: string;
  categorie?: string;
  modePaiement?: string; // "ESPECES", "CARTE", "VIREMENT", "CHEQUE"
  dateTransaction: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId?: number;
  notes?: string;
  montantAvecSigne: number; // Propriété calculée côté backend
}

export interface CreateTransactionDto {
  montant: number;
  type: string; // "ENTREE" ou "SORTIE"
  description: string;
  categorie?: string;
  modePaiement?: string;
  dateTransaction?: string;
  notes?: string;
}

export interface UpdateTransactionDto {
  montant?: number;
  type?: string; // "ENTREE" ou "SORTIE"
  description?: string;
  categorie?: string;
  modePaiement?: string;
  dateTransaction?: string;
  notes?: string;
}

export interface TransactionFilters {
  type?: string; // "ENTREE" ou "SORTIE"
  categorie?: string;
  montantMin?: number;
  montantMax?: number;
  dateDebut?: string;
  dateFin?: string;
  modePaiement?: string;
  recherche?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface StatistiquesCaisse {
  totalEntrees: number;
  totalSorties: number;
  solde: number;
  nombreTransactions: number;
  moyenneTransactions: number;
  periodeDebut?: string;
  periodeFin?: string;
}

// Types pour les formulaires
export interface TransactionFormData {
  montant: string;
  type: string; // "ENTREE" ou "SORTIE"
  description: string;
  categorie: string;
  modePaiement: string;
  dateTransaction: string;
  notes?: string;
}

// Constantes pour les types et modes de paiement
export const TRANSACTION_TYPES = {
  ENTREE: 'ENTREE',
  SORTIE: 'SORTIE'
} as const;

export const MODES_PAIEMENT = {
  ESPECES: 'ESPECES',
  CARTE: 'CARTE',
  VIREMENT: 'VIREMENT',
  CHEQUE: 'CHEQUE'
} as const;

// Types pour les sélections dans les formulaires
export type TransactionTypeKey = keyof typeof TRANSACTION_TYPES;
export type ModePaiementKey = keyof typeof MODES_PAIEMENT;

// Options pour les select
export const TRANSACTION_TYPE_OPTIONS = [
  { value: TRANSACTION_TYPES.ENTREE, label: 'Entrée' },
  { value: TRANSACTION_TYPES.SORTIE, label: 'Sortie' }
];

export const MODE_PAIEMENT_OPTIONS = [
  { value: MODES_PAIEMENT.ESPECES, label: 'Espèces' },
  { value: MODES_PAIEMENT.CARTE, label: 'Carte' },
  { value: MODES_PAIEMENT.VIREMENT, label: 'Virement' },
  { value: MODES_PAIEMENT.CHEQUE, label: 'Chèque' }
];

// Catégories par défaut
export const CATEGORIES_SUGGESTIONS = [
  'Vente',
  'Achat matières premières',
  'Frais généraux',
  'Transport',
  'Électricité',
  'Eau',
  'Téléphone/Internet',
  'Assurance',
  'Maintenance',
  'Publicité',
  'Formation',
  'Autres'
];