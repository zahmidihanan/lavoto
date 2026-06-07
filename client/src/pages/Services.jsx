import { useState } from "react";

export default function Services() {
  const [services, setServices] = useState([
    // Data fake bach l-design y-bân wa7ed mn l-bdaya
    { id: 1, nom_service: "Lavage Externe", description: "Nettoyage haute pression de la carrosserie et des jantes.", prix_base: "50", statut: "Actif" },
    { id: 2, nom_service: "Lavage Complet", description: "Lavage externe + aspiration complète de l'habitacle et traitement plastiques.", prix_base: "120", statut: "Actif" },
    { id: 3, nom_service: "Polissage & Cire", description: "Polissage professionnel pour éliminer les micro-rayures et application de cire protectrice.", prix_base: "450", statut: "Inactif" }
  ]);

  const [form, setForm] = useState({
    nom_service: "",
    description: "",
    prix_base: "",
    statut: "Actif" // Statut par défaut
  });

  const addService = () => {
    if (!form.nom_service || !form.prix_base) return;

    setServices([
      ...services,
      { ...form, id: Date.now() }
    ]);

    setForm({
      nom_service: "",
      description: "",
      prix_base: "",
      statut: "Actif"
    });
  };

  const toggleStatut = (id) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, statut: s.statut === "Actif" ? "Inactif" : "Actif" } : s
    ));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          🛠️ Catalogue des Services
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurez les types de lavage, les descriptions et les tarifs de base pour le système commercial Lavoto
        </p>
      </div>

      {/* FORMULAIRE D'AJOUT (Style Clean w Pro) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          ➕ Ajouter un nouveau service
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          
          {/* Nom du Service */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom du Service</label>
            <input
              type="text"
              placeholder="Ex: Lavage Complet, Polissage..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.nom_service}
              onChange={(e) => setForm({ ...form, nom_service: e.target.value })}
            />
          </div>

          {/* Prix de Base */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix de Base (DH)</label>
            <input
              type="number"
              placeholder="Ex: 120"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.prix_base}
              onChange={(e) => setForm({ ...form, prix_base: e.target.value })}
            />
          </div>

          {/* Statut Optionnel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut Initial</label>
            <select
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700"
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
            >
              <option value="Actif">Actif (Visible)</option>
              <option value="Inactif">Inactif (Masqué)</option>
            </select>
          </div>

          {/* Description - Prendre toute la largeur sur grand écran */}
          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description du service</label>
            <input
              type="text"
              placeholder="Décrivez brièvement les prestations incluses dans ce service..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

        </div>

        {/* Bouton d'ajout */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addService}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Ajouter le service
          </button>
        </div>

      </div>

      {/* TABLEAU DES SERVICES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">📋 Liste des prestations disponibles</h2>
        </div>

        {services.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ❌ Aucun service configuré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Tarif de Base</th>
                  <th className="py-3.5 px-6">Statut</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <span>🧼</span> {s.nom_service}
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs md:max-w-md break-words">{s.description || "Aucune description"}</td>
                    <td className="py-4 px-6 font-black text-blue-700 text-base">{s.prix_base} DH</td>
                    <td className="py-4 px-6">
                      <span className={`py-1 px-2.5 rounded-full text-xs font-bold ${
                        s.statut === "Actif" ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {s.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleStatut(s.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                          s.statut === "Actif" 
                            ? "text-amber-600 hover:bg-amber-50" 
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {s.statut === "Actif" ? "Désactiver" : "Activer"}
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