import { RefreshCw } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext.js";
import { Header } from "./components/Header.js";
import { TabsNav } from "./components/TabsNav.js";
import { IncidentsTab } from "./components/tabs/IncidentsTab.js";
import { ComponentsTab } from "./components/tabs/ComponentsTab.js";
import { AlertsTab } from "./components/tabs/AlertsTab.js";
import { PreviewTab } from "./components/tabs/PreviewTab.js";
import { Modals } from "./components/modals/Modals.js";
import { LandingPage } from "./components/LandingPage.js";
import { AuthModal } from "./components/auth/AuthModal.js";

function MainDashboard() {
  const { loading, isAuthenticated, activeTab } = useApp();

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <RefreshCw className="animate-spin" size={24} color="#3D87FF" />
        <span style={{ fontWeight: 500 }}>Connecting to Noroshi Monolith...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <AuthModal />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="ambient-glow" />
      <Header />
      <main style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "28px 20px", flex: 1 }}>
        <TabsNav />
        {activeTab === "incidents" && <IncidentsTab />}
        {activeTab === "components" && <ComponentsTab />}
        {activeTab === "alerts" && <AlertsTab />}
        {activeTab === "preview" && <PreviewTab />}
      </main>
      <Modals />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainDashboard />
    </AppProvider>
  );
}
