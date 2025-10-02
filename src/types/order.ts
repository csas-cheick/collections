// Types pour les commandes et leurs items

export interface OrderItem {
  id: number;
  modeleId: number;
  typeTissu: string;
  couleur: string;
  prixUnitaire: number;
  quantite: number;
  notes?: string;
}

export interface CreateOrderItemRequest {
  modeleId: number;
  typeTissu: string;
  couleur: string;
  quantite: number;
  notes?: string;
}

export interface UpdateOrderItemRequest {
  modeleId?: number;
  typeTissu?: string;
  couleur?: string;
  quantite?: number;
  notes?: string;
}

export interface OrderSummary {
  id: number;
  customerId: number;
  customerName: string;
  dateCommande: string;
  dateRendezVous?: string;
  total: number;
  reduction?: number;
  totalFinal: number;
  statut: string;
  nombreItems: number;
  createdAt: string;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  dateCommande: string;
  dateRendezVous?: string;
  total: number;
  reduction?: number;
  totalFinal: number;
  statut: string;
  notes?: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: number;
  dateCommande: string;
  dateRendezVous?: string;
  statut: string;
  notes?: string;
  reduction?: number;
  orderItems: CreateOrderItemRequest[];
}

export interface UpdateOrderRequest {
  customerId?: number;
  dateCommande?: string;
  dateRendezVous?: string;
  statut?: string;
  notes?: string;
  reduction?: number;
  orderItems?: CreateOrderItemRequest[];
}

// Types pour les erreurs
export interface OrderError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface OrderItemError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Types pour les sélections de modèles avec prix
export interface ModeleOption {
  id: number;
  nom: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

// Types pour les statuts de commande
export type OrderStatus = "En cours" | "Terminé" | "Livré" | "Annulé";

// Types pour les calculs
export interface CalculateTotalRequest {
  items: CreateOrderItemRequest[];
}

export interface CalculateFinalTotalRequest {
  total: number;
  reduction?: number;
}

// Types pour les réponses de calcul
export interface TotalCalculationResponse {
  total: number;
}

export interface FinalTotalCalculationResponse {
  finalTotal: number;
}

// Type pour les options de tissu et couleur (peut être étendu plus tard)
export interface TissuOption {
  value: string;
  label: string;
  category?: string;
}

export interface CouleurOption {
  value: string;
  label: string;
  hexCode?: string;
}

// Types pour les formulaires de l'interface
export interface OrderFormData {
  customerId: number;
  dateCommande: string;
  dateRendezVous?: string;
  statut: OrderStatus;
  notes?: string;
  hasReduction: boolean;
  reduction?: number;
  orderItems: OrderItemFormData[];
}

export interface OrderItemFormData {
  id?: number; // Pour l'édition
  modeleId: number;
  typeTissu: string;
  couleur: string;
  quantite: number;
  prixUnitaire?: number;
  notes?: string;
}

// Constantes pour les options
export const ORDER_STATUSES: OrderStatus[] = ["En cours", "Terminé", "Livré", "Annulé"];

export const TISSU_OPTIONS: TissuOption[] = [
  { value: "bazin", label: "Bazin" },
  { value: "wax", label: "Wax" },
  { value: "coton", label: "Coton" },
  { value: "soie", label: "Soie" },
  { value: "lin", label: "Lin" },
  { value: "polyester", label: "Polyester" },
  { value: "jean", label: "Jean" },
  { value: "laine", label: "Laine" },
  { value: "autre", label: "Autre" }
];

export const COULEUR_OPTIONS: CouleurOption[] = [
  { value: "blanc", label: "Blanc", hexCode: "#FFFFFF" },
  { value: "noir", label: "Noir", hexCode: "#000000" },
  { value: "bleu", label: "Bleu", hexCode: "#0000FF" },
  { value: "rouge", label: "Rouge", hexCode: "#FF0000" },
  { value: "vert", label: "Vert", hexCode: "#008000" },
  { value: "jaune", label: "Jaune", hexCode: "#FFFF00" },
  { value: "orange", label: "Orange", hexCode: "#FFA500" },
  { value: "violet", label: "Violet", hexCode: "#800080" },
  { value: "rose", label: "Rose", hexCode: "#FFC0CB" },
  { value: "gris", label: "Gris", hexCode: "#808080" },
  { value: "marron", label: "Marron", hexCode: "#A52A2A" },
  { value: "beige", label: "Beige", hexCode: "#F5F5DC" },
  { value: "multicolore", label: "Multicolore" }
];