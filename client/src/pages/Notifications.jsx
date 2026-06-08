import { useState } from "react";

export default function Notifications() {
  const [notifs, setNotifs] = useState([
    // Fake data bach l-design y-bân m9add wa3er mn l-bdaya
    { id: 1, message: "Votre réservation pour le lavage complet a été confirmée.", canal: "app", lu: true },
    { id: 2, message: "Rappel: Votre véhicule 12345-أ-6 est prêt à être récupéré.", canal: "sms", lu: false },
    { id: 3, message: "Nouvelle facture FAC-2026-003 disponible sur votre espace.", canal: "email", lu: false }
  ]);

  const [form, setForm] = useState({
    message: "",
    canal: "app"
  });

  const addNotif = () => {
    if (!form.message) return;

    setNotifs([
      ...notifs,
      { ...form, id: Date.now(), lu: false }
    ]);

    setForm({ message: "", canal: "app" });
  };

  const markAsLu = (id) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  // Fonction pour styliser le canal de diffusion
  const getCanalBadge = (canal) => {
    if (canal === "sms") return "bg-purple-50 text-purple-700 border border-purple-200";
    if (canal === "email") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-blue-50 text-blue-700 border border-blue-200"; // app
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-bell text-blue-600" />
          Centre de Notifications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Diffusez des alertes aux clients, gerez les canaux d'envoi (App, SMS, Email) et suivez l'état de lecture.
        </p>
      </div>

      {/* FORMULAIRE (Style Clean & Organized) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-blue-600" />
          Envoyer une nouvelle alerte
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Message Text */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenu du message</label>
            <input
              type="text"
              placeholder="Ex: Votre véhicule est prêt..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {/* Canal de diffusion */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canal d'envoi</label>
            <select
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700 font-medium"
              value={form.canal}
              onChange={(e) => setForm({ ...form, canal: e.target.value })}
            >
              <option value="app">Notification App</option>
              <option value="email">Email Marketing</option>
              <option value="sms">Message SMS</option>
            </select>
          </div>

        </div>

        {/* Bouton Envoyer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addNotif}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Diffuser l'alerte
          </button>
        </div>

      </div>

      {/* LISTE DES NOTIFICATIONS */}
      <div className="max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-blue-600" />
          Historique des envois ({notifs.length})
        </h2>
        
        {notifs.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-400 text-sm rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-exclamation" /> Aucune notification envoyée.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifs.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white ${
                  n.lu ? "border-slate-200 opacity-75" : "border-blue-200 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon Status Indicator */}
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.lu ? "bg-slate-300" : "bg-blue-600"}`} />
                  
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm text-slate-700 font-normal ${!n.lu ? "font-semibold text-slate-900" : ""}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`py-0.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider ${getCanalBadge(n.canal)}`}>
                        {n.canal}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: #{n.id}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 self-end sm:self-center">
                  {!n.lu ? (
                    <button
                      onClick={() => markAsLu(n.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-2"
                    >
                      <i className="fa-solid fa-check" />
                      Marquer lu
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex items-center gap-1">
                      <i className="fa-solid fa-check-circle" />
                      Lu
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}