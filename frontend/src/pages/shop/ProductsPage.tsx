import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { getBrands } from "../../api/brands";
import { getCategories } from "../../api/categories";
import { getProducts } from "../../api/products";
import { ProductFilters } from "../../components/products/ProductFilters";
import { ProductGrid } from "../../components/products/ProductGrid";
import { ProductPagination } from "../../components/products/ProductPagination";
import { ProductSearch } from "../../components/products/ProductSearch";
import { ProductSort } from "../../components/products/ProductSort";
import { useProductFilters } from "../../hooks/useProductFilters";

export function ProductsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { filters, setFilter, clearFilters, activeFilterCount } = useProductFilters();

  const productsQuery = useQuery({
    queryKey: ["products", "catalog", filters],
    queryFn: () => getProducts(filters),
    placeholderData: (previousData) => previousData,
  });
  const brandsQuery = useQuery({ queryKey: ["brands"], queryFn: getBrands, staleTime: 5 * 60_000 });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: 5 * 60_000 });

  const currentPage = filters.page ?? 1;
  const pageSize = filters.page_size ?? 12;

  return (
    <main className="bg-[#f7f9fc]">
      <section className="border-b border-[#dfe7f0] bg-white py-10 sm:py-12">
        <div className="site-container">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1454d8]">Catálogo de productos</p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.045em] text-[#071d41] sm:text-5xl">Encuentra tu próximo equipo</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[#6c798a]">Compara opciones, filtra por tus preferencias y elige con la asesoría de especialistas.</p>
            </div>
            {productsQuery.data && <p className="text-sm font-bold text-[#6c798a]"><strong className="text-[#1454d8]">{productsQuery.data.count}</strong> productos encontrados</p>}
          </div>
        </div>
      </section>

      <section className="site-container py-8 sm:py-10">
        <div className="flex flex-col gap-4 rounded-[20px] border border-[#e1e7ef] bg-white p-4 shadow-[0_12px_35px_rgba(13,38,76,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <ProductSearch value={filters.search} onChange={(value) => setFilter("search", value)} />
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setMobileFiltersOpen(true)} className="flex h-11 items-center gap-2 rounded-xl border border-[#d8e1ec] bg-white px-4 text-sm font-black text-[#334862] lg:hidden">
              <SlidersHorizontal size={17} /> Filtros {activeFilterCount > 0 && <span className="rounded-full bg-[#1454d8] px-2 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
            </button>
            <ProductSort value={filters.ordering} onChange={(value) => setFilter("ordering", value)} />
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <div className="sticky top-[190px] hidden lg:block">
            <ProductFilters filters={filters} brands={brandsQuery.data ?? []} categories={categoriesQuery.data ?? []} activeCount={activeFilterCount} onChange={setFilter} onClear={clearFilters} />
          </div>

          <div>
            <ProductGrid products={productsQuery.data?.results} isLoading={productsQuery.isPending} isFetching={productsQuery.isFetching} isError={productsQuery.isError} onRetry={() => productsQuery.refetch()} onClear={clearFilters} />
            {productsQuery.data && (
              <ProductPagination currentPage={currentPage} totalItems={productsQuery.data.count} pageSize={pageSize} onPageChange={(page) => {
                setFilter("page", page);
                window.scrollTo({ top: 280, behavior: "smooth" });
              }} />
            )}
          </div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Cerrar filtros" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-[#071d41]/55 backdrop-blur-sm" />
          <div className="absolute inset-y-0 right-0 w-[min(90vw,360px)] overflow-y-auto bg-[#f7f9fc] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-1">
              <p className="text-lg font-black text-[#102a4e]">Filtrar catálogo</p>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Cerrar filtros" className="flex size-10 items-center justify-center rounded-full bg-white text-[#334862]"><X size={20} /></button>
            </div>
            <ProductFilters filters={filters} brands={brandsQuery.data ?? []} categories={categoriesQuery.data ?? []} activeCount={activeFilterCount} onChange={setFilter} onClear={clearFilters} />
            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="sticky bottom-3 mt-4 w-full rounded-xl bg-[#1454d8] px-5 py-3.5 text-sm font-black text-white shadow-lg">Ver {productsQuery.data?.count ?? 0} productos</button>
          </div>
        </div>
      )}
    </main>
  );
}
