// Types pour les clients
export interface Customer {
  id: number;
  name: string;
  phoneNumber: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  measure?: Measure;
}

export interface CustomerSummary {
  id: number;
  name: string;
  phoneNumber: string;
  photoUrl?: string;
  createdAt: string;
  hasMeasures: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  phoneNumber: string;
  photoFile?: File;
}

export interface UpdateCustomerRequest {
  name?: string;
  phoneNumber?: string;
  photoFile?: File;
}

// Types pour les mesures
export interface Measure {
  id: number;
  customerId: number;
  tourPoitrine?: number;
  tourHanches?: number;
  longueurManche?: number;
  tourBras?: number;
  longueurChemise?: number;
  longueurPantalon?: number;
  largeurEpaules?: number;
  tourCou?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeasureRequest {
  customerId: number;
  tourPoitrine?: number;
  tourHanches?: number;
  longueurManche?: number;
  tourBras?: number;
  longueurChemise?: number;
  longueurPantalon?: number;
  largeurEpaules?: number;
  tourCou?: number;
}

export interface UpdateMeasureRequest {
  tourPoitrine?: number;
  tourHanches?: number;
  longueurManche?: number;
  tourBras?: number;
  longueurChemise?: number;
  longueurPantalon?: number;
  largeurEpaules?: number;
  tourCou?: number;
}

// Types pour les réponses API
export interface CustomerApiResponse {
  success: boolean;
  message?: string;
  data?: Customer | Customer[];
}

export interface CustomerSummaryApiResponse {
  success: boolean;
  message?: string;
  data?: CustomerSummary | CustomerSummary[];
}

export interface MeasureApiResponse {
  success: boolean;
  message?: string;
  data?: Measure;
}

// Types pour les erreurs
export interface CustomerError {
  success: false;
  message: string;
}

export interface MeasureError {
  success: false;
  message: string;
}

// Types pour les réponses génériques
export type CustomerResponse<T> = T | CustomerError;
export type MeasureResponse<T> = T | MeasureError;