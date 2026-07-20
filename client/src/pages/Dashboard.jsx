import { useState, useEffect } from "react";

export default function DashboardHome() {
  // States dynamic mesh m3l9in b l-base de données s7i7a
  const [vehiculesCount, setVehiculesCount] = useState(0);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [facturesCount, setFacturesCount] = useState(0);
  const [paiementsTotal, setPaiementsTotal] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    
    const fakeVehicules = [
      { id_vehicule: 1, kilometrage: 120000, id_utilisateur: 1 },
      { id_vehicule: 2, kilometrage: 85000, id_utilisateur: 2 }
    ];

    const fakeReservations = [
      { id_reservation: 1, date_debut: "2026-06-07", prix_estime: 250, statut: "En cours" },
      { id_reservation: 2, date_debut: "2026-06-08", prix_estime: 150, statut: "Terminé" }
    ];

    const fakeFactures = [
      { id_facture: 1, taux_tva: 20, frais_deplacement: 0, total: 250 }
    ];

    setVehiculesCount(fakeVehicules.length);
    setReservationsCount(fakeReservations.length);
    setFacturesCount(fakeFactures.length);
    setPaiementsTotal(400); // 400 DH masalan
    setUsersCount(5); // 3adad l-utilisateurs
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-chart-line text-blue-600" />
          Lavoto Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivi opérationnel et financier en temps réel
        </p>
      </div>

      {/* Grid dial les Cards (Thème Zraq pur & Byad clean) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Card 1: Véhicules */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Véhicules</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{vehiculesCount}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-2xl font-semibold">
            <i className="fa-solid fa-car" />
          </div>
        </div>

        {/* Card 2: Réservations */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Réservations</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{reservationsCount}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-2xl font-semibold">
            <i className="fa-solid fa-calendar-days" />
          </div>
        </div>

        {/* Card 3: Factures & Chiffre d'affaires */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Paiements Reçus</p>
            <h3 className="text-3xl font-black text-blue-700 mt-1">{paiementsTotal} DH</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-2xl font-semibold">
            <i className="fa-solid fa-credit-card" />
          </div>
        </div>

        {/* Card 4: Utilisateurs */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Utilisateurs</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{usersCount}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-2xl font-semibold">
            <i className="fa-solid fa-user" />
          </div>
        </div>

      </div>

      {/* Section jdida dial l-Moraqaba (Suivi des Statuts) kima 3ndek f l-wti9a */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-clock" />
          Historique des Statuts & Activités
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Date Changement</th>
                <th className="py-3 px-4">Commentaire</th>
                <th className="py-3 px-4">Statut Paiement</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">2026-06-07</td>
                <td className="py-3 px-4">Lavage complet effectué avec succès</td>
                <td className="py-3 px-4">
                  <span className="bg-green-50 text-green-700 py-1 px-2.5 rounded-full text-xs font-bold">Payé</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">2026-06-06</td>
                <td className="py-3 px-4">En attente de la validation du client</td>
                <td className="py-3 px-4">
                  <span className="bg-amber-50 text-amber-700 py-1 px-2.5 rounded-full text-xs font-bold">Partiel</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}