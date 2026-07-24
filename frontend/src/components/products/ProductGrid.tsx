import { PackageSearch, RefreshCw } from "lucide-react";

import type { ProductSummary } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products?: ProductSummary[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  onClear: () => void;
}

export function ProductGrid({ products, isLoading, isFetching, isError, onRetry, onClear }: ProductGridProps) {
  if (isLoading) {
    return <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[480px] animate-pulse rounded-[20px] bg-[#eaf0f6]" />)}</div>;
  }

  if (isError) {
    return (
      <div className="rounded-[20px] border border-[#f0d5d0] bg-[#fff7f5] px-6 py-14 text-center">
        <RefreshCw size={28} className="mx-auto text-[#cf654f]" />
        <h2 className="mt-4 text-xl font-black text-[#7c382c]">No pudimos cargar el catálogo</h2>
        <p className="mt-2 text-sm text-[#9d6157]">Comprueba que el servidor Django esté funcionando e inténtalo nuevamente.</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white hover:bg-[#167fac]">Reintentar</button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#c8d3e0] bg-[#f8fafc] px-6 py-14 text-center">
        <PackageSearch size={34} className="mx-auto text-[#8a99aa]" />
        <h2 className="mt-4 text-xl font-black text-[#334862]">No encontramos productos</h2>
        <p className="mt-2 text-sm text-[#718094]">Prueba con otra búsqueda o elimina algunos filtros.</p>
        <button type="button" onClick={onClear} className="mt-5 text-sm font-black text-[#249fd3] hover:underline">Limpiar todos los filtros</button>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-55" : "opacity-100"}`} aria-busy={isFetching}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
