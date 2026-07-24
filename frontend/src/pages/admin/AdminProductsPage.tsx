import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Edit3, ImagePlus, PackageOpen, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { getBrands } from "../../api/brands";
import { getCategories } from "../../api/categories";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct, uploadProductImage } from "../../api/products";
import { AdminEmpty, AdminLoading, AdminModal, AdminPageHeader, AdminSearch, fieldClass, primaryButton, secondaryButton, textareaClass } from "../../components/admin/AdminUi";
import type { ProductPayload, ProductSummary } from "../../types/product";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function AdminProductsPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductSummary | null | undefined>(undefined);
  const [error, setError] = useState("");
  const products = useQuery({ queryKey: ["admin", "products", search, page], queryFn: () => getProducts({ search: search || undefined, page, page_size: 20, ordering: "-created_at" }) });
  const brands = useQuery({ queryKey: ["admin", "brands"], queryFn: getBrands });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: getCategories });
  const detail = useQuery({ queryKey: ["admin", "product", editing?.slug], queryFn: () => getProduct(editing!.slug), enabled: Boolean(editing) });
  const save = useMutation({
    mutationFn: async ({ payload, image }: { payload: ProductPayload; image?: File }) => {
      const product = editing ? await updateProduct(editing.slug, payload) : await createProduct(payload);
      if (image) await uploadProductImage(product.slug, image, true);
      return product;
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ["admin", "products"] }); client.invalidateQueries({ queryKey: ["products"] }); setEditing(undefined); },
    onError: (cause) => setError(axios.isAxiosError(cause) ? JSON.stringify(cause.response?.data) : "No fue posible guardar el producto."),
  });

  async function remove(product: ProductSummary) {
    if (!window.confirm(`¿Eliminar ${product.name}?`)) return;
    try { await deleteProduct(product.slug); await client.invalidateQueries({ queryKey: ["admin", "products"] }); } catch { window.alert("No se puede eliminar este producto porque tiene información relacionada."); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    let specifications: Record<string, unknown> = {};
    try { specifications = JSON.parse(String(form.get("specifications") || "{}")); } catch { setError("Las especificaciones deben tener formato JSON válido."); return; }
    const discount = String(form.get("discount_price") ?? "").trim();
    const payload: ProductPayload = { sku: String(form.get("sku")), name: String(form.get("name")), short_description: String(form.get("short_description")), description: String(form.get("description")), brand_id: Number(form.get("brand_id")), category_id: Number(form.get("category_id")), price: String(form.get("price")), discount_price: discount || null, condition: String(form.get("condition")) as ProductPayload["condition"], specifications, is_featured: form.get("is_featured") === "on", is_active: form.get("is_active") === "on" };
    const image = form.get("image");
    save.mutate({ payload, image: image instanceof File && image.size > 0 ? image : undefined });
  }

  const current = detail.data;
  const isLoading = products.isPending || brands.isPending || categories.isPending;
  if (isLoading) return <AdminLoading />;

  return <>
    <AdminPageHeader eyebrow="Catálogo" title="Productos" description="Crea, publica y mantén actualizada toda la oferta de la tienda." action={<button className={primaryButton} onClick={() => setEditing(null)}><Plus size={18} /> Nuevo producto</button>} />
    <div className="mb-4 max-w-lg"><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar por nombre, SKU, marca..." /></div>
    {!products.data?.results.length ? <AdminEmpty>No hay productos que coincidan con la búsqueda.</AdminEmpty> : <div className="overflow-hidden rounded-2xl border border-[#dfe7ef] bg-white"><div className="hidden grid-cols-[minmax(300px,1fr)_150px_120px_100px_100px] gap-4 border-b border-[#e5ebf1] bg-[#f8fafd] px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#758397] lg:grid"><span>Producto</span><span>Categoría</span><span>Precio</span><span>Stock</span><span className="text-right">Acciones</span></div><div className="divide-y divide-[#edf1f5]">{products.data.results.map((product) => <article key={product.id} className="grid items-center gap-4 px-4 py-4 transition hover:bg-[#fafcff] lg:grid-cols-[minmax(300px,1fr)_150px_120px_100px_100px] lg:px-5"><div className="flex min-w-0 items-center gap-3"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2f5f9]">{product.primary_image ? <img src={product.primary_image} alt="" className="size-full object-contain" /> : <PackageOpen size={22} className="text-[#9aa6b5]" />}</div><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-black">{product.name}</p><span className={`size-2 shrink-0 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-slate-300"}`} /></div><p className="mt-1 text-xs text-[#7b8999]">{product.sku} · {product.brand}</p></div></div><p className="text-xs font-bold text-[#52647a]">{product.category}</p><div><p className="text-sm font-black">{money.format(Number(product.current_price))}</p>{product.has_discount && <p className="text-[10px] text-[#8894a2] line-through">{money.format(Number(product.price))}</p>}</div><span className={`w-fit rounded-lg px-2.5 py-1 text-xs font-black ${product.stock === 0 ? "bg-red-50 text-red-700" : product.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{product.stock} un.</span><div className="flex justify-end gap-2"><button className={secondaryButton} onClick={() => setEditing(product)} aria-label="Editar"><Edit3 size={15} /></button><button className="flex size-10 items-center justify-center rounded-xl border border-red-100 text-red-600 hover:bg-red-50" onClick={() => remove(product)} aria-label="Eliminar"><Trash2 size={15} /></button></div></article>)}</div></div>}
    <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#69788b]"><span>{products.data?.count ?? 0} productos</span><div className="flex gap-2"><button className={secondaryButton} disabled={!products.data?.previous} onClick={() => setPage((value) => value - 1)}>Anterior</button><button className={secondaryButton} disabled={!products.data?.next} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div></div>
    {editing !== undefined && <AdminModal title={editing ? "Editar producto" : "Nuevo producto"} onClose={() => setEditing(undefined)}>{editing && detail.isPending ? <AdminLoading /> : <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">SKU<input name="sku" defaultValue={current?.sku ?? ""} required className={fieldClass} /></label><label className="text-sm font-bold">Nombre<input name="name" defaultValue={current?.name ?? ""} required minLength={3} className={fieldClass} /></label><label className="text-sm font-bold">Marca<select name="brand_id" defaultValue={current?.brand.id ?? ""} required className={fieldClass}><option value="">Seleccionar</option>{brands.data?.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label className="text-sm font-bold">Categoría<select name="category_id" defaultValue={current?.category.id ?? ""} required className={fieldClass}><option value="">Seleccionar</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-bold">Precio regular<input name="price" type="number" min="0.01" step="0.01" defaultValue={current?.price ?? ""} required className={fieldClass} /></label><label className="text-sm font-bold">Precio de oferta<input name="discount_price" type="number" min="0.01" step="0.01" defaultValue={current?.discount_price ?? ""} className={fieldClass} /></label><label className="text-sm font-bold">Condición<select name="condition" defaultValue={current?.condition ?? "new"} className={fieldClass}><option value="new">Nuevo</option><option value="refurbished">Reacondicionado</option><option value="used">Usado</option></select></label><label className="text-sm font-bold">Imagen principal <span className="font-normal text-[#8793a2]">(opcional)</span><span className={`${fieldClass} flex items-center gap-2 py-2.5`}><ImagePlus size={17} /><input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="min-w-0 text-xs" /></span></label><label className="text-sm font-bold sm:col-span-2">Descripción corta<input name="short_description" defaultValue={current?.short_description ?? ""} className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Descripción<textarea name="description" defaultValue={current?.description ?? ""} className={textareaClass} /></label><label className="text-sm font-bold sm:col-span-2">Especificaciones (JSON)<textarea name="specifications" defaultValue={JSON.stringify(current?.specifications ?? {}, null, 2)} className={`${textareaClass} font-mono text-xs`} /></label><div className="flex gap-5 sm:col-span-2"><label className="flex items-center gap-2 text-sm font-bold"><input name="is_active" type="checkbox" defaultChecked={current?.is_active ?? true} className="size-4 accent-[#249fd3]" /> Producto activo</label><label className="flex items-center gap-2 text-sm font-bold"><input name="is_featured" type="checkbox" defaultChecked={current?.is_featured ?? false} className="size-4 accent-[#249fd3]" /> Destacado</label></div>{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className={secondaryButton} onClick={() => setEditing(undefined)}>Cancelar</button><button className={primaryButton} disabled={save.isPending}>{save.isPending ? "Guardando..." : "Guardar producto"}</button></div></form>}</AdminModal>}
  </>;
}
