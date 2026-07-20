import {
  Heart,
  Menu,
  Monitor,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs text-white">
        Envíos en Lima · Equipos revisados · Atención personalizada
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Monitor size={24} />
          </div>

          <div>
            <p className="text-lg font-black leading-none text-slate-950">
              Inversiones
            </p>
            <p className="mt-1 text-sm font-bold tracking-[0.18em] text-blue-600">
              CAHUANA
            </p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 lg:flex">
          <Search
            size={19}
            className="text-slate-400"
          />

          <input
            type="search"
            placeholder="Busca laptops, PCs, All in One o monitores..."
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
          />

          <button className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
            Buscar
          </button>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-xl p-3 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Favoritos"
          >
            <Heart size={21} />
          </button>

          <Link
            to="/login"
            className="rounded-xl p-3 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Mi cuenta"
          >
            <UserRound size={21} />
          </Link>

          <Link
            to="/cart"
            className="relative rounded-xl p-3 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Carrito"
          >
            <ShoppingCart size={22} />

            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              0
            </span>
          </Link>

          <button
            type="button"
            className="rounded-xl p-3 text-slate-600 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={23} />
          </button>
        </nav>
      </div>

      <div className="border-t border-slate-100">
        <nav className="mx-auto hidden max-w-7xl items-center gap-8 px-8 py-3 text-sm font-semibold text-slate-600 lg:flex">
          <Link
            to="/products"
            className="hover:text-blue-600"
          >
            Todos los productos
          </Link>
          <Link
            to="/products?category=laptops"
            className="hover:text-blue-600"
          >
            Laptops
          </Link>
          <Link
            to="/products?category=pcs-de-escritorio"
            className="hover:text-blue-600"
          >
            PCs
          </Link>
          <Link
            to="/products?category=all-in-one"
            className="hover:text-blue-600"
          >
            All in One
          </Link>
          <Link
            to="/products?category=monitores"
            className="hover:text-blue-600"
          >
            Monitores
          </Link>

          <Link
            to="/offers"
            className="ml-auto font-bold text-red-500 hover:text-red-600"
          >
            Ofertas
          </Link>
        </nav>
      </div>
    </header>
  );
}