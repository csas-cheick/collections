import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginRequest, LoginResponse, User } from '../types';
import { authService } from '../services';

// État initial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
};

// Types d'actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// Contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Initialisation
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const user = authService.getUser();

        if (user && authService.isAuthenticated()) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user }
          });
        } else {
          authService.logout();
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        authService.logout();
        dispatch({ type: 'LOGIN_FAILURE' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user
          }
        });
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }

      return response;
    } catch {
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Fonction de mise à jour
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}