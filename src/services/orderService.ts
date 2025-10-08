import { 
  Order, 
  OrderSummary, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  CreateOrderItemRequest,
  OrderError,
  OrderItemError,
  ModeleOption,
  TotalCalculationResponse,
  FinalTotalCalculationResponse,
  OrderFormData,
  OrderItemFormData
} from '../types';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api';//'http://localhost:5120/api';//

// Types pour les réponses
export type OrderResponse<T> = T | OrderError;
export type OrderItemResponse<T> = T | OrderItemError;

class OrderService {
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
   * Récupérer toutes les commandes (résumé)
   */
  async getAllOrders(): Promise<OrderResponse<OrderSummary[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la récupération des commandes'
        };
      }

      const orders: OrderSummary[] = await response.json();
      return orders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer une commande par ID avec ses items
   */
  async getOrderById(id: number): Promise<OrderResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Commande non trouvée'
        };
      }

      const order: Order = await response.json();
      return order;
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Créer une nouvelle commande
   */
  async createOrder(createRequest: CreateOrderRequest): Promise<OrderResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(createRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la création de la commande',
          errors: error.errors
        };
      }

      const order: Order = await response.json();
      return order;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Mettre à jour une commande existante
   */
  async updateOrder(id: number, updateRequest: UpdateOrderRequest): Promise<OrderResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la mise à jour de la commande',
          errors: error.errors
        };
      }

      const order: Order = await response.json();
      return order;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Supprimer une commande
   */
  async deleteOrder(id: number): Promise<OrderResponse<{ success: true; message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la suppression de la commande'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Calculer le total d'une commande
   */
  async calculateOrderTotal(items: CreateOrderItemRequest[]): Promise<OrderResponse<TotalCalculationResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/calculate-total`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors du calcul du total'
        };
      }

      const result: TotalCalculationResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du calcul du total:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Calculer le total final avec réduction
   */
  async calculateFinalTotal(total: number, reduction?: number): Promise<OrderResponse<FinalTotalCalculationResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/calculate-final-total`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ total, reduction }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors du calcul du total final'
        };
      }

      const result: FinalTotalCalculationResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du calcul du total final:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer les commandes d'un client
   */
  async getOrdersByCustomer(customerId: number): Promise<OrderResponse<OrderSummary[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/customer/${customerId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la récupération des commandes du client'
        };
      }

      const orders: OrderSummary[] = await response.json();
      return orders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes du client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer les commandes par statut
   */
  async getOrdersByStatus(status: string): Promise<OrderResponse<OrderSummary[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/status/${encodeURIComponent(status)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la récupération des commandes par statut'
        };
      }

      const orders: OrderSummary[] = await response.json();
      return orders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes par statut:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(id: number, status: string): Promise<OrderResponse<{ success: true; message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors de la mise à jour du statut'
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Récupérer tous les modèles disponibles avec leurs prix (pour les sélecteurs)
   */
  async getAvailableModeles(): Promise<OrderResponse<ModeleOption[]>> {
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

      const modeles = await response.json();
      
      // Convertir les modèles en options pour les sélecteurs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modeleOptions: ModeleOption[] = modeles.map((modele: any) => ({
        id: modele.id,
        nom: modele.nom,
        price: modele.price,
        imageUrl: modele.imageUrl,
        description: modele.description
      }));

      return modeleOptions;
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // ========== MÉTHODES DE VALIDATION ==========

  /**
   * Valider les données d'une commande
   */
  validateOrderData(data: OrderFormData): { valid: boolean; message?: string } {
    if (!data.customerId || data.customerId <= 0) {
      return { valid: false, message: "Veuillez sélectionner un client" };
    }

    if (!data.dateCommande) {
      return { valid: false, message: "La date de commande est requise" };
    }

    if (!data.statut) {
      return { valid: false, message: "Le statut est requis" };
    }

    if (!data.orderItems || data.orderItems.length === 0) {
      return { valid: false, message: "Au moins un article est requis" };
    }

    // Valider chaque item
    for (let i = 0; i < data.orderItems.length; i++) {
      const itemValidation = this.validateOrderItemData(data.orderItems[i]);
      if (!itemValidation.valid) {
        return { valid: false, message: `Article ${i + 1}: ${itemValidation.message}` };
      }
    }

    if (data.hasReduction && data.reduction !== undefined) {
      if (data.reduction < 0) {
        return { valid: false, message: "La réduction ne peut pas être négative" };
      }
    }

    return { valid: true };
  }

  /**
   * Valider les données d'un item de commande
   */
  validateOrderItemData(data: OrderItemFormData): { valid: boolean; message?: string } {
    if (!data.modeleId || data.modeleId <= 0) {
      return { valid: false, message: "Veuillez sélectionner un modèle" };
    }

    if (!data.typeTissu || data.typeTissu.trim().length === 0) {
      return { valid: false, message: "Le type de tissu est requis" };
    }

    if (!data.couleur || data.couleur.trim().length === 0) {
      return { valid: false, message: "La couleur est requise" };
    }

    if (!data.quantite || data.quantite <= 0) {
      return { valid: false, message: "La quantité doit être supérieure à 0" };
    }

    if (data.quantite > 100) {
      return { valid: false, message: "La quantité ne peut pas dépasser 100" };
    }

    return { valid: true };
  }

  // ========== MÉTHODES UTILITAIRES ==========

  /**
   * Formater le prix en CFA
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('XOF', 'CFA');
  }

  /**
   * Formater la date
   */
  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR');
  }

  /**
   * Formater la date et l'heure
   */
  formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fr-FR');
  }

  /**
   * Obtenir la couleur de badge pour un statut
   */
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'En cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Terminé':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Livré':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Annulé':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  /**
   * Récupérer les commandes avec rendez-vous pour le calendrier
   */
  async getOrdersWithAppointments(startDate?: string, endDate?: string): Promise<OrderResponse<OrderSummary[]>> {
    try {
      let url = `${this.baseUrl}/orders/appointments`;
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `Erreur HTTP: ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return {
        success: false,
        message: 'Erreur de réseau lors de la récupération des rendez-vous',
      };
    }
  }
}

export default new OrderService();