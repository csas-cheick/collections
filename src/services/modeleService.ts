import { Modele, CreateModeleRequest, UpdateModeleRequest, ModeleResponse } from '../types';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api';//'http://localhost:5120/api';//

class ModeleService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Obtenir les headers basiques
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtenir les headers pour multipart (sans Content-Type pour permettre au navigateur de le définir)
   */
  private getHeadersMultipart(): HeadersInit {
    return {};
  }

  /**
   * Récupérer tous les modèles
   */
  async getAllModeles(): Promise<ModeleResponse<Modele[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/modeles`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la récupération des modèles'
        };
      }

      const modeles: Modele[] = await response.json();
      return modeles;
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer un modèle par ID
   */
  async getModeleById(id: number): Promise<ModeleResponse<Modele>> {
    try {
      const response = await fetch(`${this.baseUrl}/modeles/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Modèle non trouvé'
        };
      }

      const modele: Modele = await response.json();
      return modele;
    } catch (error) {
      console.error('Erreur lors de la récupération du modèle:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Créer un nouveau modèle
   */
  async createModele(request: CreateModeleRequest): Promise<ModeleResponse<Modele>> {
    try {
      const formData = new FormData();
      formData.append('Price', request.price.toString());
      formData.append('ImageFile', request.imageFile);

      const response = await fetch(`${this.baseUrl}/modeles`, {
        method: 'POST',
        headers: this.getHeadersMultipart(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la création du modèle'
        };
      }

      const modele: Modele = await response.json();
      return modele;
    } catch (error) {
      console.error('Erreur lors de la création du modèle:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Mettre à jour un modèle
   */
  async updateModele(id: number, request: UpdateModeleRequest): Promise<ModeleResponse<Modele>> {
    try {
      const formData = new FormData();
      
      if (request.price !== undefined) {
        formData.append('Price', request.price.toString());
      }
      
      if (request.imageFile) {
        formData.append('ImageFile', request.imageFile);
      }

      const response = await fetch(`${this.baseUrl}/modeles/${id}`, {
        method: 'PUT',
        headers: this.getHeadersMultipart(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la mise à jour du modèle'
        };
      }

      const modele: Modele = await response.json();
      return modele;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du modèle:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Supprimer un modèle
   */
  async deleteModele(id: number): Promise<ModeleResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/modeles/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la suppression du modèle'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Valider un fichier image
   */
  validateImageFile(file: File): { valid: boolean; message?: string } {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        message: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP'
      };
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'La taille du fichier ne doit pas dépasser 10MB'
      };
    }

    return { valid: true };
  }
}

// Instance singleton du service
export const modeleService = new ModeleService();
export default modeleService;