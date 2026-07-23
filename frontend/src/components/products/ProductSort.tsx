interface ProductSortProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ProductSort({ value = "-created_at", onChange }: ProductSortProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-[#52647a]">
      <span className="hidden sm:inline">Ordenar:</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-[#d8e1ec] bg-white px-3 text-sm font-bold text-[#263b57] outline-none focus:border-[#1454d8]">
        <option value="-created_at">Más recientes</option>
        <option value="price">Menor precio</option>
        <option value="-price">Mayor precio</option>
        <option value="name">Nombre A–Z</option>
        <option value="-name">Nombre Z–A</option>
        <option value="-stock">Mayor disponibilidad</option>
      </select>
    </label>
  );
}
