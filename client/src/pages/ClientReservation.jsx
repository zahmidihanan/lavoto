import { useState, useEffect } from "react";

const fallbackVehicules = [
  { id: 1, marque: "Dacia Sandero", immatriculation: "12345-أ-6", libelle: "Dacia Sandero (12345-أ-6)" },
  { id: 2, marque: "Golf 8", immatriculation: "67890-ب-7", libelle: "Golf 8 (67890-ب-7)" }
];

const fallbackServices = [
  { id: 1, nom: "Lavage Extérieur", prix_base: "40 DH", duree_estimee: "20 min" },
  { id: 2, nom: "Lavage Complet", prix_base: "80 DH", duree_estimee: "45 min" },
  { id: 3, nom: "Lavage Premium", prix_base: "250 DH", duree_estimee: "2h" }
];

const fallbackReservations = [
  { id: 101, vehicule: "Dacia Sandero", service: "Lavage Complet", date: "2026-06-05", heure: "10:00", statut: "Terminé", prix: "80 DH" },
  { id: 102, vehicule: "Golf 8", service: "Lavage Premium", date: "2026-06-08", heure: "14:00", statut: "Confirmé", prix: "250 DH" },
  { id: 103, vehicule: "Dacia Sandero", service: "Lavage Extérieur", date: "2026-06-12", heure: "11:00", statut: "En attente", prix: "40 DH" }
];

export default function ClientReservation() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    vehicule_id: "",
    service_id: "",
    date: "",
    heure: "",
    adresse: "",
    ville: "",
    gps: "",
    notes: ""
  });
  const [mesReservations, setMesReservations] = useState(fallbackReservations);
  const [vehicules, setVehicules] = useState(fallbackVehicules);
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedVehicule = vehicules.find((v) => String(v.id) === String(booking.vehicule_id));
  const selectedService = services.find((s) => String(s.id) === String(booking.service_id));

  const hours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setFetchError("");

      try {
        const [servicesRes, vehiculesRes, reservationsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/services?all=true", { credentials: 'include' }),
          fetch("http://127.0.0.1:8000/api/vehicules", { credentials: 'include' }),
          fetch("http://127.0.0.1:8000/api/reservations?per_page=10", { credentials: 'include' }),
        ]);

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services || fallbackServices);
        }

        if (vehiculesRes.ok) {
          const data = await vehiculesRes.json();
          setVehicules((data.vehicules || []).map(v => ({
            id: v.id,
            marque: v.marque || v.libelle_complet || `${v.modele || ""}`,
            immatriculation: v.immatriculation || "",
            libelle: v.libelle_complet || `${v.marque || ""} (${v.immatriculation || ""})`
          })));
        }

        if (reservationsRes.ok) {
          const data = await reservationsRes.json();
          setMesReservations((data.reservations || []).map((res) => ({
            id: res.id,
            vehicule: res.vehicule?.libelle_complet || res.vehicule?.immatriculation || "N/A",
            service: res.service?.nom || res.service || "N/A",
            date: res.date_debut?.split(' ')[0] || res.date_debut || "N/A",
            heure: res.date_debut?.split(' ')[1] || res.heure || "N/A",
            statut: res.statut || "En attente",
            prix: res.prix_estime || "0 DH"
          })));
        }
      } catch (error) {
        console.error(error);
        setFetchError("Impossible de charger les données du serveur. Vérifiez la connexion ou l'authentification.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleBook = async () => {
    setSubmitError("");
    setSuccessMessage("");

    const selectedService = services.find((s) => String(s.id) === String(booking.service_id));
    const selectedVehicule = vehicules.find((v) => String(v.id) === String(booking.vehicule_id));

    if (!selectedService || !selectedVehicule) {
      setSubmitError("Veuillez sélectionner un véhicule et un service valides.");
      return;
    }

    const newReservation = {
      id: Date.now(),
      vehicule: selectedVehicule.libelle,
      service: selectedService.nom,
      date: booking.date,
      heure: booking.heure,
      statut: "En attente",
      prix: selectedService.prix_base || "0 DH"
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/reservations", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service_id: booking.service_id,
          vehicule_id: booking.vehicule_id,
          date_debut: `${booking.date} ${booking.heure}`,
          adresse: booking.adresse,
          ville: booking.ville,
          gps: booking.gps,
          notes: booking.notes,
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setSubmitError(errData?.message || `Erreur API ${response.status}`);
        return;
      }

      const result = await response.json();
      const saved = result.reservation;
      if (saved) {
        setMesReservations([{ id: saved.id, vehicule: saved.vehicule?.libelle_complet || selectedVehicule.libelle, service: saved.service?.nom || selectedService.nom, date: saved.date_debut?.split(' ')[0] || booking.date, heure: saved.date_debut?.split(' ')[1] || booking.heure, statut: saved.statut || "En attente", prix: saved.prix_estime || selectedService.prix_base || "0 DH" }, ...mesReservations]);
      } else {
        setMesReservations([newReservation, ...mesReservations]);
      }

      setSuccessMessage("Réservation créée avec succès ! Votre demande est en cours de validation.");
      setStep(1);
      setBooking({ vehicule_id: "", service_id: "", date: "", heure: "", adresse: "", ville: "", gps: "", notes: "" });
    } catch (error) {
      console.error(error);
      setSubmitError("Impossible de contacter l'API de réservation.");
    }
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
          {fetchError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {fetchError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          {submitError && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              {submitError}
            </div>
          )}
          {loading && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Chargement des services et véhicules depuis l'API...
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionnez votre véhicule</label>
                <select 
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 font-medium text-slate-700"
                  value={booking.vehicule_id}
                  onChange={(e) => setBooking({...booking, vehicule_id: e.target.value})}
                >
                  <option value="">-- Choisir un véhicule --</option>
                  {vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.libelle}</option>
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
                        String(booking.service_id) === String(s.id) ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="service" 
                          className="w-4 h-4 text-blue-600 border-slate-300"
                          checked={String(booking.service_id) === String(s.id)}
                          onChange={() => setBooking({...booking, service_id: s.id})}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.nom}</p>
                          <p className="text-xs text-slate-400">Durée: {s.duree_estimee}</p>
                        </div>
                      </div>
                      <span className="text-base font-black text-blue-900">{s.prix_base}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                disabled={!booking.vehicule_id || !booking.service_id}
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
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date du rendez-vous</label>
                  <input 
                    type="date" 
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 text-slate-700 font-medium"
                    value={booking.date}
                    onChange={(e) => setBooking({...booking, date: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ville</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Casablanca"
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 text-slate-700 font-medium"
                    value={booking.ville}
                    onChange={(e) => setBooking({...booking, ville: e.target.value})}
                  />
                </div>
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

              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse</label>
                  <input 
                    type="text" 
                    placeholder="Rue, quartier, n°" 
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 text-slate-700 font-medium"
                    value={booking.adresse}
                    onChange={(e) => setBooking({...booking, adresse: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GPS / Point de repère (Optionnel)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 33.5731, -7.5898" 
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-slate-50/50 text-slate-700 font-medium"
                    value={booking.gps}
                    onChange={(e) => setBooking({...booking, gps: e.target.value})}
                  />
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
                  disabled={!booking.date || !booking.heure || !booking.adresse || !booking.ville}
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
                  <span className="font-bold text-slate-800">{selectedVehicule?.libelle || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400">Prestation:</span>
                  <span className="font-bold text-blue-900">{selectedService?.nom || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400">Adresse:</span>
                  <span className="font-bold text-slate-800">{booking.adresse || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400">Ville:</span>
                  <span className="font-bold text-slate-800">{booking.ville || "-"}</span>
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