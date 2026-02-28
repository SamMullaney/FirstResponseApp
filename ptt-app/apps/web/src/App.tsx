import { AuthProvider, useAuth } from "./auth/authContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
