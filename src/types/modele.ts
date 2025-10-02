// Types pour les modèles
export interface Modele {
  id: number;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModeleRequest {
  price: number;
  imageFile: File;
}

export interface UpdateModeleRequest {
  price?: number;
  imageFile?: File;
}

export interface ModeleApiResponse {
  success: boolean;
  message?: string;
  data?: Modele | Modele[];
}

// Types pour les erreurs
export interface ModeleError {
  success: false;
  message: string;
}

// Type générique pour les réponses API des modèles
export type ModeleResponse<T> = T | ModeleError;