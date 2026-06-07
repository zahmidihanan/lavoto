import { useState } from "react";

export default function MainLayout({ children, currentRole = "admin", setCurrentPage, currentPage, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuAdmin = [
    { name: "📈 Dashboard", id: "dashboard" },
    { name: "📅 Réservations", id: "reservations" },
    { name: "🚗 Véhicules & Services", id: "services" },
    { name: "🧾 Factures & Caisses", id: "factures" },
    { name: "👥 Utilisateurs", id: "users" },
    { name: "⭐ Avis Clients", id: "avis" },
    { name: "🔔 Notifications", id: "notifications" },
  ];

  const menuClient = [
    { name: "✨ Réserver un lavage", id: "client-booking" }
  ];

  const menuEmploye = [
    { name: "💼 Mes tâches de lavage", id: "employe-tasks" }
  ];

  const getMenu = () => {
    if (currentRole === "admin") return menuAdmin;
    if (currentRole === "employe") return menuEmploye;
    return menuClient;
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans w-full text-slate-800">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-blue-950 text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-blue-900 flex flex-col justify-between`}>
        
        <div>
          {/* LOGO */}
          <div className="p-6 border-b border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg">L</div>
              <div>
                <span className="text-lg font-black tracking-tight block">Lavoto</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block -mt-1">Management</span>
              </div>
            </div>
            <button className="md:hidden text-blue-300 text-xl" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* MENU */}
          <nav className="p-4 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-blue-400/70 tracking-widest px-3 mb-2 block">
              Espace {currentRole}
            </span>
            {getMenu().map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (currentRole === "admin") setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  currentPage === item.id && currentRole === "admin"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                    : "text-blue-200/80 hover:bg-blue-900/50 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* USER INFOS & REAL LOGOUT BUTTON */}
        <div className="p-4 border-t border-blue-900 bg-blue-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold uppercase border border-blue-600">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate w-28">
              <p className="text-xs font-bold leading-none text-white">Yassine El..</p>
              <span className="text-[10px] text-blue-400 font-semibold capitalize mt-0.5 block">{currentRole}</span>
            </div>
          </div>
          
          {/* Hada huwa l-bouton li ghadi y-red l-user l-page login b khosousiya */}
          <button 
            onClick={onLogout}
            className="text-blue-300 hover:text-rose-400 p-2 hover:bg-blue-900/40 rounded-xl transition text-base" 
            title="Se déconnecter"
          >
            🚪
          </button>
        </div>

      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="md:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-10">
          <span className="font-black text-sm text-blue-950">Lavoto</span>
          <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 bg-slate-100 rounded-xl">☰</button>
        </header>

        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>

    </div>
  );
}