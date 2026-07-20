import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // N-sifto l-role li khtar l-user direct l-App.jsx
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-center text-white">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl mx-auto shadow-md mb-3">
            L
          </div>
          <h1 className="text-2xl font-black tracking-tight">Espace Connexion</h1>
          <p className="text-sm text-blue-200/80 mt-1">Bienvenue sur l'application Lavoto Car Wash</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <label className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Tester le rôle f l-Frontend
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {["admin", "employe", "client"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition capitalize ${
                    role === r ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse Email</label>
            <input
              type="email"
              placeholder="votremail@exemple.com"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-slate-50/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe</label>
              <a href="#forgot" className="text-xs font-semibold text-blue-600 hover:underline">Oublié ?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-slate-50/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-600/10 mt-2"
          >
            Se connecter
          </button>

        </form>
      </div>
    </div>
  );
}