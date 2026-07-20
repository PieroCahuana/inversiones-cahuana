import { Outlet } from "react-router";

import { Header } from "../components/layout/Header";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Outlet />
    </div>
  );
}