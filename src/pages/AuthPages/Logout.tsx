import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

/**
 * Composant de déconnexion automatique
 * Déconnecte l'utilisateur et le redirige vers la page de connexion
 */
export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Effectuer la déconnexion
    logout();
    
    // Rediriger vers la page de connexion
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Afficher un message de chargement pendant la déconnexion
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Déconnexion en cours...</p>
      </div>
    </div>
  );
}