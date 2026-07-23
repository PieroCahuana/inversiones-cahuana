import { RotateCcw, SlidersHorizontal } from "lucide-react";

import type { Brand } from "../../types/brand";
import type { Category } from "../../types/category";
import type { ProductFilters as Filters } from "../../types/product";

interface ProductFiltersProps {
  filters: Filters;
  brands: Brand[];
  categories: Category[];
  activeCount: number;
  onChange: (key: keyof Filters, value?: string | number | boolean) => void;
  onClear: () => void;
}

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d8e1ec] bg-white px-3 text-sm text-[#334862] outline-none focus:border-[#1454d8] focus:ring-4 focus:ring-[#1454d8]/10";

export function ProductFilters({ filters, brands, categories, activeCount, onChange, onClear }: ProductFiltersProps) {
  return (
    <aside className="rounded-[20px] border border-[#e1e7ef] bg-white p-5">
      <div className="flex items-center justify-between border-b border-[#e8edf3] pb-4">
        <div className="flex items-center gap-2 font-black text-[#183353]"><SlidersHorizontal size={19} className="text-[#1454d8]" /> Filtros {activeCount > 0 && <span className="flex size-6 items-center justify-center rounded-full bg-[#1454d8] text-[10px] text-white">{activeCount}</span>}</div>
        {activeCount > 0 && <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs font-bold text-[#1454d8] hover:underline"><RotateCcw size={13} /> Limpiar</button>}
      </div>

      <div className="mt-5 space-y-5">
        <label className="block text-sm font-black text-[#334862]">
          Categoría
          <select value={filters.category ?? ""} onChange={(event) => onChange("category", event.target.value)} className={fieldClass}>
            <option value="">Todas las categorías</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
        </label>

        <label className="block text-sm font-black text-[#334862]">
          Marca
          <select value={filters.brand ?? ""} onChange={(event) => onChange("brand", event.target.value)} className={fieldClass}>
            <option value="">Todas las marcas</option>
            {brands.map((brand) => <option key={brand.id} value={brand.slug}>{brand.name}</option>)}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-black text-[#334862]">Condición</legend>
          <div className="mt-3 space-y-2.5">
            {[
              ["", "Todas"],
              ["new", "Nuevo"],
              ["refurbished", "Reacondicionado"],
              ["used", "Seminuevo"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-[#5e6f83]">
                <input type="radio" name="condition" value={value} checked={(filters.condition ?? "") === value} onChange={() => onChange("condition", value)} className="size-4 accent-[#1454d8]" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-black text-[#334862]">Rango de precio</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-[11px] font-bold text-[#7b8999]">Mínimo
              <input key={`min-${filters.min_price}`} defaultValue={filters.min_price ?? ""} onBlur={(event) => onChange("min_price", event.target.value)} type="number" min="0" step="10" placeholder="S/ 0" className={`${fieldClass} mt-1`} />
            </label>
            <label className="text-[11px] font-bold text-[#7b8999]">Máximo
              <input key={`max-${filters.max_price}`} defaultValue={filters.max_price ?? ""} onBlur={(event) => onChange("max_price", event.target.value)} type="number" min="0" step="10" placeholder="S/ 5000" className={`${fieldClass} mt-1`} />
            </label>
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[#f3f7fd] px-4 py-3.5 text-sm font-black text-[#334862]">
          Solo disponibles
          <input type="checkbox" checked={filters.in_stock === true} onChange={(event) => onChange("in_stock", event.target.checked)} className="size-4 accent-[#1454d8]" />
        </label>
      </div>
    </aside>
  );
}
