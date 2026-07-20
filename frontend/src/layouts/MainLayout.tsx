import { Outlet } from "react-router";

import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { WhatsAppButton } from "../components/common/WhatsAppButton";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#102a4e]">
      <Header />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
