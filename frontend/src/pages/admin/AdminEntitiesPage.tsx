import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Edit3, Plus, Power, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { createBrand, deleteBrand, getBrands, updateBrand } from "../../api/brands";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../api/categories";
import { AdminEmpty, AdminLoading, AdminModal, AdminPageHeader, AdminSearch, fieldClass, primaryButton, secondaryButton, textareaClass } from "../../components/admin/AdminUi";
import type { Brand } from "../../types/brand";
import type { Category } from "../../types/category";

type Entity = Brand | Category;

export function AdminEntitiesPage({ kind }: { kind: "brands" | "categories" }) {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Entity | null | undefined>(undefined);
  const [error, setError] = useState("");
  const config = kind === "brands"
    ? { title: "Marcas", singular: "marca", description: "Organiza los fabricantes disponibles en tu catálogo.", get: getBrands, create: createBrand, update: updateBrand, remove: deleteBrand }
    : { title: "Categorías", singular: "categoría", description: "Estructura el catálogo para que los clientes encuentren productos rápidamente.", get: getCategories, create: createCategory, update: updateCategory, remove: deleteCategory };
  const query = useQuery<Entity[]>({ queryKey: ["admin", kind], queryFn: async () => kind === "brands" ? await getBrands() : await getCategories() });
  const mutation = useMutation({
    mutationFn: async (data: { name: string; description: string; is_active: boolean }) => editing ? config.update(editing.slug, data) : config.create(data),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["admin", kind] }); client.invalidateQueries({ queryKey: [kind] }); setEditing(undefined); },
    onError: (cause) => setError(axios.isAxiosError(cause) ? JSON.stringify(cause.response?.data) : "No fue posible guardar los cambios."),
  });
  const filtered = useMemo(() => (query.data ?? []).filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);

  async function remove(item: Entity) {
    if (!window.confirm(`¿Eliminar ${item.name}? Esta acción no se puede deshacer.`)) return;
    try { await config.remove(item.slug); await client.invalidateQueries({ queryKey: ["admin", kind] }); } catch { window.alert(`No se pudo eliminar la ${config.singular}. Puede estar vinculada a productos.`); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    mutation.mutate({ name: String(form.get("name") ?? ""), description: String(form.get("description") ?? ""), is_active: form.get("is_active") === "on" });
  }

  if (query.isPending) return <AdminLoading />;
  return <>
    <AdminPageHeader eyebrow="Catálogo" title={config.title} description={config.description} action={<button className={primaryButton} onClick={() => setEditing(null)}><Plus size={18} /> Nueva {config.singular}</button>} />
    <div className="mb-4 max-w-md"><AdminSearch value={search} onChange={setSearch} placeholder={`Buscar ${config.title.toLowerCase()}...`} /></div>
    {filtered.length === 0 ? <AdminEmpty>No encontramos resultados para esta búsqueda.</AdminEmpty> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <article key={item.id} className="rounded-2xl border border-[#dfe7ef] bg-white p-5 shadow-[0_10px_30px_rgba(16,42,78,0.035)]"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-lg font-black text-[#1454d8]">{item.name[0].toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black">{item.name}</h2><span className={`size-2 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-slate-300"}`} /></div><p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-[#758397]">{item.description || "Sin descripción"}</p></div></div><div className="mt-5 flex items-center border-t border-[#edf1f5] pt-4"><span className={`flex items-center gap-1.5 text-xs font-bold ${item.is_active ? "text-emerald-700" : "text-[#8793a2]"}`}><Power size={14} /> {item.is_active ? "Activa" : "Inactiva"}</span><div className="ml-auto flex gap-2"><button className={secondaryButton} onClick={() => setEditing(item)} aria-label="Editar"><Edit3 size={15} /></button><button className="flex size-10 items-center justify-center rounded-xl border border-red-100 text-red-600 hover:bg-red-50" onClick={() => remove(item)} aria-label="Eliminar"><Trash2 size={15} /></button></div></div></article>)}</div>}
    {editing !== undefined && <AdminModal title={editing ? `Editar ${config.singular}` : `Nueva ${config.singular}`} onClose={() => setEditing(undefined)}><form onSubmit={submit} className="grid gap-5"><label className="text-sm font-bold">Nombre<input name="name" defaultValue={editing?.name ?? ""} minLength={2} required className={fieldClass} /></label><label className="text-sm font-bold">Descripción<textarea name="description" defaultValue={editing?.description ?? ""} className={textareaClass} /></label><label className="flex items-center gap-3 rounded-xl bg-[#f5f8fc] p-4 text-sm font-bold"><input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? true} className="size-4 accent-[#1454d8]" /> Visible y activa en la tienda</label>{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className={secondaryButton} onClick={() => setEditing(undefined)}>Cancelar</button><button className={primaryButton} disabled={mutation.isPending}>{mutation.isPending ? "Guardando..." : "Guardar cambios"}</button></div></form></AdminModal>}
  </>;
}
