import { useState, useEffect } from "react";
import { TrashBinIcon, PencilIcon, PlusIcon, CloseIcon, EyeIcon } from "../../icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { orderService, customerService } from "../../services";
import { 
  OrderSummary, 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  OrderFormData, 
  OrderItemFormData,
  CustomerSummary,
  ModeleOption,
  ORDER_STATUSES,
  TISSU_OPTIONS,
  COULEUR_OPTIONS
} from "../../types";

export default function Orders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [modeles, setModeles] = useState<ModeleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    customerId: 0,
    dateCommande: new Date().toISOString().split('T')[0],
    statut: "En cours",
    notes: "",
    hasReduction: false,
    reduction: undefined,
    orderItems: []
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      await Promise.all([
        loadOrders(),
        loadCustomers(),
        loadModeles()
      ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders();
      
      if (Array.isArray(response)) {
        setOrders(response);
      } else if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des commandes");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des commandes");
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      
      if (Array.isArray(response)) {
        setCustomers(response);
      } else if ('success' in response && !response.success) {
        console.error("Erreur lors du chargement des clients:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };

  const loadModeles = async () => {
    try {
      const response = await orderService.getAvailableModeles();
      
      if (Array.isArray(response)) {
        setModeles(response);
      } else if ('success' in response && !response.success) {
        console.error("Erreur lors du chargement des modèles:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error);
    }
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({
      customerId: 0,
      dateCommande: new Date().toISOString().split('T')[0],
      dateRendezVous: "",
      statut: "En cours",
      notes: "",
      hasReduction: false,
      reduction: undefined,
      orderItems: []
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = async (order: OrderSummary) => {
    try {
      const response = await orderService.getOrderById(order.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des détails de la commande");
        return;
      }
      
      const fullOrder = response as Order;
      setEditingOrder(fullOrder);
      setFormData({
        customerId: fullOrder.customerId,
        dateCommande: fullOrder.dateCommande.split('T')[0],
        dateRendezVous: fullOrder.dateRendezVous ? fullOrder.dateRendezVous.split('T')[0] : "",
        statut: fullOrder.statut as "En cours" | "Terminé" | "Livré" | "Annulé",
        notes: fullOrder.notes || "",
        hasReduction: fullOrder.reduction !== undefined && fullOrder.reduction > 0,
        reduction: fullOrder.reduction,
        orderItems: fullOrder.orderItems.map(item => ({
          id: item.id,
          modeleId: item.modeleId,
          typeTissu: item.typeTissu,
          couleur: item.couleur,
          quantite: item.quantite,
          prixUnitaire: item.prixUnitaire,
          notes: item.notes
        }))
      });
      setFormErrors({});
      setShowModal(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des détails de la commande");
    }
  };

  const openDetailsModal = async (order: OrderSummary) => {
    try {
      const response = await orderService.getOrderById(order.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des détails de la commande");
        return;
      }
      
      const fullOrder = response as Order;
      setViewingOrder(fullOrder);
      setShowDetailsModal(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors du chargement des détails de la commande");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      customerId: 0,
      dateCommande: new Date().toISOString().split('T')[0],
      statut: "En cours",
      notes: "",
      hasReduction: false,
      reduction: undefined,
      orderItems: []
    });
    setFormErrors({});
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingOrder(null);
  };

  const addOrderItem = () => {
    const newItem: OrderItemFormData = {
      modeleId: 0,
      typeTissu: "",
      couleur: "",
      quantite: 1,
      notes: ""
    };
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, newItem]
    }));
  };

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: keyof OrderItemFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Si le modèle change, mettre à jour le prix
          if (field === 'modeleId' && Number(value) > 0) {
            const modele = modeles.find(m => m.id === Number(value));
            if (modele) {
              updatedItem.prixUnitaire = modele.price;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotal = (): number => {
    return formData.orderItems.reduce((total, item) => {
      const modele = modeles.find(m => m.id === item.modeleId);
      const prix = modele ? modele.price : (item.prixUnitaire || 0);
      return total + (prix * item.quantite);
    }, 0);
  };

  const calculateFinalTotal = (): number => {
    const total = calculateTotal();
    const reduction = formData.hasReduction && formData.reduction ? formData.reduction : 0;
    return Math.max(0, total - reduction);
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    const validation = orderService.validateOrderData(formData);
    if (!validation.valid) {
      errors.general = validation.message || "Données invalides";
    }

    if (formData.hasReduction && formData.reduction !== undefined) {
      const total = calculateTotal();
      if (formData.reduction > total) {
        errors.reduction = "La réduction ne peut pas être supérieure au total";
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
      const orderItemsRequest = formData.orderItems.map(item => ({
        modeleId: item.modeleId,
        typeTissu: item.typeTissu,
        couleur: item.couleur,
        quantite: item.quantite,
        notes: item.notes
      }));

      let response;

      if (editingOrder) {
        // Mise à jour
        const updateRequest: UpdateOrderRequest = {
          customerId: formData.customerId,
          dateCommande: formData.dateCommande,
          dateRendezVous: formData.dateRendezVous || undefined,
          statut: formData.statut,
          notes: formData.notes,
          reduction: formData.hasReduction ? formData.reduction : undefined,
          orderItems: orderItemsRequest
        };
        response = await orderService.updateOrder(editingOrder.id, updateRequest);
      } else {
        // Création
        const createRequest: CreateOrderRequest = {
          customerId: formData.customerId,
          dateCommande: formData.dateCommande,
          dateRendezVous: formData.dateRendezVous || undefined,
          statut: formData.statut,
          notes: formData.notes,
          reduction: formData.hasReduction ? formData.reduction : undefined,
          orderItems: orderItemsRequest
        };
        response = await orderService.createOrder(createRequest);
      }

      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de l'opération");
      } else {
        // Succès
        await loadOrders();
        closeModal();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de l'opération");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (order: OrderSummary) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.id} ?`)) {
      return;
    }

    try {
      const response = await orderService.deleteOrder(order.id);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de la suppression");
      } else {
        await loadOrders();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de la suppression");
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors de la mise à jour du statut");
      } else {
        await loadOrders();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Erreur lors de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Commandes | Collections" description="Gestion des commandes" />
        <PageBreadcrumb pageTitle="Commandes" />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Commandes | Collections" description="Gestion des commandes" />
      <PageBreadcrumb pageTitle="Commandes" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Gestion des Commandes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez les commandes clients avec tissus et modèles
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Nouvelle commande
          </Button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Aucune commande disponible
            </div>
            <Button onClick={openCreateModal} variant="outline">
              Créer votre première commande
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                        Commande #{order.id}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderService.getStatusBadgeColor(order.statut)}`}>
                        {order.statut}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Client:</strong> {order.customerName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Date:</strong> {orderService.formatDate(order.dateCommande)}
                        </p>
                        {order.dateRendezVous && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>RDV:</strong> {orderService.formatDate(order.dateRendezVous)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Articles:</strong> {order.nombreItems} article{order.nombreItems > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Total:</strong> {orderService.formatPrice(order.total)}
                        </p>
                      </div>
                      <div>
                        {order.reduction && order.reduction > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Réduction:</strong> -{orderService.formatPrice(order.reduction)}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          <strong>Total final:</strong> {orderService.formatPrice(order.totalFinal)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailsModal(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:bg-blue-900/20"
                      title="Voir détails"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded dark:text-green-400 dark:hover:bg-green-900/20"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Supprimer"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Sélecteur de statut rapide */}
                    <select
                      value={order.statut}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="ml-2 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Commande */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingOrder ? "Modifier la commande" : "Nouvelle commande"}
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
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client *
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value={0}>Sélectionner un client</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phoneNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de commande *
                    </label>
                    <input
                      type="date"
                      value={formData.dateCommande}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateCommande: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Date de rendez-vous */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de rendez-vous (récupération)
                    </label>
                    <input
                      type="date"
                      value={formData.dateRendezVous || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateRendezVous: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min={formData.dateCommande} // Ne peut pas être antérieure à la date de commande
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Date prévue pour la récupération de la commande par le client
                    </p>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut *
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as "En cours" | "Terminé" | "Livré" | "Annulé" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Notes sur la commande..."
                  />
                </div>

                {/* Articles de la commande */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                      Articles de la commande
                    </h4>
                    <Button onClick={addOrderItem} size="sm">
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Ajouter un article
                    </Button>
                  </div>

                  {formData.orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.orderItems.map((item, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">
                              Article {index + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400"
                              title="Supprimer cet article"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Modèle - Pleine largeur */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Modèle *
                              </label>
                              
                              {/* Modèle sélectionné */}
                              {item.modeleId > 0 ? (
                                <div className="border border-green-300 rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                                  {(() => {
                                    const selectedModele = modeles.find(m => m.id === item.modeleId);
                                    return selectedModele ? (
                                      <div className="flex items-center space-x-3">
                                        {selectedModele.imageUrl && (
                                          <img 
                                            src={selectedModele.imageUrl} 
                                            alt={selectedModele.nom}
                                            className="w-16 h-16 object-cover rounded-md border"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900 dark:text-white">
                                            {selectedModele.nom}
                                          </h4>
                                          <p className="text-sm text-green-600 dark:text-green-400">
                                            Prix: {orderService.formatPrice(selectedModele.price)}
                                          </p>
                                          {selectedModele.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {selectedModele.description}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => updateOrderItem(index, 'modeleId', 0)}
                                          className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                                        >
                                          Changer
                                        </button>
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              ) : (
                                /* Sélecteur de modèle avec photos */
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Choisissez un modèle parmi la collection :
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 dark:border-gray-600">
                                    {modeles.map(modele => (
                                      <button
                                        key={modele.id}
                                        type="button"
                                        onClick={() => updateOrderItem(index, 'modeleId', modele.id)}
                                        className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                                      >
                                        {modele.imageUrl ? (
                                          <img 
                                            src={modele.imageUrl} 
                                            alt={modele.nom}
                                            className="w-20 h-20 object-cover rounded-md mb-2"
                                          />
                                        ) : (
                                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">Pas d'image</span>
                                          </div>
                                        )}
                                        <h5 className="text-xs font-medium text-gray-900 dark:text-white text-center line-clamp-2">
                                          {modele.nom}
                                        </h5>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                          {orderService.formatPrice(modele.price)}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Autres champs sur une ligne */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Type de tissu */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Type de tissu *
                                </label>
                                <select
                                  value={item.typeTissu}
                                  onChange={(e) => updateOrderItem(index, 'typeTissu', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                  <option value="">Choisir un tissu</option>
                                  {TISSU_OPTIONS.map(tissu => (
                                    <option key={tissu.value} value={tissu.value}>
                                      {tissu.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Couleur */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Couleur *
                                </label>
                                <select
                                  value={item.couleur}
                                  onChange={(e) => updateOrderItem(index, 'couleur', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                  <option value="">Choisir une couleur</option>
                                  {COULEUR_OPTIONS.map(couleur => (
                                    <option key={couleur.value} value={couleur.value}>
                                      {couleur.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Quantité */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Quantité *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={item.quantite}
                                  onChange={(e) => updateOrderItem(index, 'quantite', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Notes de l'article */}
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Notes (optionnel)
                            </label>
                            <input
                              type="text"
                              value={item.notes || ""}
                              onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                              placeholder="Notes spécifiques à cet article..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculs de prix */}
                {formData.orderItems.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                      Récapitulatif des prix
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total des articles:</span>
                        <span className="font-medium">{orderService.formatPrice(calculateTotal())}</span>
                      </div>

                      {/* Gestion de la réduction */}
                      <div className="flex items-center gap-3 py-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.hasReduction}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              hasReduction: e.target.checked,
                              reduction: e.target.checked ? prev.reduction : undefined
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Appliquer une réduction</span>
                        </label>
                      </div>

                      {formData.hasReduction && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Réduction:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={calculateTotal()}
                              step="0.01"
                              value={formData.reduction || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, reduction: parseFloat(e.target.value) || undefined }))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="0"
                            />
                            <span className="text-gray-600 dark:text-gray-300">CFA</span>
                          </div>
                        </div>
                      )}

                      {formData.hasReduction && formData.reduction && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Montant réduit:</span>
                          <span>-{orderService.formatPrice(formData.reduction)}</span>
                        </div>
                      )}

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-semibold text-green-600">
                          <span>Total final:</span>
                          <span>{orderService.formatPrice(calculateFinalTotal())}</span>
                        </div>
                      </div>
                    </div>

                    {formErrors.reduction && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {formErrors.reduction}
                      </p>
                    )}
                  </div>
                )}

                {/* Erreur générale */}
                {formErrors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
                    {formErrors.general}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t dark:border-gray-700">
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
                  disabled={submitting || formData.orderItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "En cours..." : (editingOrder ? "Modifier" : "Créer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Détails de la commande #{viewingOrder.id}
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Fermer"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              {/* Informations générales */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                  Informations générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Client:</span>
                    <span className="ml-2 font-medium">{viewingOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Date de commande:</span>
                    <span className="ml-2 font-medium">{orderService.formatDate(viewingOrder.dateCommande)}</span>
                  </div>
                  {viewingOrder.dateRendezVous && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Date de rendez-vous:</span>
                      <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                        {orderService.formatDate(viewingOrder.dateRendezVous)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Statut:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${orderService.getStatusBadgeColor(viewingOrder.statut)}`}>
                      {viewingOrder.statut}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Créée le:</span>
                    <span className="ml-2 font-medium">{orderService.formatDateTime(viewingOrder.createdAt)}</span>
                  </div>
                </div>
                {viewingOrder.notes && (
                  <div className="mt-3">
                    <span className="text-gray-600 dark:text-gray-300 text-sm">Notes:</span>
                    <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {viewingOrder.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Articles */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                  Articles commandés ({viewingOrder.orderItems.length})
                </h4>
                <div className="space-y-3">
                  {viewingOrder.orderItems.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Tissu:</span>
                          <p className="font-medium">{item.typeTissu}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Couleur:</span>
                          <p className="font-medium">{item.couleur}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Quantité:</span>
                          <p className="font-medium">{item.quantite}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Prix unitaire:</span>
                          <span className="ml-1 font-medium">{orderService.formatPrice(item.prixUnitaire)}</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          Sous-total: {orderService.formatPrice(item.prixUnitaire * item.quantite)}
                        </div>
                      </div>
                      {item.notes && (
                        <div className="mt-2">
                          <span className="text-gray-600 dark:text-gray-300 text-xs">Notes:</span>
                          <p className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Récapitulatif financier */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                  Récapitulatif financier
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total des articles:</span>
                    <span className="font-medium">{orderService.formatPrice(viewingOrder.total)}</span>
                  </div>
                  {viewingOrder.reduction && viewingOrder.reduction > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Réduction appliquée:</span>
                      <span>-{orderService.formatPrice(viewingOrder.reduction)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold text-green-600">
                      <span>Total final:</span>
                      <span>{orderService.formatPrice(viewingOrder.totalFinal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  closeDetailsModal();
                  openEditModal({
                    id: viewingOrder.id,
                    customerId: viewingOrder.customerId,
                    customerName: viewingOrder.customerName,
                    dateCommande: viewingOrder.dateCommande,
                    total: viewingOrder.total,
                    reduction: viewingOrder.reduction,
                    totalFinal: viewingOrder.totalFinal,
                    statut: viewingOrder.statut,
                    nombreItems: viewingOrder.orderItems.length,
                    createdAt: viewingOrder.createdAt
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Modifier cette commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}