import {
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserListResponse,
  UserOperationResponse,
  UserFilters
} from '../types/user';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api/users';//'http://localhost:5120/api/users';//

class UserService {
  /**
   * Récupérer tous les utilisateurs avec filtres et pagination
   */
  async getAllUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status !== undefined) params.append('status', filters.status.toString());

      const url = `${API_BASE_URL}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des utilisateurs');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUserById(id: number): Promise<UserOperationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération de l\'utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getCurrentUserProfile(): Promise<UserOperationResponse> {
    try {
      // Récupérer l'ID utilisateur depuis le localStorage
      const userJson = localStorage.getItem('auth_user');
      if (!userJson) {
        throw new Error('Aucun utilisateur connecté trouvé');
      }

      const user = JSON.parse(userJson);
      if (!user.id) {
        throw new Error('ID utilisateur invalide');
      }

      const response = await fetch(`${API_BASE_URL}/me?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du profil utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData: CreateUserRequest, pictureFile?: File): Promise<UserOperationResponse> {
    try {
      let response;

      if (pictureFile) {
        // Utiliser FormData si un fichier est fourni
        const formData = new FormData();
        formData.append('Name', userData.name);
        formData.append('UserName', userData.userName);
        formData.append('Email', userData.email);
        formData.append('Password', userData.password);
        formData.append('Role', userData.role);
        formData.append('Status', userData.status.toString());
        
        if (userData.phone) formData.append('Phone', userData.phone);
        if (userData.country) formData.append('Country', userData.country);
        if (userData.city) formData.append('City', userData.city);
        
        formData.append('PictureFile', pictureFile);

        response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData
        });
      } else {
        // Utiliser JSON si pas de fichier
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: number, userData: UpdateUserRequest, pictureFile?: File): Promise<UserOperationResponse> {
    try {
      let response;

      if (pictureFile) {
        // Utiliser FormData si un fichier est fourni
        const formData = new FormData();
        formData.append('Name', userData.name);
        formData.append('UserName', userData.userName);
        formData.append('Email', userData.email);
        formData.append('Role', userData.role);
        formData.append('Status', userData.status.toString());
        
        if (userData.phone) formData.append('Phone', userData.phone);
        if (userData.country) formData.append('Country', userData.country);
        if (userData.city) formData.append('City', userData.city);
        
        formData.append('PictureFile', pictureFile);

        response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Utiliser JSON si pas de fichier
        response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: number): Promise<UserOperationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur
   */
  async changePassword(id: number, passwordData: ChangePasswordRequest): Promise<UserOperationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  async toggleUserStatus(id: number): Promise<UserOperationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de statut');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un email existe
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  }

  /**
   * Vérifier si un nom d'utilisateur existe
   */
  async checkUserNameExists(userName: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-username/${encodeURIComponent(userName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
      return false;
    }
  }

  /**
   * Formater une date au format court
   */
  formatDateShort(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Formater une date au format long
   */
  formatDateLong(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Obtenir la couleur du badge de statut
   */
  getStatusColor(status: boolean): string {
    return status 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  }

  /**
   * Obtenir le texte du statut
   */
  getStatusText(status: boolean): string {
    return status ? 'Actif' : 'Inactif';
  }

  /**
   * Obtenir la couleur du badge de rôle
   */
  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'user':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  /**
   * Valider un fichier image
   */
  validateImageFile(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { 
        valid: false, 
        message: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP' 
      };
    }

    // Taille maximale : 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        message: 'La taille du fichier ne doit pas dépasser 10MB' 
      };
    }

    return { valid: true };
  }
}

const userService = new UserService();
export default userService;