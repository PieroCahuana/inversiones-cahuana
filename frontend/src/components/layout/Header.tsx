import {
  ChevronDown,
  Headphones,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";

import { BrandLogo } from "../common/BrandLogo";

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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
          <a href="tel:+51954107191" className="hidden items-center gap-2 text-white/80 hover:text-white sm:flex">
            <Headphones size={14} /> Atención: +51 954 107 191
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
          <Link to="/login" aria-label="Mi cuenta" className="flex size-11 items-center justify-center rounded-full bg-[#f3f6fa] text-[#26354a] transition hover:bg-[#e6efff] hover:text-[#1454d8]"><UserRound size={21} /></Link>
          <Link to="/cart" aria-label="Carrito" className="relative flex size-11 items-center justify-center rounded-full bg-[#f3f6fa] text-[#26354a] transition hover:bg-[#e6efff] hover:text-[#1454d8]">
            <ShoppingCart size={22} />
            <span className="absolute -right-0.5 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ff5a36] text-[9px] font-black text-white">0</span>
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
