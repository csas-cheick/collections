import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons"; 
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";
import { LoginRequest } from "../../types";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    emailOrUsername: "",
    password: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, authState } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  // Gestion des changements dans les inputs
  const handleInputChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "L'email ou nom d'utilisateur est requis";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login(formData);
      
      if (response.success) {
        // Redirection vers le dashboard après connexion réussie
        navigate('/dashboard');
      } else {
        setErrors({
          general: response.message || "Erreur lors de la connexion"
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrors({
        general: "Erreur de connexion au serveur"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-xs p-6 sm:p-0">       
      <div className="mb-6 text-center">
        <h1 className="font-semibold text-gray-800 text-2xl dark:text-white/90">
          Se connecter
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Affichage des erreurs générales */}
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/10 dark:text-red-400 dark:border-red-800">
              {errors.general}
            </div>
          )}
          
          <div>
            <Label htmlFor="email-input">
              Email ou nom d'utilisateur
            </Label>
            <Input 
              id="email-input"
              value={formData.emailOrUsername}
              onChange={handleInputChange("emailOrUsername")}
              placeholder="test@email.com ou testuser" 
              className={`mt-1 ${errors.emailOrUsername ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.emailOrUsername && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.emailOrUsername}
              </p>
            )}
          </div>          
          
          <div>
            <Label htmlFor="password-input">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder="motdepasse123"
                className={`mt-1 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
              />              
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>
          
          {/* Lien Mot de passe oublié */}
          <div className="text-right">
            <Link
              to="#!" 
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Mot de passe oublié ? 
            </Link>
          </div>
          
          <div>
            <button 
              type="submit"
              className="w-full h-10 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || authState.loading}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}