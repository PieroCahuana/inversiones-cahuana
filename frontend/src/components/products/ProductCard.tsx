import {
  Heart,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router";

import type { ProductSummary } from "../../types/product";

interface ProductCardProps {
  product: ProductSummary;
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number(value));
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/70">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="size-full object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.has_discount && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              Oferta
            </span>
          )}

          {product.condition === "refurbished" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              Reacondicionado
            </span>
          )}
        </div>

        <button
          type="button"
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-red-500"
          aria-label="Agregar a favoritos"
        >
          <Heart size={19} />
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          {product.brand}
        </p>

        <Link
          to={`/products/${product.slug}`}
          className="mt-2 line-clamp-2 block min-h-12 text-base font-bold text-slate-900 transition hover:text-blue-600"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">
          {product.short_description}
        </p>

        <div className="mt-5">
          {product.has_discount && product.discount_price && (
            <p className="text-sm text-slate-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}

          <p className="text-2xl font-black text-slate-950">
            {formatPrice(product.current_price)}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span
            className={`text-xs font-semibold ${
              product.is_in_stock
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {product.is_in_stock
              ? `${product.stock} disponibles`
              : "Sin stock"}
          </span>
        </div>

        <button
          type="button"
          disabled={!product.is_in_stock}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart size={18} />
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}