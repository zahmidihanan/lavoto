import { useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([
    // Fake data bach l-design y-bân m9add mn l-bdaya
    { id: 1, name: "Karim Bennani", email: "karim@email.com", role: "admin" },
    { id: 2, name: "Youssef El Alami", email: "youssef@email.com", role: "employe" },
    { id: 3, name: "Amine Tazi", email: "amine@email.com", role: "client" }
  ]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "client"
  });

  const addUser = () => {
    if (!form.name || !form.email) return;

    setUsers([
      ...users,
      { ...form, id: Date.now() }
    ]);

    setForm({ name: "", email: "", role: "client" });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header - Zraq w Byad */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-users text-blue-600" />
          Utilisateurs & Autorisations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les comptes utilisateurs, affectez les rôles d'accès et contrôlez les privilèges du système.
        </p>
      </div>

      {/* FORMULAIRE (Style Clean & Organized) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user-plus text-blue-600" />
          Ajouter un nouvel utilisateur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Nom Complet */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom complet</label>
            <input
              type="text"
              placeholder="Ex: Ahmed Mansouri"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adresse Email</label>
            <input
              type="email"
              placeholder="Ex: ahmed@email.com"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Rôle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle système</label>
            <select
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-slate-50/50 text-slate-700 font-medium"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Administrateur</option>
              <option value="employe">Employé</option>
              <option value="client">Client</option>
            </select>
          </div>

        </div>

        {/* Bouton Ajouter */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={addUser}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10 active:scale-95 text-sm"
          >
            Créer le compte
          </button>
        </div>

      </div>

      {/* TABLEAU DES UTILISATEURS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-600" />
            Comptes enregistrés
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <i className="fa-solid fa-circle-exclamation mr-2" /> Aucun utilisateur dans la base de données.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-6">Utilisateur</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Niveau d'accès (Rôle)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.slice(0, 2)}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`py-1 px-2.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === "admin" 
                          ? "bg-purple-50 text-purple-700 border border-purple-200" 
                          : u.role === "employe"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {u.role === "admin" ? "Admin" : u.role === "employe" ? "Employé" : "Client"}
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