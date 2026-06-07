import { useState } from "react";

export default function Vehicules() {
  const [vehicules, setVehicules] = useState([
    // Derthalik fiha chi data mtal ghir bach t-choufi l-design s7i7 kifax k-yban
    { id: 1, immatriculation: "12345-أ-6", kilometrage: "120000", commentaire: "Carrosserie propre" },
    { id: 2, immatriculation: "67890-ب-44", kilometrage: "85000", commentaire: "Rayure sur la portière droite" }
  ]);

  const [form, setForm] = useState({
    immatriculation: "",
    kilometrage: "",
    commentaire: "" // Zdna l-commentaire kima 3ndek f l-base de données
  });

  const addVehicule = () => {
    if (!form.immatriculation) return;

    setVehicules([
      ...vehicules,
      { ...form, id: Date.now() }
    ]);

    setForm({ immatriculation: "", kilometrage: "", commentaire: "" });
  };

  const deleteVehicule = (id) => {
    setVehicules(vehicules.filter(v => v.id !== id));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          🚘 Gestion des Véhicules
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ajouter, modifier et suivre le kilométrage et l'état des véhicules clients
        </p>
      </div>

      {/* SECTION FORMULAIRE (Form b Thème Zraq w Byad Clean) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          ➕ Ajouter un nouveau véhicule
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Input 1: Immatriculation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Immatriculation</label>
            <input
              type="text"
              placeholder="Ex: 12345-أ-6"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.immatriculation}
              onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
            />
          </div>

          {/* Input 2: Kilométrage */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kilométrage (km)</label>
            <input
              type="number"
              placeholder="Ex: 85000"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.kilometrage}
              onChange={(e) => setForm({ ...form, kilometrage: e.target.value })}
            />
          </div>

          {/* Input 3: Commentaire */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commentaire / État</label>
            <input
              type="text"
              placeholder="Ex: Carrosserie propre..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
            />
          </div>

        </div>

        {/* Bouton d'ajout - Zraq pur */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addVehicule}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm flex items-center gap-2"
          >
            <span>Ajouter au système</span>
          </button>
        </div>

      </div>

      {/* SECTION TABLEAU DES VÉHICULES (I7tirafi) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">📋 Liste des véhicules enregistrés</h2>
        </div>

        {vehicules.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ❌ Aucun véhicule enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">Immatriculation</th>
                  <th className="py-3.5 px-6">Kilométrage</th>
                  <th className="py-3.5 px-6">Commentaire / État</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {vehicules.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-blue-900 tracking-wide">{v.immatriculation}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{v.kilometrage ? `${Number(v.kilometrage).toLocaleString()} km` : "—"}</td>
                    <td className="py-4 px-6 text-slate-500 italic max-w-xs truncate">{v.commentaire || "Aucun commentaire"}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => deleteVehicule(v.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition font-medium text-xs"
                      >
                        Supprimer
                      </button>
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