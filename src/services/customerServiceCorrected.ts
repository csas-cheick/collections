import { 
  Customer, 
  CustomerSummary, 
  CreateCustomerRequest, 
  UpdateCustomerRequest, 
  Measure,
  CreateMeasureRequest,
  UpdateMeasureRequest,
  CustomerError,
  MeasureError
} from '../types';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api';// 'http://localhost:5120/api';//

// Types pour les réponses
export type CustomerResponse<T> = T | CustomerError;
export type MeasureResponse<T> = T | MeasureError;

class CustomerService {
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
   * Récupérer tous les clients (résumé)
   */
  async getAllCustomers(): Promise<CustomerResponse<CustomerSummary[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la récupération des clients'
        };
      }

      const customers: CustomerSummary[] = await response.json();
      return customers;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer un client par ID avec ses mesures
   */
  async getCustomerById(id: number): Promise<CustomerResponse<Customer>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Client non trouvé'
        };
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Créer un nouveau client
   */
  async createCustomer(request: CreateCustomerRequest): Promise<CustomerResponse<Customer>> {
    try {
      const formData = new FormData();
      formData.append('Name', request.name);
      formData.append('PhoneNumber', request.phoneNumber);
      
      if (request.photoFile) {
        formData.append('PhotoFile', request.photoFile);
      }

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.getHeadersMultipart(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la création du client'
        };
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Mettre à jour un client
   */
  async updateCustomer(id: number, request: UpdateCustomerRequest): Promise<CustomerResponse<Customer>> {
    try {
      const formData = new FormData();
      
      if (request.name !== undefined) {
        formData.append('Name', request.name);
      }
      
      if (request.phoneNumber !== undefined) {
        formData.append('PhoneNumber', request.phoneNumber);
      }
      
      if (request.photoFile) {
        formData.append('PhotoFile', request.photoFile);
      }

      const response = await fetch(`${this.baseUrl}/customers/${id}`, {
        method: 'PUT',
        headers: this.getHeadersMultipart(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la mise à jour du client'
        };
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Supprimer un client
   */
  async deleteCustomer(id: number): Promise<CustomerResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la suppression du client'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer les mesures d'un client
   */
  async getCustomerMeasures(customerId: number): Promise<MeasureResponse<Measure>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/measures`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Mesures non trouvées pour ce client'
        };
      }

      const measures: Measure = await response.json();
      return measures;
    } catch (error) {
      console.error('Erreur lors de la récupération des mesures:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Créer ou mettre à jour les mesures d'un client
   */
  async createOrUpdateMeasures(customerId: number, request: CreateMeasureRequest): Promise<MeasureResponse<Measure>> {
    try {
      // S'assurer que l'ID du client correspond
      const measureData = {
        ...request,
        customerId: customerId
      };

      const response = await fetch(`${this.baseUrl}/customers/${customerId}/measures`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(measureData),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la gestion des mesures'
        };
      }

      const measures: Measure = await response.json();
      return measures;
    } catch (error) {
      console.error('Erreur lors de la gestion des mesures:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Supprimer les mesures d'un client
   */
  async deleteMeasures(customerId: number): Promise<MeasureResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/measures`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la suppression des mesures'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression des mesures:', error);
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

  /**
   * Valider les données d'un client
   */
  validateCustomerData(data: CreateCustomerRequest | UpdateCustomerRequest): { valid: boolean; message?: string } {
    if ('name' in data && data.name) {
      if (data.name.trim().length < 2) {
        return {
          valid: false,
          message: 'Le nom doit contenir au moins 2 caractères'
        };
      }
    }

    if ('phoneNumber' in data && data.phoneNumber) {
      const phoneRegex = /^[\d\s\-+()]{8,15}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        return {
          valid: false,
          message: 'Le numéro de téléphone doit contenir entre 8 et 15 chiffres'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Valider les données de mesures
   */
  validateMeasureData(data: CreateMeasureRequest | UpdateMeasureRequest): { valid: boolean; message?: string } {
    const measurements = [
      { field: 'tourPoitrine', name: 'Tour de poitrine', min: 0, max: 300 },
      { field: 'tourCeinture', name: 'Tour ceinture', min: 0, max: 300 },
      { field: 'longueurManche', name: 'Longueur de manche', min: 0, max: 150 },
      { field: 'tourBras', name: 'Tour de bras', min: 0, max: 100 },
      { field: 'longueurChemise', name: 'Longueur de chemise', min: 0, max: 200 },
      { field: 'longueurPantalon', name: 'Longueur de pantalon', min: 0, max: 150 },
      { field: 'largeurEpaules', name: 'Largeur d\'épaules', min: 0, max: 100 },
      { field: 'tourCou', name: 'Tour de cou', min: 0, max: 100 }
    ];

    for (const measurement of measurements) {
      const value = (data as Record<string, unknown>)[measurement.field];
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value < measurement.min || value > measurement.max) {
          return {
            valid: false,
            message: `${measurement.name} doit être entre ${measurement.min} et ${measurement.max} cm`
          };
        }
      }
    }

    return { valid: true };
  }
}

// Instance singleton du service
export const customerService = new CustomerService();
export default customerService;