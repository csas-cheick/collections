import { LoginRequest, LoginResponse, User } from '../types';

const API_BASE_URL = 'https://collections-backend-wucx.onrender.com/api';//'http://localhost:5120/api';//

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Erreur lors de la connexion'
        };
      }

      // Stocker les données utilisateur si la connexion réussit
      if (data.success && data.user) {
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('auth_user');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  /**
   * Obtenir les données utilisateur
   */
  getUser(): User | null {
    const userJson = localStorage.getItem('auth_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Sauvegarder les données utilisateur
   */
  private setUser(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export const authService = new AuthService();
export default authService;