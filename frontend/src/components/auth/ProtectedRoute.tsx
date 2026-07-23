import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle size={34} className="animate-spin text-[#1454d8]" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
