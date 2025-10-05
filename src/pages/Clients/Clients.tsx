import { useState, useEffect } from "react";
import { TrashBinIcon, PencilIcon, PlusIcon, CloseIcon, EyeIcon } from "../../icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { customerService } from "../../services";
import { CustomerSummary, Customer, CreateCustomerRequest, UpdateCustomerRequest, Measure, CreateMeasureRequest } from "../../types";

export default function Clients() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showMeasuresModal, setShowMeasuresModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingMeasures, setViewingMeasures] = useState<{ customer: CustomerSummary; measures: Measure | null }>({ customer: {} as CustomerSummary, measures: null });
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    photoFile: undefined as File | undefined
  });
  const [measuresData, setMeasuresData] = useState({
    tourPoitrine: "",
    tourCeinture: "",
    longueurManche: "",
    tourBras: "",
    longueurChemise: "",
    longueurPantalon: "",
    largeurEpaules: "",
    tourCou: "",
    tourMachette: "",
    basDuPied: "",
    cuisse: ""
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  // Charger les clients au montage du composant
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await customerService.getAllCustomers();
      
      if (Array.isArray(response)) {
        setCustomers(response);
      } else if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des clients");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phoneNumber: "", photoFile: undefined });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = async (customer: CustomerSummary) => {
    try {
      const response = await customerService.getCustomerById(customer.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des détails du client");
        return;
      }
      
      const fullCustomer = response as Customer;
      setEditingCustomer(fullCustomer);
      setFormData({ 
        name: fullCustomer.name,
        phoneNumber: fullCustomer.phoneNumber,
        photoFile: undefined 
      });
      setFormErrors({});
      setShowModal(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des détails du client");
    }
  };

  const openMeasuresModal = async (customer: CustomerSummary) => {
    setViewingMeasures({ customer, measures: null });
    setMeasuresData({
      tourPoitrine: "",
      tourCeinture: "",
      longueurManche: "",
      tourBras: "",
      longueurChemise: "",
      longueurPantalon: "",
      largeurEpaules: "",
      tourCou: "",
      tourMachette: "",
      basDuPied: "",
      cuisse: ""
    });
    
    try {
      const response = await customerService.getCustomerMeasures(customer.id);
      
      if ('success' in response && !response.success) {
        // Pas de mesures existantes, c'est normal
        setViewingMeasures({ customer, measures: null });
      } else {
        const measures = response as Measure;
        setViewingMeasures({ customer, measures });
        setMeasuresData({
          tourPoitrine: measures.tourPoitrine?.toString() || "",
          tourCeinture: measures.tourCeinture?.toString() || "",
          longueurManche: measures.longueurManche?.toString() || "",
          tourBras: measures.tourBras?.toString() || "",
          longueurChemise: measures.longueurChemise?.toString() || "",
          longueurPantalon: measures.longueurPantalon?.toString() || "",
          largeurEpaules: measures.largeurEpaules?.toString() || "",
          tourCou: measures.tourCou?.toString() || "",
          tourMachette: measures.tourMachette?.toString() || "",
          basDuPied: measures.basDuPied?.toString() || "",
          cuisse: measures.cuisse?.toString() || ""
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setViewingMeasures({ customer, measures: null });
    }
    
    setShowMeasuresModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: "", phoneNumber: "", photoFile: undefined });
    setFormErrors({});
  };

  const closeMeasuresModal = () => {
    setShowMeasuresModal(false);
    setViewingMeasures({ customer: {} as CustomerSummary, measures: null });
    setMeasuresData({
      tourPoitrine: "",
      tourCeinture: "",
      longueurManche: "",
      tourBras: "",
      longueurChemise: "",
      longueurPantalon: "",
      largeurEpaules: "",
      tourCou: "",
      tourMachette: "",
      basDuPied: "",
      cuisse: ""
    });
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom est requis";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Le numéro de téléphone est requis";
    }

    const validation = customerService.validateCustomerData(formData);
    if (!validation.valid) {
      errors.general = validation.message || "Données invalides";
    }

    if (formData.photoFile) {
      const imageValidation = customerService.validateImageFile(formData.photoFile);
      if (!imageValidation.valid) {
        errors.photoFile = imageValidation.message || "Fichier invalide";
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

      if (editingCustomer) {
        // Mise à jour
        const updateRequest: UpdateCustomerRequest = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          ...(formData.photoFile && { photoFile: formData.photoFile })
        };
        response = await customerService.updateCustomer(editingCustomer.id, updateRequest);
      } else {
        // Création
        const createRequest: CreateCustomerRequest = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          ...(formData.photoFile && { photoFile: formData.photoFile })
        };
        response = await customerService.createCustomer(createRequest);
      }

      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de l'opération");
      } else {
        // Succès
        await loadCustomers();
        closeModal();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de l'opération");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMeasuresSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError("");

    try {
      const measureRequest: CreateMeasureRequest = {
        customerId: viewingMeasures.customer.id,
        tourPoitrine: measuresData.tourPoitrine ? Number(measuresData.tourPoitrine) : undefined,
        tourCeinture: measuresData.tourCeinture ? Number(measuresData.tourCeinture) : undefined,
        longueurManche: measuresData.longueurManche ? Number(measuresData.longueurManche) : undefined,
        tourBras: measuresData.tourBras ? Number(measuresData.tourBras) : undefined,
        longueurChemise: measuresData.longueurChemise ? Number(measuresData.longueurChemise) : undefined,
        longueurPantalon: measuresData.longueurPantalon ? Number(measuresData.longueurPantalon) : undefined,
        largeurEpaules: measuresData.largeurEpaules ? Number(measuresData.largeurEpaules) : undefined,
        tourCou: measuresData.tourCou ? Number(measuresData.tourCou) : undefined,
        tourMachette: measuresData.tourMachette ? Number(measuresData.tourMachette) : undefined,
        basDuPied: measuresData.basDuPied ? Number(measuresData.basDuPied) : undefined,
        cuisse: measuresData.cuisse ? Number(measuresData.cuisse) : undefined
      };

      const validation = customerService.validateMeasureData(measureRequest);
      if (!validation.valid) {
        setError(validation.message || "Données de mesures invalides");
        return;
      }

      const response = await customerService.createOrUpdateMeasures(viewingMeasures.customer.id, measureRequest);

      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de la sauvegarde des mesures");
      } else {
        // Succès
        await loadCustomers();
        closeMeasuresModal();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de la sauvegarde des mesures");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: CustomerSummary) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client ${customer.name} ?`)) {
      return;
    }

    try {
      const response = await customerService.deleteCustomer(customer.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de la suppression");
      } else {
        await loadCustomers();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de la suppression");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = customerService.validateImageFile(file);
      if (validation.valid) {
        setFormData(prev => ({ ...prev, photoFile: file }));
        setFormErrors(prev => ({ ...prev, photoFile: "" }));
      } else {
        setFormErrors(prev => ({ ...prev, photoFile: validation.message || "Fichier invalide" }));
      }
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Clients | Collections" description="Gestion des clients" />
        <PageBreadcrumb pageTitle="Clients" />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Clients | Collections" description="Gestion des clients" />
      <PageBreadcrumb pageTitle="Clients" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Gestion des Clients
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez vos clients et leurs mesures de couture
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Ajouter un client
          </Button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Liste des clients */}
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Aucun client disponible
            </div>
            <Button onClick={openCreateModal} variant="outline">
              Créer votre premier client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Photo */}
                <div className="aspect-[4/3] relative">
                  {customer.photoUrl ? (
                    <img
                      src={customer.photoUrl}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <div className="text-3xl mb-2">👤</div>
                        <div className="text-xs">Photo</div>
                      </div>
                    </div>
                  )}
                  {/* Badge pour les mesures */}
                  {customer.hasMeasures && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Mesurés
                    </div>
                  )}
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
                      {customer.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {customer.phoneNumber}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center justify-center gap-1 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => openMeasuresModal(customer)}
                      className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded text-sm flex items-center justify-center gap-1 dark:text-green-400 dark:hover:bg-green-900/20"
                      title="Voir/Modifier les mesures"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Mesures
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Supprimer"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Créé le {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingCustomer ? "Modifier le client" : "Ajouter un client"}
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
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Nom du client"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+33 6 12 34 56 78"
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photo (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Sélectionner une photo"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Formats supportés: JPEG, PNG, GIF, WebP (max 10MB)
                  </p>
                  {formErrors.photoFile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.photoFile}
                    </p>
                  )}
                </div>

                {/* Erreur générale */}
                {formErrors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
                    {formErrors.general}
                  </div>
                )}
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
                  {submitting ? "En cours..." : (editingCustomer ? "Modifier" : "Créer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mesures */}
      {showMeasuresModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Mesures de {viewingMeasures.customer.name}
              </h3>
              <button
                onClick={closeMeasuresModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Fermer"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu du modal */}
            <form onSubmit={handleMeasuresSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Tour de poitrine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tour de poitrine (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={measuresData.tourPoitrine}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, tourPoitrine: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 102.5"
                  />
                </div>

                {/* Tour ceinture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tour ceinture (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={measuresData.tourCeinture}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, tourCeinture: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 95.0"
                  />
                </div>

                {/* Longueur de manche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longueur de manche (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    value={measuresData.longueurManche}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, longueurManche: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 65.0"
                  />
                </div>

                {/* Tour de bras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tour de bras (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={measuresData.tourBras}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, tourBras: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 32.0"
                  />
                </div>

                {/* Longueur de pantalon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longueur de pantalon (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    value={measuresData.longueurPantalon}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, longueurPantalon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 105.0"
                  />
                </div>

                {/* Largeur d'épaules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Largeur d'épaules (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={measuresData.largeurEpaules}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, largeurEpaules: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 45.0"
                  />
                </div>

                {/* Tour de cou */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tour de cou (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={measuresData.tourCou}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, tourCou: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 42.0"
                  />
                </div>

                {/* Tour machette */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tour machette (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={measuresData.tourMachette}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, tourMachette: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 25.0"
                  />
                </div>

                {/* Bas du pied */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bas du pied (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={measuresData.basDuPied}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, basDuPied: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 27.0"
                  />
                </div>

                {/* Cuisse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuisse (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={measuresData.cuisse}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, cuisse: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 65.0"
                  />
                </div>

                {/* Longueur de chemise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longueur de chemise (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    value={measuresData.longueurChemise}
                    onChange={(e) => setMeasuresData(prev => ({ ...prev, longueurChemise: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: 75.0"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeMeasuresModal}
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
                  {submitting ? "En cours..." : "Sauvegarder les mesures"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
