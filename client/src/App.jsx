import { useState } from "react";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login"; // Import dial l-Login jdid
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Services from "./pages/Services";
import Factures from "./pages/Factures";
import Users from "./pages/Users";
import Avis from "./pages/Avis";
import Notifications from "./pages/Notifications";
import ClientReservation from "./pages/ClientReservation";
import EmployeDashboard from "./pages/EmployeDashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Wash m-connecti wla la
  const [role, setRole] = useState("admin"); // 'admin' | 'employe' | 'client'
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Fonction dial l-connexion ghir f l-front s-sa3a
  const handleLoginSubmit = (selectedRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    
    // Par défaut n-bdaw f l-dashboard dial l-rôle
    if (selectedRole === "admin") setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const renderPage = () => {
    if (role === "client") {
      return <ClientReservation />;
    }
    if (role === "employe") {
      return <EmployeDashboard />;
    }

    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "reservations": return <Reservations />;
      case "services": return <Services />;
      case "factures": return <Factures />;
      case "users": return <Users />;
      case "avis": return <Avis />;
      case "notifications": return <Notifications />;
      default: return <Dashboard />;
    }
  };

  // 1. Yla kân user ma m-connectich, n-le3o lih ghir l-Login page bo7dha
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSubmit} />;
  }

  // 2. Yla m-connecti, n-le3o lih l-App complete b l-Sidebar
  return (
    <MainLayout 
      currentRole={role} 
      setRole={setRole} 
      setCurrentPage={setCurrentPage} 
      currentPage={currentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MainLayout>
  );
}