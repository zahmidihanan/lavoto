export default function Sidebar({ setPage }) {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen p-5 flex flex-col gap-4 shadow-xl">
      <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-car-side" />
        Lavoto
      </h2>
      
      <button onClick={() => setPage("dashboard")} className="text-left py-2 px-3 rounded hover:bg-slate-800 transition flex items-center gap-2">
        <i className="fa-solid fa-chart-line w-4" />
        Dashboard
      </button>
      
      <button onClick={() => setPage("vehicules")} className="text-left py-2 px-3 rounded hover:bg-slate-800 transition flex items-center gap-2">
        <i className="fa-solid fa-car w-4" />
        Véhicules
      </button>
      
      <button onClick={() => setPage("services")} className="text-left py-2 px-3 rounded hover:bg-slate-800 transition flex items-center gap-2">
        <i className="fa-solid fa-wrench w-4" />
        Services
      </button>
      
      <button onClick={() => setPage("reservations")} className="text-left py-2 px-3 rounded hover:bg-slate-800 transition flex items-center gap-2">
        <i className="fa-solid fa-calendar-days w-4" />
        Reservations
      </button>
    </div>
  );
}