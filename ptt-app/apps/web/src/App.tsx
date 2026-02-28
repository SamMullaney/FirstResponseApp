import { AuthProvider, useAuth } from "./auth/authContext";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import BottomBar from "./components/BottomBar";

type Page = "dashboard" | "channels" | "profile";

function AppRoutes({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  return (
    <>
      {page === "dashboard" && <Dashboard />}
      {page === "channels" && <Channels onBack={() => setPage("dashboard")} />}
  {page === "profile" && <Dashboard hideBottomSpacer onBack={() => setPage("dashboard")} />}

      {page !== "profile" && (
        <BottomBar
          onLeft={() => setPage("profile")}
          onPrimary={() => alert("Push-to-talk pressed")}
          onRight={() => setPage("channels")}
        />
      )}
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <AuthProvider>
      <AppRoutes page={page} setPage={setPage} />
    </AuthProvider>
  );
}
