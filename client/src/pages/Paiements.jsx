import { useState } from "react";

export default function Paiements() {
  const [paiements, setPaiements] = useState([
    // Fake data bach l-design y-bân wa3er mn l-bdaya
    { id: 1, facture: "FAC-2026-001", montant: "150", methode: "Cash", statut: "validé" },
    { id: 2, facture: "FAC-2026-001", montant: "100", methode: "Card", statut: "validé" }, // Exemple de paiement partiel
    { id: 3, facture: "FAC-2026-002", montant: "300", methode: "Online", statut: "en_attente" }
  ]);

  const [form, setForm] = useState({
    facture: "",
    montant: "",
    methode: "Cash"
  });

  const addPaiement = () => {
    if (!form.facture || !form.montant) return;

    setPaiements([
      ...paiements,
      { ...form, id: Date.now(), statut: "validé" }
    ]);

    setForm({
      facture: "",
      montant: "",
      methode: "Cash"
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          💳 Suivi des Paiements
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enregistrer les transactions, suivre les paiements partiels et valider les encaissements par facture.
        </p>
      </div>

      {/* FORMULAIRE (Style Clean & Organized) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          ➕ Enregistrer un encaissement
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Facture ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Réf. Facture</label>
            <input
              type="text"
              placeholder="Ex: FAC-2026-001"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.facture}
              onChange={(e) => setForm({ ...form, facture: e.target.value })}
            />
          </div>

          {/* Montant */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant versé (DH)</label>
            <input
              type="number"
              placeholder="Ex: 150"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
            />
          </div>

          {/* Méthode de paiement */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mode de règlement</label>
            <select
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700 font-medium"
              value={form.methode}
              onChange={(e) => setForm({ ...form, methode: e.target.value })}
            >
              <option value="Cash">💵 Cash</option>
              <option value="Card">💳 Carte Bancaire</option>
              <option value="Online">🌐 En ligne (App/Web)</option>
            </select>
          </div>

        </div>

        {/* Bouton d'ajout */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addPaiement}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Valider la transaction
          </button>
        </div>

      </div>

      {/* TABLEAU DES TRANSACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">📋 Historique des flux de caisse</h2>
        </div>

        {paiements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ❌ Aucun flux enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">ID Transaction</th>
                  <th className="py-3.5 px-6">Réf. Facture</th>
                  <th className="py-3.5 px-6">Méthode</th>
                  <th className="py-3.5 px-6">Montant Encaissé</th>
                  <th className="py-3.5 px-6">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {paiements.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">#{p.id}</td>
                    <td className="py-4 px-6 font-bold text-blue-900 tracking-wide">{p.facture}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-medium">
                        {p.methode}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-600 text-base">+{p.montant} DH</td>
                    <td className="py-4 px-6">
                      <span className={`py-1 px-2.5 rounded-full text-xs font-bold ${
                        p.statut === "validé" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {p.statut === "validé" ? "Validé" : "En attente"}
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