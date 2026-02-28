import { AuthProvider, useAuth } from "./auth/authContext";
import { useState } from "react";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/TopBar";

type Page = "map" | "channels" | "profile";

function AppRoutes({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  return (
    <>
      {page === "map" && <MapPage onProfile={() => setPage("profile")} />}
      {page === "channels" && <Channels onBack={() => setPage("map")} />}
      {page === "profile" && <Dashboard onBack={() => setPage("map")} />}

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

  return (
    <AuthProvider>
  <TopBar onProfileClick={() => setPage("profile")} />
  <AppRoutes page={page} setPage={setPage} />
    </AuthProvider>
  );
}
