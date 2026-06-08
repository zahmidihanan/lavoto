import { useState } from "react";

export default function EmployeDashboard() {
  // Fake data dial les tâches li 3nd had l-employé précis
  const [taches, setTaches] = useState([
    { id: 201, vehicule: "Golf 8", service: "Lavage Premium", heure: "14:00", statut: "En attente" },
    { id: 202, vehicule: "Dacia Sandero", service: "Lavage Complet", heure: "16:00", statut: "En cours" },
    { id: 203, vehicule: "Renault Clio", service: "Lavage Extérieur", heure: "17:30", statut: "Terminé" }
  ]);

  const updateStatut = (id, nouveauStatut) => {
    setTaches(taches.map(t => t.id === id ? { ...t, statut: nouveauStatut } : t));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header Employé */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-briefcase text-blue-600" />
          Tableau de Bord - Employé
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivez vos tâches du jour, mettez à jour l'avancement des lavages et signalez les véhicules prêts.
        </p>
      </div>

      {/* LISTE DES TÂCHES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-blue-600" />
          Mes Lavages à Traiter Aujourd'hui
        </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {taches.map((t) => (
            <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition">
              
              {/* Infos véhicule */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-car" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">{t.vehicule}</h3>
                    <span className="text-xs text-slate-400 font-mono">#T-{t.id}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-semibold">{t.service}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <i className="fa-solid fa-clock" /> Heure prévue: <span className="text-slate-700 font-medium">{t.heure}</span>
                  </p>
                </div>
              </div>

              {/* Statut & Actions */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                {/* Badge Statut */}
                <span className={`py-1 px-2.5 rounded-full text-xs font-bold ${
                  t.statut === "Terminé" 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : t.statut === "En cours"
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>
                  {t.statut}
                </span>

                {/* Actions boutons dynamic */}
                <div className="flex gap-1.5">
                  {t.statut === "En attente" && (
                    <button 
                      onClick={() => updateStatut(t.id, "En cours")}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-2"
                    >
                      <i className="fa-solid fa-play" /> Commencer
                    </button>
                  )}
                  {t.statut === "En cours" && (
                    <button 
                      onClick={() => updateStatut(t.id, "Terminé")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-2"
                    >
                      <i className="fa-solid fa-check" /> Terminer
                    </button>
                  )}
                  {t.statut === "Terminé" && (
                    <span className="text-xs text-slate-400 italic">Prêt pour client</span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}