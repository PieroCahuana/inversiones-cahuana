import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowDownToLine, ArrowUpFromLine, Plus, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { type FormEvent, useState } from "react";

import { createInventoryMovement, getInventoryMovements } from "../../api/inventory";
import { getProducts } from "../../api/products";
import { AdminEmpty, AdminLoading, AdminModal, AdminPageHeader, AdminSearch, fieldClass, primaryButton, secondaryButton, textareaClass } from "../../components/admin/AdminUi";
import type { MovementType } from "../../types/inventory";

const movementStyle: Record<MovementType, { icon: typeof ArrowDownToLine; className: string; sign: string }> = {
  entry: { icon: ArrowDownToLine, className: "bg-emerald-50 text-emerald-700", sign: "+" },
  return: { icon: RefreshCcw, className: "bg-cyan-50 text-cyan-700", sign: "+" },
  exit: { icon: ArrowUpFromLine, className: "bg-red-50 text-red-700", sign: "−" },
  adjustment: { icon: SlidersHorizontal, className: "bg-violet-50 text-violet-700", sign: "±" },
};

export function AdminInventoryPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const movements = useQuery({ queryKey: ["admin", "inventory", search, page], queryFn: () => getInventoryMovements({ search: search || undefined, page }) });
  const products = useQuery({ queryKey: ["admin", "products", "inventory"], queryFn: () => getProducts({ page_size: 100, ordering: "name" }) });
  const create = useMutation({ mutationFn: createInventoryMovement, onSuccess: () => { client.invalidateQueries({ queryKey: ["admin", "inventory"] }); client.invalidateQueries({ queryKey: ["admin", "products"] }); setModal(false); }, onError: (cause) => setError(axios.isAxiosError(cause) ? JSON.stringify(cause.response?.data) : "No fue posible registrar el movimiento.") });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    create.mutate({ product_id: Number(form.get("product_id")), movement_type: String(form.get("movement_type")) as MovementType, quantity: Number(form.get("quantity")), reason: String(form.get("reason")), reference: String(form.get("reference") ?? "") });
  }

  if (movements.isPending || products.isPending) return <AdminLoading />;
  return <>
    <AdminPageHeader eyebrow="Operaciones" title="Inventario" description="Registra cada ingreso, salida, devolución o ajuste. El stock se actualiza automáticamente y conserva su historial." action={<button className={primaryButton} onClick={() => setModal(true)}><Plus size={18} /> Registrar movimiento</button>} />
    <div className="mb-4 max-w-lg"><AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar producto, SKU o referencia..." /></div>
    {!movements.data?.results.length ? <AdminEmpty>Aún no se han registrado movimientos.</AdminEmpty> : <div className="overflow-hidden rounded-2xl border border-[#dfe7ef] bg-white"><div className="divide-y divide-[#edf1f5]">{movements.data.results.map((movement) => { const style = movementStyle[movement.movement_type]; const Icon = style.icon; return <article key={movement.id} className="grid items-center gap-3 px-5 py-4 md:grid-cols-[minmax(240px,1fr)_150px_110px_150px]"><div className="flex min-w-0 items-center gap-3"><div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style.className}`}><Icon size={18} /></div><div className="min-w-0"><p className="truncate text-sm font-black">{movement.product.name}</p><p className="mt-1 text-xs text-[#7a8798]">{movement.product.sku} · {movement.reason}</p></div></div><div><p className="text-xs font-black">{movement.movement_type_display}</p><p className="mt-1 text-[11px] text-[#8190a1]">{movement.reference || "Sin referencia"}</p></div><p className={`text-lg font-black ${style.className.split(" ")[1]}`}>{style.sign}{movement.quantity}</p><div className="md:text-right"><p className="text-xs font-black">{movement.previous_stock} → {movement.new_stock} un.</p><p className="mt-1 text-[11px] text-[#8190a1]">{new Date(movement.created_at).toLocaleString("es-PE")}</p></div></article>; })}</div></div>}
    <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#69788b]"><span>{movements.data?.count ?? 0} movimientos</span><div className="flex gap-2"><button className={secondaryButton} disabled={!movements.data?.previous} onClick={() => setPage((value) => value - 1)}>Anterior</button><button className={secondaryButton} disabled={!movements.data?.next} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div></div>
    {modal && <AdminModal title="Registrar movimiento" onClose={() => setModal(false)}><form onSubmit={submit} className="grid gap-5"><label className="text-sm font-bold">Producto<select name="product_id" required className={fieldClass}><option value="">Seleccionar producto</option>{products.data?.results.map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name} ({product.stock} un.)</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Tipo<select name="movement_type" className={fieldClass}><option value="entry">Entrada</option><option value="exit">Salida</option><option value="adjustment">Ajuste</option><option value="return">Devolución</option></select></label><label className="text-sm font-bold">Cantidad<input name="quantity" type="number" min="1" required className={fieldClass} /></label></div><label className="text-sm font-bold">Motivo<textarea name="reason" minLength={3} required className={textareaClass} placeholder="Ej. Reposición de proveedor" /></label><label className="text-sm font-bold">Referencia <span className="font-normal text-[#8793a2]">(opcional)</span><input name="reference" className={fieldClass} placeholder="Factura, guía o documento" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className={secondaryButton} onClick={() => setModal(false)}>Cancelar</button><button className={primaryButton} disabled={create.isPending}>{create.isPending ? "Registrando..." : "Confirmar movimiento"}</button></div></form></AdminModal>}
  </>;
}
