import { useState } from "react";

export default function Factures() {
  const [factures, setFactures] = useState([
    // Data fake bach l-design y-bân i7tirafi mn l-bdaya
    { id: 1, numero: "FAC-2026-001", client: "Anas Alami", montant_ht: "200", tva: 20, frais: "10", total: 250, statut: "payé" },
    { id: 2, numero: "FAC-2026-002", client: "Sara Merini", montant_ht: "500", tva: 20, frais: "0", total: 600, statut: "non_payé" }
  ]);

  const [form, setForm] = useState({
    numero: "",
    client: "",
    montant_ht: "",
    tva: 20,
    frais: "", // frais_deplacement kima f l-base de données
    statut: "non_payé"
  });

  const addFacture = () => {
    if (!form.numero || !form.client || !form.montant_ht) return;

    const total =
      Number(form.montant_ht) +
      (Number(form.montant_ht) * Number(form.tva)) / 100 +
      Number(form.frais || 0);

    setFactures([
      ...factures,
      { ...form, id: Date.now(), total: total.toFixed(2) }
    ]);

    setForm({
      numero: "",
      client: "",
      montant_ht: "",
      tva: 20,
      frais: "",
      statut: "non_payé"
    });
  };

  const markPaid = (id) => {
    setFactures(
      factures.map((f) =>
        f.id === id ? { ...f, statut: "payé" } : f
      )
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-file-invoice-dollar text-blue-600" />
          Gestion Financière & Facturation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Générez des factures fiables, gérez la TVA, les frais de déplacement et suivez les règlements.
        </p>
      </div>

      {/* FORMULAIRE (Style Clean & Organized) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-5xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plus text-blue-600" />
          Émettre une nouvelle facture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Numéro Facture */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">N° Facture</label>
            <input
              type="text"
              placeholder="Ex: FAC-2026-003"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
          </div>

          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</label>
            <input
              type="text"
              placeholder="Nom du client"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </div>

          {/* Montant HT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant HT (DH)</label>
            <input
              type="number"
              placeholder="Ex: 150"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.montant_ht}
              onChange={(e) => setForm({ ...form, montant_ht: e.target.value })}
            />
          </div>

          {/* Frais de déplacement */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frais Déplacement (DH)</label>
            <input
              type="number"
              placeholder="Ex: 20 (Optionnel)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.frais}
              onChange={(e) => setForm({ ...form, frais: e.target.value })}
            />
          </div>

        </div>

        {/* Bouton Créer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addFacture}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Créer et enregistrer la facture
          </button>
        </div>

      </div>

      {/* TABLEAU DES FACTURES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-600" />
            Liste des factures émises
          </h2>
        </div>

        {factures.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <i className="fa-solid fa-circle-exclamation mr-2" /> Aucune facture enregistrée pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">N° Facture</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Détails (HT + TVA + Frais)</th>
                  <th className="py-3.5 px-6">Total TTC</th>
                  <th className="py-3.5 px-6">Statut Règlement</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {factures.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-blue-900 tracking-wide">{f.numero}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{f.client}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {f.montant_ht} DH HT | TVA {f.tva}% | Frais: {f.frais || 0} DH
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900 text-base">{f.total} DH</td>
                    <td className="py-4 px-6">
                      <span className={`py-1 px-2.5 rounded-full text-xs font-bold ${
                        f.statut === "payé" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {f.statut === "payé" ? "Payée" : "Non payée"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {f.statut === "non_payé" ? (
                        <button
                          onClick={() => markPaid(f.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-2"
                        >
                          <i className="fa-solid fa-money-bill-trend-up" /> Encaisser
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Aucune action</span>
                      )}
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