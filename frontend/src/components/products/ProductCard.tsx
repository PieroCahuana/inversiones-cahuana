import {
  ArrowUpRight,
  Heart,
  ShoppingBag,
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
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function getConditionLabel(condition: ProductSummary["condition"]) {
  const labels = {
    new: "Nuevo",
    refurbished: "Reacondicionado",
    used: "Seminuevo",
  };

  return labels[condition];
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="premium-card-shadow group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#e1e7ef] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#b9cae4] hover:shadow-[0_24px_55px_rgba(17,55,107,0.13)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f6fa]">
        <Link
          to={`/products/${product.slug}`}
          className="block size-full"
        >
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              loading="lazy"
              className="size-full object-contain p-7 transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-zinc-400">
              <ShoppingBag size={28} />
              <span className="mt-3 text-xs font-medium">
                Imagen próximamente
              </span>
            </div>
          )}
        </Link>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.has_discount && (
            <span className="rounded-full bg-[#ff5a36] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
              Oferta
            </span>
          )}

          <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 backdrop-blur">
            {getConditionLabel(product.condition)}
          </span>
        </div>

        <button
          type="button"
          aria-label="Agregar a favoritos"
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-[#e1e7ef] bg-white/90 text-[#6c798a] shadow-sm backdrop-blur transition hover:bg-[#1454d8] hover:text-white"
        >
          <Heart size={17} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1454d8]">
            {product.brand}
          </p>

          <span
            className={[
              "rounded-full px-2.5 py-1 text-[10px] font-bold",
              product.is_in_stock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600",
            ].join(" ")}
          >
            {product.is_in_stock
              ? `${product.stock} disponibles`
              : "Agotado"}
          </span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-3 flex items-start justify-between gap-3"
        >
          <h3 className="line-clamp-2 text-lg font-black leading-6 tracking-tight text-[#102a4e] transition group-hover:text-[#1454d8]">
            {product.name}
          </h3>

          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-zinc-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1454d8]"
          />
        </Link>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">
          {product.short_description}
        </p>

        <div className="mt-auto pt-5">
          {product.has_discount && (
            <p className="text-xs text-zinc-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-2xl font-black tracking-tight text-[#102a4e]">
              {formatPrice(product.current_price)}
            </p>

            <span className="text-[10px] font-medium text-zinc-400">
              IGV incluido
            </span>
          </div>

          <button
            type="button"
            disabled={!product.is_in_stock}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1454d8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d45bd] disabled:bg-zinc-300"
          >
            <ShoppingBag size={17} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
