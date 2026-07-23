import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";

import { getCart } from "../../api/cart";
import { useAuth } from "../../hooks/useAuth";
import { BrandLogo } from "../common/BrandLogo";
import { NotificationBell } from "../common/NotificationBell";
import { useStoreSettings } from "../../hooks/useStoreSettings";

const categories = [
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Computadoras", href: "/products?category=pcs" },
  { label: "All in One", href: "/products?category=all-in-one" },
  { label: "Monitores", href: "/products?category=monitores" },
];

const secondaryLinks = [
  { label: "Inicio", href: "/" },
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Computadoras", href: "/products?category=pcs" },
  { label: "Monitores", href: "/products?category=monitores" },
  { label: "Soporte técnico", href: "/#soporte" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: storeSettings } = useStoreSettings();
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 15_000,
  });
  const cartCount = cartQuery.data?.total_items ?? 0;

  async function handleLogout() {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
    navigate("/");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_4px_20px_rgba(13,38,76,0.08)]">
      <div className="bg-[#071d41] text-white">
        <div className="site-container flex h-8 items-center justify-center text-[11px] font-semibold sm:justify-between">
          <p>Envíos coordinados en Lima · Equipos revisados</p>
          <a href={`tel:+${storeSettings?.phone || "51954107191"}`} className="hidden items-center gap-2 text-white/80 hover:text-white sm:flex">
            <Headphones size={14} /> Atención: {storeSettings?.phone || "+51 954 107 191"}
          </a>
        </div>
      </div>

      <div className="site-container flex h-[88px] items-center gap-4 lg:gap-7">
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setCategoryOpen((current) => !current)}
            aria-expanded={categoryOpen}
            className="flex h-12 items-center gap-2.5 rounded-xl bg-[#1454d8] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(20,84,216,0.25)] transition hover:bg-[#0d45bd]"
          >
            <Menu size={20} /> Categorías <ChevronDown size={15} />
          </button>
          {categoryOpen && (
            <div className="absolute left-0 top-[58px] w-64 overflow-hidden rounded-2xl border border-[#dce4ef] bg-white p-2 shadow-[0_18px_50px_rgba(13,38,76,0.16)]">
              {categories.map((category) => (
                <Link key={category.href} to={category.href} onClick={() => setCategoryOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#26354a] hover:bg-[#eef4ff] hover:text-[#1454d8]">
                  {category.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/" className="shrink-0" onClick={() => setMenuOpen(false)}><BrandLogo /></Link>

        <form onSubmit={handleSearch} className="ml-auto hidden h-12 w-full max-w-2xl items-center overflow-hidden rounded-xl border-2 border-[#dce4ef] bg-white transition focus-within:border-[#1454d8] md:flex">
          <Search size={20} className="ml-4 shrink-0 text-[#8592a3]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" aria-label="Buscar productos" placeholder="Buscar productos, marcas y más..." className="h-full w-full px-3 text-sm font-medium outline-none placeholder:text-[#8a96a6]" />
          <button className="h-full bg-[#1454d8] px-6 text-sm font-black text-white hover:bg-[#0d45bd]">Buscar</button>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && <NotificationBell />}
          <div className="relative">
            {isAuthenticated ? (
              <button type="button" onClick={() => setAccountOpen((current) => !current)} aria-expanded={accountOpen} aria-label="Menú de mi cuenta" className="flex size-11 items-center justify-center rounded-full bg-[#edf3ff] font-black text-[#1454d8] transition hover:bg-[#dfeaff]">
                {user?.first_name ? user.first_name[0].toUpperCase() : <UserRound size={21} />}
              </button>
            ) : <Link to="/login" aria-label="Iniciar sesión" className="flex size-11 items-center justify-center rounded-full bg-[#f3f6fa] text-[#26354a] transition hover:bg-[#e6efff] hover:text-[#1454d8]"><UserRound size={21} /></Link>}
            {accountOpen && isAuthenticated && (
              <div className="absolute right-0 top-[54px] w-64 overflow-hidden rounded-2xl border border-[#dce4ef] bg-white p-2 shadow-[0_18px_50px_rgba(13,38,76,0.16)]">
                <div className="border-b border-[#e8edf3] px-3 py-3"><p className="truncate text-sm font-black text-[#183353]">{user?.full_name || "Mi cuenta"}</p><p className="mt-1 truncate text-xs text-[#7b8999]">{user?.email}</p></div>
                <Link to="/profile" onClick={() => setAccountOpen(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[#334862] hover:bg-[#edf3ff] hover:text-[#1454d8]"><UserRound size={17} /> Mi perfil</Link>
                <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[#334862] hover:bg-[#edf3ff] hover:text-[#1454d8]"><ShoppingCart size={17} /> Mis pedidos</Link>
                {user?.role === "admin" && <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[#1454d8] hover:bg-[#edf3ff]"><LayoutDashboard size={17} /> Panel administrativo</Link>}
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[#bd4937] hover:bg-red-50"><LogOut size={17} /> Cerrar sesión</button>
              </div>
            )}
          </div>
          <Link to="/cart" aria-label={`Carrito, ${cartCount} productos`} className="relative flex size-11 items-center justify-center rounded-full bg-[#f3f6fa] text-[#26354a] transition hover:bg-[#e6efff] hover:text-[#1454d8]">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#ff5a36] px-1.5 py-1 text-[9px] font-black leading-none text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
          <button type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((current) => !current)} className="flex size-11 items-center justify-center rounded-full text-[#26354a] lg:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className="hidden bg-[#1454d8] text-white lg:block">
        <div className="site-container flex h-12 items-center gap-1">
          {secondaryLinks.map((link) => (
            <Link key={link.label} to={link.href} className="flex h-full items-center px-5 text-sm font-bold text-white/90 transition hover:bg-white/10 hover:text-white">{link.label}</Link>
          ))}
          <Link to="/products" className="ml-auto rounded-lg bg-[#ffd500] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-[#071d41] transition hover:bg-[#ffe354]">Ver ofertas</Link>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-[#e2e8f0] bg-white lg:hidden">
          <div className="site-container py-4">
            <form onSubmit={handleSearch} className="flex h-12 items-center overflow-hidden rounded-xl border-2 border-[#dce4ef] md:hidden">
              <Search size={18} className="ml-4 text-[#8592a3]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar productos..." className="h-full w-full px-3 text-sm outline-none" />
            </form>
            <div className="mt-3 grid gap-1">
              {secondaryLinks.map((link) => <Link key={link.label} to={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-bold text-[#26354a] hover:bg-[#eef4ff] hover:text-[#1454d8]">{link.label}</Link>)}
              <Link to="/products" onClick={() => setMenuOpen(false)} className="mt-2 rounded-xl bg-[#1454d8] px-4 py-3.5 text-center font-black text-white">Ver catálogo completo</Link>
              {isAuthenticated ? (
                <><Link to="/profile" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-bold text-[#26354a] hover:bg-[#eef4ff]">Mi perfil</Link><Link to="/orders" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-bold text-[#26354a] hover:bg-[#eef4ff]">Mis pedidos</Link>{user?.role === "admin" && <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-bold text-[#1454d8] hover:bg-[#eef4ff]">Panel administrativo</Link>}<button type="button" onClick={handleLogout} className="rounded-xl px-4 py-3 text-left font-bold text-[#bd4937] hover:bg-red-50">Cerrar sesión</button></>
              ) : <div className="mt-2 grid grid-cols-2 gap-2"><Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-[#d8e1ec] px-4 py-3 text-center text-sm font-black text-[#334862]">Ingresar</Link><Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-[#071d41] px-4 py-3 text-center text-sm font-black text-white">Registrarse</Link></div>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
