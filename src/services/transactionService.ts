import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  StatistiquesCaisse,
  TransactionsGroupeesParSemaine
} from '../types/transaction';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api'; // 'http://localhost:5120/api';//

class TransactionService {
  private readonly baseURL = `${API_BASE_URL}/transactions`;

  /**
   * Récupérer toutes les transactions avec filtres optionnels
   */
  async getAllTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.type !== undefined) params.append('type', filters.type.toString());
        if (filters.categorie) params.append('categorie', filters.categorie);
        if (filters.montantMin !== undefined) params.append('montantMin', filters.montantMin.toString());
        if (filters.montantMax !== undefined) params.append('montantMax', filters.montantMax.toString());
        if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
        if (filters.dateFin) params.append('dateFin', filters.dateFin);
        if (filters.modePaiement) params.append('modePaiement', filters.modePaiement);
        if (filters.recherche) params.append('recherche', filters.recherche);
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());
        if (filters.orderBy) params.append('orderBy', filters.orderBy);
        if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer une transaction par son ID
   */
  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la transaction ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mettre à jour une transaction
   */
  async updateTransaction(id: number, data: UpdateTransactionDto): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la transaction ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprimer une transaction
   */
  async deleteTransaction(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de la transaction ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer les statistiques de caisse
   */
  async getStatistiques(dateDebut?: string, dateFin?: string): Promise<StatistiquesCaisse> {
    try {
      const params = new URLSearchParams();
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/statistiques?${queryString}` : `${this.baseURL}/statistiques`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer la liste des catégories utilisées
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Utilitaires pour les transactions
   */
  
  /**
   * Formater un montant pour l'affichage
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  }

  /**
   * Formater une date pour l'affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formater une date courte pour l'affichage
   */
  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  /**
   * Obtenir la couleur selon le type de transaction
   */
  getTransactionColor(montantAvecSigne: number): string {
    return montantAvecSigne >= 0 ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Obtenir le préfixe selon le type de transaction
   */
  getTransactionPrefix(montantAvecSigne: number): string {
    return montantAvecSigne >= 0 ? '+' : '';
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: unknown): Error {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Erreur de réseau
      return new Error('Erreur de connexion au serveur');
    }
    
    if (error instanceof Error) {
      if (error.message.includes('HTTP')) {
        // Erreur HTTP
        return error;
      }
      return error;
    }
    
    return new Error('Une erreur inattendue s\'est produite');
  }

  /**
   * Récupérer les transactions groupées par semaine
   */
  async getTransactionsParSemaine(dateDebut?: string, dateFin?: string): Promise<TransactionsGroupeesParSemaine> {
    try {
      const params = new URLSearchParams();
      
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/par-semaine?${queryString}` : `${this.baseURL}/par-semaine`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par semaine:', error);
      throw this.handleError(error);
    }
  }
}

// Instance unique du service
export const transactionService = new TransactionService();
export default transactionService;