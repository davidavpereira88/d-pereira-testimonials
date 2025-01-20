import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Embed from "@/pages/Embed";
import { AdminRoute } from "@/components/auth/AdminRoute";

// Create a client
const queryClient = new QueryClient();

// Define the router with all routes
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Index />
      </AuthProvider>
    ),
  },
  {
    path: "/admin",
    element: (
      <AuthProvider>
        <AdminRoute>
          <Admin />
        </AdminRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthProvider>
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: "/embed",
    element: (
      <AuthProvider>
        <Embed />
      </AuthProvider>
    ),
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;