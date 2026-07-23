import { BadgePercent, Boxes, ChartNoAxesCombined, ChevronLeft, LogOut, Menu, PackageSearch, Settings, ShoppingBag, Tags, UsersRound, Warehouse, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";

import { BrandLogo } from "../components/common/BrandLogo";
import { NotificationBell } from "../components/common/NotificationBell";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/admin", label: "Resumen", icon: ChartNoAxesCombined, end: true },
  { to: "/admin/products", label: "Productos", icon: PackageSearch },
  { to: "/admin/inventory", label: "Inventario", icon: Warehouse },
  { to: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/customers", label: "Clientes", icon: UsersRound },
  { to: "/admin/brands", label: "Marcas", icon: Tags },
  { to: "/admin/categories", label: "Categorías", icon: Boxes },
  { to: "/admin/commerce", label: "Marketing", icon: BadgePercent },
  { to: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#081f43] text-white">
      <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
        <BrandLogo lightText />
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/70 lg:hidden"><X size={22} /></button>
      </div>
      <div className="px-5 pb-3 pt-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7fa8e8]">Administración</p></div>
      <nav className="grid gap-1 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${isActive ? "bg-[#1454d8] text-white shadow-[0_10px_24px_rgba(20,84,216,0.28)]" : "text-white/68 hover:bg-white/8 hover:text-white"}`}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between rounded-xl px-4 py-2 text-sm font-bold text-white/70"><span>Notificaciones</span><NotificationBell dark /></div>
        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/8 hover:text-white"><ChevronLeft size={18} /> Volver a la tienda</Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#ff9b8b] hover:bg-white/8"><LogOut size={18} /> Cerrar sesión</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#102a4e]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && <><button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-[#06152d]/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /><aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">{sidebar}</aside></>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-[#dfe6ef] bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <button type="button" onClick={() => setOpen(true)} className="mr-3 rounded-xl border border-[#dce4ef] p-2.5 lg:hidden"><Menu size={22} /></button>
          <div><p className="text-xs font-bold text-[#728096]">Panel de control</p><p className="mt-0.5 text-sm font-black text-[#153454]">Inversiones Cahuana</p></div>
          <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-black">{user?.full_name || "Administrador"}</p><p className="text-xs text-[#728096]">{user?.email}</p></div><div className="flex size-10 items-center justify-center rounded-xl bg-[#e8f0ff] text-sm font-black text-[#1454d8]">{user?.first_name?.[0]?.toUpperCase() || "A"}</div></div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-4 sm:p-7 lg:p-9"><Outlet /></main>
      </div>
    </div>
  );
}
