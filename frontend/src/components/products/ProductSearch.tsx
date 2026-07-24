import { Search, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface ProductSearchProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value = "", onChange }: ProductSearchProps) {
  const [search, setSearch] = useState(value);

  useEffect(() => setSearch(value), [value]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange(search.trim());
  }

  function clear() {
    setSearch("");
    onChange("");
  }

  return (
    <form onSubmit={submit} className="flex h-12 w-full items-center overflow-hidden rounded-xl border border-[#d8e1ec] bg-white transition focus-within:border-[#249fd3] focus-within:ring-4 focus-within:ring-[#249fd3]/10 lg:max-w-xl">
      <Search size={19} className="ml-4 shrink-0 text-[#7d8a9b]" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar por nombre, marca, SKU..." className="h-full min-w-0 flex-1 px-3 text-sm outline-none" />
      {search && <button type="button" onClick={clear} aria-label="Limpiar búsqueda" className="p-2 text-[#7d8a9b] hover:text-[#249fd3]"><X size={17} /></button>}
      <button className="h-full bg-[#249fd3] px-5 text-sm font-black text-white hover:bg-[#167fac]">Buscar</button>
    </form>
  );
}
