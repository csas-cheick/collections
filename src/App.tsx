import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import Logout from "./pages/AuthPages/Logout";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Profil from "./pages/Profil/Profil";
import Calendrier from "./pages/Calendrier/Calendrier";
import Utilisateurs from "./pages/Utilisateurs/Utilisateurs";
import Modèles from "./pages/Modeles/Modeles";
import Commandes from "./pages/Commandes/Commandes";
import Clients from "./pages/Clients/Clients";
import Caisse from "./pages/Caisse/Caisse";
import CaisseParSemaine from "./pages/Caisse/CaisseParSemaine";
import { useAuth } from "./context/AuthContext";

// Composant de protection des routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  return authState.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Composant pour rediriger les utilisateurs connectés loin de la page de connexion
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  return authState.isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Route de login - accessible uniquement si non connecté */}
          <Route path="/login" element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } />
          
          {/* Route de logout - accessible à tous */}
          <Route path="/logout" element={<Logout />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Dashboard Layout - protégé */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="profil" element={<Profil />} />
            <Route path="calendrier" element={<Calendrier />} />
            <Route path="caisse" element={<Caisse />} />
            <Route path="caisse-par-semaine" element={<CaisseParSemaine />} />
            <Route path="blank" element={<Blank />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="modeles" element={<Modèles />} />
            <Route path="commandes" element={<Commandes />} />
            <Route path="clients" element={<Clients />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          {/* Anciennes routes - redirections pour compatibilité */}
          <Route path="/TailAdmin/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/TailAdmin/signin" element={<Navigate to="/login" replace />} />
          
          {/* Fallback - redirection vers login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}
