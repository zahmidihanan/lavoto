import { useState } from "react";

export default function Avis() {
  const [avis, setAvis] = useState([
    // Fake data bach l-design y-bân m9add mn l-bdaya
    { id: 1, client: "Yassine El Fassi", note: 5, commentaire: "Service impeccable et rapide ! Ma voiture est comme neuve." },
    { id: 2, client: "Nadia Chraibi", note: 4, commentaire: "Très bon lavage, le personnel est poli. Je recommande." }
  ]);

  const [form, setForm] = useState({
    client: "",
    note: 5,
    commentaire: ""
  });

  const addAvis = () => {
    if (!form.client || !form.commentaire) return;

    setAvis([
      ...avis,
      { ...form, id: Date.now(), note: Number(form.note) }
    ]);

    setForm({ client: "", note: 5, commentaire: "" });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-star text-blue-600" />
          Avis & Retours Clients
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Consultez les évaluations des clients, gérez la satisfaction et suivez la qualité des prestations.
        </p>
      </div>

      {/* FORMULAIRE (Style Clean & Organized) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plus text-blue-600" />
          Ajouter un avis manuellement
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Nom du Client */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</label>
            <input
              type="text"
              placeholder="Nom du client"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </div>

          {/* Note sur 5 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Note (Étoiles)</label>
            <select
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700 font-medium"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            >
              <option value={5}>5 étoiles</option>
              <option value={4}>4 étoiles</option>
              <option value={3}>3 étoiles</option>
              <option value={2}>2 étoiles</option>
              <option value={1}>1 étoile</option>
            </select>
          </div>

          {/* Commentaire */}
          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commentaire</label>
            <textarea
              rows="2"
              placeholder="Qu'a pensé le client de la prestation ?"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 resize-none"
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
            />
          </div>

        </div>

        {/* Bouton Ajouter */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addAvis}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Publier l'avis
          </button>
        </div>

      </div>

      {/* SECTION DES CARTES D'AVIS */}
      <div className="max-w-6xl">
<h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-600" />
            Retours publiés ({avis.length})
          </h2>
        
        {avis.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
            <i className="fa-solid fa-circle-exclamation mr-2" /> Aucun avis enregistré pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avis.map((a) => (
              <div 
                key={a.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Client & Stars */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {a.client.slice(0, 2)}
                      </div>
                      {a.client}
                    </span>
                    <span className="text-amber-500 text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 font-bold flex items-center gap-1">
                      {Array.from({ length: a.note }).map((_, index) => (
                        <i key={`filled-${index}`} className="fa-solid fa-star" />
                      ))}
                      {Array.from({ length: 5 - a.note }).map((_, index) => (
                        <i key={`empty-${index}`} className="fa-regular fa-star" />
                      ))}
                    </span>
                  </div>
                  
                  {/* Text Commentaire */}
                  <p className="text-slate-600 text-sm mt-3 font-normal leading-relaxed italic">
                    "{a.commentaire}"
                  </p>
                </div>

                {/* ID / Date stamp view */}
                <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-2 text-right">
                  ID: #{a.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}