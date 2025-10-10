import { useState, useEffect, useCallback } from 'react';
import { 
  TransactionsGroupeesParSemaine,
  TransactionParSemaine,
  TotauxSemaine
} from '../../types/transaction';
import transactionService from '../../services/transactionService';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ChevronDownIcon, ChevronUpIcon } from "../../icons";

export default function CaisseParSemaine() {
  const [transactionsGroupees, setTransactionsGroupees] = useState<TransactionsGroupeesParSemaine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semainesOuvertes, setSemainesOuvertes] = useState<Set<string>>(new Set());
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');

  // Initialiser les dates par défaut (30 derniers jours)
  useEffect(() => {
    const aujourdhui = new Date();
    const il30Jours = new Date(aujourdhui.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setDateFin(aujourdhui.toISOString().split('T')[0]);
    setDateDebut(il30Jours.toISOString().split('T')[0]);
  }, []);

  // Charger les données
  const loadData = useCallback(async () => {
    if (!dateDebut || !dateFin) return;

    try {
      setLoading(true);
      setError(null);

      const data = await transactionService.getTransactionsParSemaine(dateDebut, dateFin);
      setTransactionsGroupees(data);
      
      // Ouvrir automatiquement la semaine la plus récente
      if (data.semaines.length > 0) {
        const semaineLaPlusRecente = data.semaines[data.semaines.length - 1];
        const cleeSemaine = `${semaineLaPlusRecente.annee}-${semaineLaPlusRecente.numeroSemaine}`;
        setSemainesOuvertes(new Set([cleeSemaine]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin]);

  // Charger les données quand les dates sont définies pour la première fois
  useEffect(() => {
    if (dateDebut && dateFin && !transactionsGroupees) {
      loadData();
    }
  }, [dateDebut, dateFin, transactionsGroupees, loadData]);

  // Fonction pour le bouton actualiser
  const handleActualiser = () => {
    loadData();
  };

  const toggleSemaine = (annee: number, numeroSemaine: number) => {
    const cleeSemaine = `${annee}-${numeroSemaine}`;
    const nouvellesSemainesOuvertes = new Set(semainesOuvertes);
    
    if (nouvellesSemainesOuvertes.has(cleeSemaine)) {
      nouvellesSemainesOuvertes.delete(cleeSemaine);
    } else {
      nouvellesSemainesOuvertes.add(cleeSemaine);
    }
    
    setSemainesOuvertes(nouvellesSemainesOuvertes);
  };

  const formatDatePeriode = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const renderTotauxSemaine = (totaux: TotauxSemaine) => (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-3">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Transactions</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totaux.nombreTransactions}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Entrées</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {totaux.nombreEntrees}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Sorties</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {totaux.nombreSorties}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Total Entrées</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            +{transactionService.formatMontant(totaux.totalEntrees)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Total Sorties</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            -{transactionService.formatMontant(totaux.totalSorties)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Solde Net</p>
          <p className={`text-lg font-bold ${
            totaux.soldeNet >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {totaux.soldeNet >= 0 ? '+' : ''}{transactionService.formatMontant(totaux.soldeNet)}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={handleActualiser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Caisse par Semaine" description="Gestion des transactions groupées par semaine" />
      <PageBreadcrumb 
        pageTitle="Caisse par Semaine"
      />

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg">
        {/* Filtres de dates */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="self-end">
              <button
                onClick={handleActualiser}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Totaux généraux */}
        {transactionsGroupees && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Résumé de la période ({formatDatePeriode(transactionsGroupees.totauxGeneraux.periodeDebut)} - {formatDatePeriode(transactionsGroupees.totauxGeneraux.periodeFin)})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <p className="text-blue-600 dark:text-blue-400 font-medium">Semaines</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {transactionsGroupees.totauxGeneraux.nombreSemaines}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactionsGroupees.totauxGeneraux.nombreTransactionsTotal}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">Entrées Totales</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  +{transactionService.formatMontant(transactionsGroupees.totauxGeneraux.totalEntreesGenerales)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">Sorties Totales</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                  -{transactionService.formatMontant(transactionsGroupees.totauxGeneraux.totalSortiesGenerales)}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${
                transactionsGroupees.totauxGeneraux.soldeNetGeneral >= 0 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`font-medium ${
                  transactionsGroupees.totauxGeneraux.soldeNetGeneral >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Solde Général
                </p>
                <p className={`text-2xl font-bold ${
                  transactionsGroupees.totauxGeneraux.soldeNetGeneral >= 0 
                    ? 'text-green-900 dark:text-green-300' 
                    : 'text-red-900 dark:text-red-300'
                }`}>
                  {transactionsGroupees.totauxGeneraux.soldeNetGeneral >= 0 ? '+' : ''}
                  {transactionService.formatMontant(transactionsGroupees.totauxGeneraux.soldeNetGeneral)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des semaines */}
        <div className="p-6">
          {transactionsGroupees && transactionsGroupees.semaines.length > 0 ? (
            <div className="space-y-4">
              {transactionsGroupees.semaines.slice().reverse().map((semaine: TransactionParSemaine) => {
                const cleeSemaine = `${semaine.annee}-${semaine.numeroSemaine}`;
                const estOuverte = semainesOuvertes.has(cleeSemaine);

                return (
                  <div key={cleeSemaine} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* En-tête de semaine */}
                    <button
                      onClick={() => toggleSemaine(semaine.annee, semaine.numeroSemaine)}
                      className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Semaine {semaine.numeroSemaine} - {semaine.annee}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDatePeriode(semaine.debutSemaine)} au {formatDatePeriode(semaine.finSemaine)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {semaine.transactions.length} transaction{semaine.transactions.length > 1 ? 's' : ''}
                          </span>
                          <span className={`font-medium ${
                            semaine.totaux.soldeNet >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {semaine.totaux.soldeNet >= 0 ? '+' : ''}
                            {transactionService.formatMontant(semaine.totaux.soldeNet)}
                          </span>
                        </div>
                      </div>
                      {estOuverte ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Contenu de la semaine */}
                    {estOuverte && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {/* Totaux de la semaine */}
                        {renderTotauxSemaine(semaine.totaux)}

                        {/* Liste des transactions */}
                        {semaine.transactions.length > 0 ? (
                          <div className="mt-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Catégorie
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Mode
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Montant
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                  {semaine.transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {transactionService.formatDateShort(transaction.dateTransaction)}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {transaction.description}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {transaction.categorie ? (
                                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {transaction.categorie}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {transaction.modePaiement ? (
                                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                            {transaction.modePaiement}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                                          transaction.montantAvecSigne >= 0 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                        }`}>
                                          {transaction.montantAvecSigne >= 0 ? '+' : '-'}
                                          {transactionService.formatMontant(Math.abs(transaction.montantAvecSigne))}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Aucune transaction cette semaine
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Aucune transaction trouvée pour cette période
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}