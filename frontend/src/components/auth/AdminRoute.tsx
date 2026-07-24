import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../../hooks/useAuth";

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]"><LoaderCircle className="animate-spin text-[#249fd3]" size={38} /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
