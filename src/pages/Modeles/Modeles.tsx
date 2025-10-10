import { useState, useEffect } from "react";
import { TrashBinIcon, PencilIcon, PlusIcon, CloseIcon } from "../../icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { modeleService } from "../../services";
import { Modele, CreateModeleRequest, UpdateModeleRequest } from "../../types";

export default function Modeles() {
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingModele, setEditingModele] = useState<Modele | null>(null);
  const [formData, setFormData] = useState({
    price: "",
    imageFile: null as File | null
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  // Charger les modèles au montage du composant
  useEffect(() => {
    loadModeles();
  }, []);

  const loadModeles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await modeleService.getAllModeles();
      
      if (Array.isArray(response)) {
        setModeles(response);
      } else if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des modèles");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des modèles");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingModele(null);
    setFormData({ price: "", imageFile: null });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (modele: Modele) => {
    setEditingModele(modele);
    setFormData({ 
      price: modele.price.toString(), 
      imageFile: null 
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingModele(null);
    setFormData({ price: "", imageFile: null });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.price.trim()) {
      errors.price = "Le prix est requis";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Le prix doit être un nombre positif";
    }

    if (!editingModele && !formData.imageFile) {
      errors.imageFile = "Une image est requise";
    }

    if (formData.imageFile) {
      const validation = modeleService.validateImageFile(formData.imageFile);
      if (!validation.valid) {
        errors.imageFile = validation.message || "Fichier invalide";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      let response;

      if (editingModele) {
        // Mise à jour
        const updateRequest: UpdateModeleRequest = {
          price: Number(formData.price),
          ...(formData.imageFile && { imageFile: formData.imageFile })
        };
        response = await modeleService.updateModele(editingModele.id, updateRequest);
      } else {
        // Création
        const createRequest: CreateModeleRequest = {
          price: Number(formData.price),
          imageFile: formData.imageFile!
        };
        response = await modeleService.createModele(createRequest);
      }

      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de l'opération");
      } else {
        // Succès
        await loadModeles();
        closeModal();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de l'opération");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (modele: Modele) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce modèle (${modele.price}FCFA) ?`)) {
      return;
    }

    try {
      const response = await modeleService.deleteModele(modele.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de la suppression");
      } else {
        await loadModeles();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de la suppression");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = modeleService.validateImageFile(file);
      if (validation.valid) {
        setFormData(prev => ({ ...prev, imageFile: file }));
        setFormErrors(prev => ({ ...prev, imageFile: "" }));
      } else {
        setFormErrors(prev => ({ ...prev, imageFile: validation.message || "Fichier invalide" }));
      }
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Modèles | Collections" description="Gestion des modèles" />
        <PageBreadcrumb pageTitle="Modèles" />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Modèles | Collections" description="Gestion des modèles" />
      <PageBreadcrumb pageTitle="Modèles" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Gestion des Modèles
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez vos modèles de couture avec leurs images et prix
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Ajouter un modèle
          </Button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Liste des modèles */}
        {modeles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Aucun modèle disponible
            </div>
            <Button onClick={openCreateModal} variant="outline">
              Créer votre premier modèle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modeles.map((modele) => (
              <div key={modele.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-[4/3] relative">
                  {modele.imageUrl ? (
                    <img
                      src={modele.imageUrl}
                      alt={`Modèle ${modele.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-xs">Image</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                      {modele.price}FCFA
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(modele)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(modele)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Supprimer"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Créé le {new Date(modele.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingModele ? "Modifier le modèle" : "Ajouter un modèle"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Fermer"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu du modal */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix (FCFA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="99.99"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image {editingModele ? "(optionnel)" : "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Sélectionner une image"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Formats supportés: JPEG, PNG, GIF, WebP (max 10MB)
                  </p>
                  {formErrors.imageFile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.imageFile}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "En cours..." : (editingModele ? "Modifier" : "Créer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
