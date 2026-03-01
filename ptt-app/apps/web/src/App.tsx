import { AuthProvider, useAuth } from "./auth/authContext";
import { useState } from "react";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import IncidentChannel from "./pages/IncidentChannel";
import ReportIncident from "./pages/ReportIncident";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/TopBar";
import { DEMO_INCIDENTS } from "./data/incidents";
import type { Incident } from "./data/incidents";

type Page = "map" | "channels" | "profile" | "incident" | "report";

function AppRoutes({
  page,
  setPage,
  incidents,
  addIncident,
  removeIncident,
  selectedIncidentId,
  onIncidentClick,
}: {
  page: Page;
  setPage: (p: Page) => void;
  incidents: Incident[];
  addIncident: (inc: Incident) => void;
  removeIncident: (id: string) => void;
  selectedIncidentId: string | null;
  onIncidentClick: (id: string) => void;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  return (
    <>
      {page === "map" && (
        <MapPage incidents={incidents} onIncidentClick={onIncidentClick} />
      )}
      {page === "channels" && <Channels onBack={() => setPage("map")} />}
      {page === "profile" && <Dashboard onBack={() => setPage("map")} />}
      {page === "incident" && selectedIncidentId && (
        <IncidentChannel
          incidents={incidents}
          incidentId={selectedIncidentId}
          onBack={() => setPage("map")}
          onResolve={() => {
            removeIncident(selectedIncidentId);
            setPage("map");
          }}
        />
      )}
      {page === "report" && (
        <ReportIncident
          onSubmit={addIncident}
          onBack={() => setPage("map")}
        />
      )}

      <BottomBar
        onLeft={() => setPage("map")}
        onPrimary={() => setPage("report")}
        onRight={() => setPage("channels")}
      />
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("map");
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  function addIncident(incident: Incident) {
    setIncidents((prev) => [...prev, incident]);
  }

  function removeIncident(id: string) {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  }

  function handleIncidentClick(id: string) {
    setSelectedIncidentId(id);
    setPage("incident");
  }

  return (
    <AuthProvider>
      <TopBar onProfileClick={() => setPage("profile")} />
      <AppRoutes
        page={page}
        setPage={setPage}
        incidents={incidents}
        addIncident={addIncident}
        removeIncident={removeIncident}
        selectedIncidentId={selectedIncidentId}
        onIncidentClick={handleIncidentClick}
      />
    </AuthProvider>
  );
}
