import { useState } from "react";

export default function Reservations() {
  const [reservations, setReservations] = useState([
    // Data fake bach n-choufi l-design s7i7 kifax k-yban
    { id: 1, client: "Anas Alami", vehicule: "12345-أ-6", service: "Lavage Complet", date_debut: "2026-06-07", date_fin: "2026-06-07", prix_estime: "250", statut: "En cours" },
    { id: 2, client: "Sara Merini", vehicule: "67890-ب-44", vehicule_id: 2, service: "Polissage", date_debut: "2026-06-08", date_fin: "2026-06-09", prix_estime: "600", statut: "En attente" }
  ]);

  const [form, setForm] = useState({
    client: "",
    vehicule: "",
    service: "",
    date_debut: "",
    date_fin: "",
    prix_estime: ""
  });

  const addReservation = () => {
    if (!form.client || !form.vehicule) return;

    setReservations([
      ...reservations,
      { ...form, id: Date.now(), statut: "En attente" }
    ]);

    setForm({
      client: "",
      vehicule: "",
      service: "",
      date_debut: "",
      date_fin: "",
      prix_estime: ""
    });
  };

  // Fonction bash n-zow9o l-Badge dial l-Statut 3la hssab l-lon
  const getStatusBadge = (status) => {
    if (status === "En cours") return "bg-blue-50 text-blue-700 border border-blue-200";
    if (status === "Terminé") return "bg-green-50 text-green-700 border border-green-200";
    return "bg-amber-50 text-amber-700 border border-amber-200"; // En attente
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          📅 Planification des Réservations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérer le planning des lavages, estimer les prix et suivre les statuts opérationnels
        </p>
      </div>

      {/* FORMULAIRE D'AJOUT (Style Clean w Pro) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-5xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          ➕ Créer une nouvelle réservation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom du Client</label>
            <input
              type="text"
              placeholder="Ex: Anas Alami"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </div>

          {/* Véhicule */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule (Immatriculation)</label>
            <input
              type="text"
              placeholder="Ex: 12345-أ-6"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.vehicule}
              onChange={(e) => setForm({ ...form, vehicule: e.target.value })}
            />
          </div>

          {/* Service */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service demandé</label>
            <input
              type="text"
              placeholder="Ex: Lavage complet, Polissage..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            />
          </div>

          {/* Date Début */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Début</label>
            <input
              type="date"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
            />
          </div>

          {/* Date Fin */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Fin</label>
            <input
              type="date"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700"
              value={form.date_fin}
              onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
            />
          </div>

          {/* Prix Estimé */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix Estimé (DH)</label>
            <input
              type="number"
              placeholder="Ex: 250"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.prix_estime}
              onChange={(e) => setForm({ ...form, prix_estime: e.target.value })}
            />
          </div>

        </div>

        {/* Bouton d'ajout */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={addReservation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Confirmer la réservation
          </button>
        </div>

      </div>

      {/* TABLEAU DES RÉSERVATIONS (Style Pro) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">📋 Planning des réservations</h2>
        </div>

        {reservations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ❌ Aucune réservation enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Véhicule</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Période (Début ➔ Fin)</th>
                  <th className="py-3.5 px-6">Prix Estimé</th>
                  <th className="py-3.5 px-6">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800">{r.client}</td>
                    <td className="py-4 px-6 font-bold text-blue-900 tracking-wide">{r.vehicule}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{r.service}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">{r.date_debut}</span>
                      <span className="mx-1 text-slate-400">➔</span>
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">{r.date_fin}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-blue-700">{r.prix_estime} DH</td>
                    <td className="py-4 px-6">
                      <span className={`py-1 px-3 rounded-full text-xs font-bold ${getStatusBadge(r.statut)}`}>
                        {r.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}