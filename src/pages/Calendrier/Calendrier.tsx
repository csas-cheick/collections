import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import orderService from "../../services/orderService";
import { OrderSummary } from "../../types";
import Button from "../../components/ui/button/Button";

interface CalendarEvent extends EventInput {
  extendedProps: {
    order: OrderSummary;
    type: 'appointment';
  };
}

const Calendrier: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Charger les rendez-vous depuis l'API
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await orderService.getOrdersWithAppointments();
      
      if ('success' in response && !response.success) {
        setError(response.message || "Erreur lors du chargement des rendez-vous");
        return;
      }

      const orders = response as OrderSummary[];
      
      // Convertir les commandes en événements calendrier
      const calendarEvents: CalendarEvent[] = orders
        .filter(order => order.dateRendezVous)
        .map(order => ({
          id: `order-${order.id}`,
          title: `RDV - ${order.customerName}`,
          start: order.dateRendezVous!,
          backgroundColor: getEventColor(order.statut),
          borderColor: getEventColor(order.statut),
          textColor: '#ffffff',
          extendedProps: {
            order: order,
            type: 'appointment'
          }
        }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
      setError("Erreur de réseau lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, []);

  // Définir la couleur selon le statut de la commande
  const getEventColor = (statut: string): string => {
    switch (statut) {
      case 'En cours':
        return '#3b82f6'; // Bleu
      case 'Terminé':
        return '#10b981'; // Vert
      case 'Livré':
        return '#8b5cf6'; // Violet
      case 'Annulé':
        return '#ef4444'; // Rouge
      default:
        return '#6b7280'; // Gris
    }
  };

  // Gérer le clic sur un événement
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start || event.startStr,
      extendedProps: event.extendedProps as CalendarEvent['extendedProps']
    };
    
    setSelectedEvent(calendarEvent);
    openModal();
  };

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  if (loading) {
    return (
      <div className="p-4">
        <PageMeta title="Calendrier des Rendez-vous" description="Gérez les rendez-vous de récupération des commandes" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des rendez-vous...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PageMeta title="Calendrier des Rendez-vous" description="Gérez les rendez-vous de récupération des commandes" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendrier des Rendez-vous
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les rendez-vous de récupération des commandes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setViewMode('calendar')}
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              size="sm"
            >
              Vue Calendrier
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
            >
              Vue Liste
            </Button>
            <Button onClick={loadAppointments} variant="outline" size="sm">
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total RDV</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aujourd'hui</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {events.filter(e => new Date(e.start as string).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cette semaine</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {events.filter(e => {
              const eventDate = new Date(e.start as string);
              const weekFromNow = new Date();
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              return eventDate >= new Date() && eventDate <= weekFromNow;
            }).length}
          </p>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={false}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            locale="fr"
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Prochains rendez-vous
            </h3>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun rendez-vous programmé
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events
                  .sort((a, b) => new Date(a.start as string).getTime() - new Date(b.start as string).getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event);
                        openModal();
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full bg-blue-500"
                        ></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {event.extendedProps.order.customerName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Commande #{event.extendedProps.order.id} • {event.extendedProps.order.statut}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {orderService.formatDate(event.start as string)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {orderService.formatPrice(event.extendedProps.order.totalFinal)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
      >
        {selectedEvent && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Détails du Rendez-vous</h3>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedEvent.extendedProps.order.customerName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Commande #{selectedEvent.extendedProps.order.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date du RDV
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {orderService.formatDate(selectedEvent.start as string)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statut
                  </label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${orderService.getStatusBadgeColor(selectedEvent.extendedProps.order.statut)}`}>
                    {selectedEvent.extendedProps.order.statut}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre d'articles
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedEvent.extendedProps.order.nombreItems} article{selectedEvent.extendedProps.order.nombreItems > 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total
                  </label>
                  <p className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                    {orderService.formatPrice(selectedEvent.extendedProps.order.totalFinal)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de commande
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {orderService.formatDate(selectedEvent.extendedProps.order.dateCommande)}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={closeModal} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendrier;