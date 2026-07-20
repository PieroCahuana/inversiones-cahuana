import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router";

import { getProducts } from "../../api/products";
import { ProductCard } from "../../components/products/ProductCard";

const categories = [
  { label: "Todos", value: "" },
  { label: "Laptops", value: "laptops" },
  { label: "Computadoras", value: "pcs" },
  { label: "All in One", value: "all-in-one" },
  { label: "Monitores", value: "monitores" },
];

const categoryTerms: Record<string, string[]> = {
  laptops: ["laptop", "portatil"],
  pcs: ["pc", "computadora", "desktop"],
  "all-in-one": ["all-in-one", "todo-en-uno", "aio"],
  monitores: ["monitor"],
};

function normalize(value: string) {
  return value.toLocaleLowerCase("es-PE").replaceAll(" ", "-");
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: getProducts });

  const products = productsQuery.data?.filter((product) => {
    const categoryText = normalize(`${product.category} ${product.name}`);
    const matchesCategory = !activeCategory
      || (categoryTerms[activeCategory] ?? [activeCategory]).some((term) => categoryText.includes(term));
    const term = normalize(search);
    const matchesSearch = !term
      || normalize(`${product.name} ${product.brand} ${product.short_description}`).includes(term);
    return matchesCategory && matchesSearch;
  });

  function updateParam(key: "category" | "search", value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-[#071d41] py-16 text-white sm:py-20">
        <div className="absolute -right-24 -top-28 size-80 rounded-full bg-[#1454d8]/45 blur-[100px]" />
        <div className="site-container relative">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8fb5ff]">Catálogo</p>
          <h1 className="display-title mt-4 max-w-3xl text-5xl font-black sm:text-6xl">
            Tecnología para cada forma de avanzar.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#b9c8dc]">
            Explora equipos seleccionados por rendimiento, condición y valor. Si tienes dudas, te ayudamos a elegir.
          </p>
        </div>
      </section>

      <section className="site-container py-10 sm:py-14">
        <div className="rounded-[22px] border border-[#e1e7ef] bg-white p-4 shadow-[0_16px_50px_rgba(13,38,76,0.07)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#334862]">
              <SlidersHorizontal size={18} className="text-[#1454d8]" />
              Filtrar productos
            </div>
            <label className="flex w-full items-center rounded-xl border border-[#dce4ef] bg-[#f7f9fc] px-4 transition focus-within:border-[#1454d8] lg:max-w-sm">
              <Search size={18} className="text-[#81798b]" />
              <input
                value={search}
                onChange={(event) => updateParam("search", event.target.value)}
                type="search"
                placeholder="Buscar por equipo o marca"
                className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => updateParam("category", category.value)}
                className={[
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition",
                  activeCategory === category.value
                    ? "bg-[#1454d8] text-white"
                    : "bg-[#edf2f8] text-[#52647a] hover:bg-[#e4edfc] hover:text-[#1454d8]",
                ].join(" ")}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Nuestra selección</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#102a4e]">Equipos disponibles</h2>
          </div>
          {products && <p className="text-sm font-semibold text-[#6c798a]">{products.length} resultados</p>}
        </div>

        {productsQuery.isPending && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[470px] animate-pulse rounded-[1.75rem] bg-[#e9e5ec]" />
            ))}
          </div>
        )}

        {productsQuery.isError && (
          <div className="mt-8 rounded-3xl border border-[#ead8d8] bg-[#fff7f6] p-10 text-center">
            <ShoppingBag className="mx-auto text-[#b65d5d]" />
            <p className="mt-4 font-black text-[#762f2f]">No pudimos cargar el catálogo.</p>
            <p className="mt-2 text-sm text-[#9a5e5e]">Intenta nuevamente cuando el servidor esté disponible.</p>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {products?.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-[#d8d0df] bg-white p-12 text-center">
            <Search className="mx-auto text-[#a69eae]" />
            <p className="mt-4 font-black text-[#334862]">No encontramos coincidencias.</p>
            <button type="button" onClick={() => setSearchParams({})} className="mt-4 text-sm font-bold text-[#1454d8] hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
