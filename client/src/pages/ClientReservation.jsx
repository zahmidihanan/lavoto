import { useState } from "react";

export default function ClientReservation() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    vehicule: "",
    service: "",
    date: "",
    heure: "",
    notes: ""
  });

  // Fake data dial l-historique bach l-client y-chouf les réservations dyalo
  const [mesReservations, setMesReservations] = useState([
    { id: 101, vehicule: "Dacia Sandero", service: "Lavage Complet", date: "2026-06-05", heure: "10:00", statut: "Terminé", prix: "80 DH" },
    { id: 102, vehicule: "Golf 8", service: "Lavage Premium", date: "2026-06-08", heure: "14:00", statut: "Confirmé", prix: "250 DH" },
    { id: 103, vehicule: "Dacia Sandero", service: "Lavage Extérieur", date: "2026-06-12", heure: "11:00", statut: "En attente", prix: "40 DH" }
  ]);

  const myVehicules = [
    { id: 1, marque: "Dacia Sandero", immat: "12345-أ-6" },
    { id: 2, marque: "Golf 8", immat: "67890-ب-7" }
  ];

  const services = [
    { id: "lav-ext", name: "Lavage Extérieur", price: "40 DH", time: "20 min" },
    { id: "lav-int-ext", name: "Lavage Complet", price: "80 DH", time: "45 min" },
    { id: "lav-premium", name: "Lavage Premium", price: "250 DH", time: "2h" }
  ];

  const hours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  const handleBook = () => {
    // Ajouter la nouvelle réservation au début de l'historique (Simulation)
    const newReservation = {
      id: Date.now(),
      vehicule: booking.vehicule.split(" (")[0], // Prendre juste la marque
      service: booking.service,
      date: booking.date,
      heure: booking.heure,
      statut: "En attente",
      prix: services.find(s => s.name === booking.service)?.price || "0 DH"
    };

    setMesReservations([newReservation, ...mesReservations]);
    alert(`🎉 Réservation réussie ! Votre demande est en cours de validation.`);
    
    setStep(1);
    setBooking({ vehicule: "", service: "", date: "", heure: "", notes: "" });
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen w-full font-sans flex flex-col items-center gap-8">
      
      {/* CARD 1: FORMULAIRE DE RESERVATION STEP-BY-STEP */}
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white text-center">
          <span className="text-xs font-bold uppercase tracking-widest bg-blue-700/50 px-3 py-1 rounded-full text-blue-100">
            Espace Client - Lavoto
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Réserver un Lavage</h1>
          <p className="text-sm text-blue-200/80 mt-1">Prenez rendez-vous en moins de 2 minutes</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-around items-center bg-slate-50 border-b border-slate-100 p-4 text-xs font-bold text-slate-400">
          <span className={`pb-1 px-2 ${step === 1 ? "text-blue-600 border-b-2 border-blue-600" : ""}`}>1. Véhicule & Service</span>
          <span className={`pb-1 px-2 ${step === 2 ? "text-blue-600 border-b-2 border-blue-600" : ""}`}>2. Date & Heure</span>
          <span className={`pb-1 px-2 ${step === 3 ? "text-blue-600 border-b-2 border-blue-600" : ""}`}>3. Confirmation</span>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionnez votre véhicule</label>
                <select 
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 font-medium text-slate-700"
                  value={booking.vehicule}
                  onChange={(e) => setBooking({...booking, vehicule: e.target.value})}
                >
                  <option value="">-- Choisir un véhicule --</option>
                  {myVehicules.map(v => (
                    <option key={v.id} value={`${v.marque} (${v.immat})`}>{v.marque} - {v.immat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Choisissez une formule</label>
                <div className="flex flex-col gap-3">
                  {services.map(s => (
                    <label 
                      key={s.id} 
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        booking.service === s.name ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="service" 
                          className="w-4 h-4 text-blue-600 border-slate-300"
                          checked={booking.service === s.name}
                          onChange={() => setBooking({...booking, service: s.name})}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">Durée: {s.time}</p>
                        </div>
                      </div>
                      <span className="text-base font-black text-blue-900">{s.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                disabled={!booking.vehicule || !booking.service}
                onClick={() => setStep(2)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-600/10"
              >
                Continuer
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date du rendez-vous</label>
                <input 
                  type="date" 
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 text-slate-700 font-medium"
                  value={booking.date}
                  onChange={(e) => setBooking({...booking, date: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Créneau horaire</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {hours.map(h => (
                    <button
                      key={h}
                      type="button"
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                        booking.heure === h ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => setBooking({...booking, heure: h})}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demandes spéciales (Optionnel)</label>
                <textarea 
                  rows="2"
                  placeholder="Ex: Nettoyage des sièges..."
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 resize-none"
                  value={booking.notes}
                  onChange={(e) => setBooking({...booking, notes: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => setStep(1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">Retour</button>
                <button 
                  disabled={!booking.date || !booking.heure}
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
                >
                  Vérifier l'ordre
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-600" /> Récapitulatif
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400">Véhicule:</span>
                  <span className="font-bold text-slate-800">{booking.vehicule}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400">Prestation:</span>
                  <span className="font-bold text-blue-900">{booking.service}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Rendez-vous:</span>
                  <span className="font-bold text-slate-800">Le {booking.date} à {booking.heure}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button onClick={() => setStep(2)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">Modifier</button>
                <button onClick={handleBook} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">Confirmer le RDV</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CARD 2: HISTORIQUE DES RESERVATIONS DU CLIENT */}
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-blue-600" />
          Mes Réservations & Suivi
        </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {mesReservations.map((res) => (
            <div key={res.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">{res.service}</span>
                  <span className="text-xs text-slate-400 font-medium">• {res.vehicule}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days" /> {res.date} à <span className="font-semibold text-slate-700">{res.heure}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-800">{res.prix}</span>
                <span className={`py-1 px-2.5 rounded-full text-xs font-bold ${
                  res.statut === "Terminé" 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : res.statut === "Confirmé"
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>
                  {res.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}