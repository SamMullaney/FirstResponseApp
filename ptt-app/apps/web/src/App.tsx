import { AuthProvider, useAuth } from "./auth/authContext";
import { useState } from "react";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import IncidentChannel from "./pages/IncidentChannel";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/TopBar";

type Page = "map" | "channels" | "profile" | "incident";

function AppRoutes({
  page,
  setPage,
  selectedIncidentId,
  onIncidentClick,
}: {
  page: Page;
  setPage: (p: Page) => void;
  selectedIncidentId: string | null;
  onIncidentClick: (id: string) => void;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  return (
    <>
      {page === "map" && <MapPage onIncidentClick={onIncidentClick} />}
      {page === "channels" && <Channels onBack={() => setPage("map")} />}
      {page === "profile" && <Dashboard onBack={() => setPage("map")} />}
      {page === "incident" && selectedIncidentId && (
        <IncidentChannel
          incidentId={selectedIncidentId}
          onBack={() => setPage("map")}
        />
      )}

      <BottomBar
        onLeft={() => setPage("map")}
        onPrimary={() => alert("Push-to-talk pressed")}
        onRight={() => setPage("channels")}
      />
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("map");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

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
        selectedIncidentId={selectedIncidentId}
        onIncidentClick={handleIncidentClick}
      />
    </AuthProvider>
  );
}
