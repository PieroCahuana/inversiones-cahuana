import { useQuery } from "@tanstack/react-query";
import { ChevronRight, PackageOpen, Search, ShoppingBag } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { getOrders } from "../../api/orders";
import { orderStatusClasses, paymentStatusClasses } from "../../lib/order-status";
import type { OrderStatus } from "../../types/order";

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(value));
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const status = (searchParams.get("status") || undefined) as OrderStatus | undefined;
  const ordering = (searchParams.get("ordering") || "-created_at") as "-created_at" | "created_at" | "total" | "-total";
  const ordersQuery = useQuery({ queryKey: ["orders", { search: searchParams.get("search"), status, ordering }], queryFn: () => getOrders({ search: searchParams.get("search") || undefined, status, ordering }) });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    updateParam("search", search.trim());
  }

  return (
    <main className="bg-[#f7f9fc] py-10 sm:py-14">
      <div className="site-container max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1454d8]">Mi cuenta</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-black tracking-[-0.045em] text-[#071d41] sm:text-5xl">Mis pedidos</h1><p className="mt-3 text-[#6c798a]">Consulta el estado y los detalles de tus compras.</p></div><Link to="/products" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1454d8] px-5 py-3 text-sm font-black text-white"><ShoppingBag size={17} /> Seguir comprando</Link></div>

        <div className="mt-8 flex flex-col gap-3 rounded-[20px] border border-[#e1e7ef] bg-white p-4 sm:flex-row sm:items-center">
          <form onSubmit={submitSearch} className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-3 focus-within:border-[#1454d8]"><Search size={17} className="text-[#7b8999]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por número de pedido" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /><button className="text-xs font-black text-[#1454d8]">Buscar</button></form>
          <select value={status ?? ""} onChange={(event) => updateParam("status", event.target.value)} className="h-11 rounded-xl border border-[#d8e1ec] bg-white px-3 text-sm font-bold text-[#334862] outline-none"><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="confirmed">Confirmado</option><option value="processing">En preparación</option><option value="shipped">Enviado</option><option value="delivered">Entregado</option><option value="cancelled">Cancelado</option></select>
          <select value={ordering} onChange={(event) => updateParam("ordering", event.target.value)} className="h-11 rounded-xl border border-[#d8e1ec] bg-white px-3 text-sm font-bold text-[#334862] outline-none"><option value="-created_at">Más recientes</option><option value="created_at">Más antiguos</option><option value="-total">Mayor total</option><option value="total">Menor total</option></select>
        </div>

        {ordersQuery.isPending && <div className="mt-6 space-y-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-[20px] bg-[#e7edf4]" />)}</div>}
        {ordersQuery.isError && <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 p-10 text-center"><p className="font-black text-red-700">No pudimos cargar tus pedidos.</p><button type="button" onClick={() => ordersQuery.refetch()} className="mt-4 text-sm font-black text-[#1454d8]">Reintentar</button></div>}
        {ordersQuery.data?.length === 0 && <div className="mt-6 rounded-[20px] border border-dashed border-[#cbd6e2] bg-white p-12 text-center"><PackageOpen size={38} className="mx-auto text-[#94a2b3]" /><h2 className="mt-4 text-xl font-black text-[#334862]">No encontramos pedidos</h2><p className="mt-2 text-sm text-[#718094]">Cuando realices una compra aparecerá aquí.</p>{searchParams.size > 0 ? <button type="button" onClick={() => { setSearch(""); setSearchParams({}); }} className="mt-5 text-sm font-black text-[#1454d8] hover:underline">Limpiar filtros</button> : <Link to="/products" className="mt-5 inline-flex rounded-xl bg-[#1454d8] px-5 py-3 text-sm font-black text-white">Explorar catálogo</Link>}</div>}

        {ordersQuery.data && ordersQuery.data.length > 0 && <div className="mt-6 space-y-4">{ordersQuery.data.map((order) => <Link key={order.id} to={`/orders/${order.order_number}`} className="group block rounded-[20px] border border-[#e1e7ef] bg-white p-5 transition hover:border-[#b9cae4] hover:shadow-[0_16px_40px_rgba(13,38,76,0.08)] sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-[#102a4e]">Pedido {order.order_number}</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${orderStatusClasses[order.status]}`}>{order.status_display}</span><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${paymentStatusClasses[order.payment_status]}`}>Pago {order.payment_status_display}</span></div><p className="mt-2 text-sm text-[#7b8999]">{new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.created_at))}</p><p className="mt-3 text-sm font-bold text-[#52647a]">{order.total_items} {order.total_items === 1 ? "producto" : "productos"}</p></div><div className="flex items-center justify-between gap-8 sm:justify-end"><div className="text-right"><p className="text-xs font-semibold text-[#8a97a7]">Total</p><p className="mt-1 text-2xl font-black text-[#071d41]">{formatPrice(order.total)}</p></div><ChevronRight size={22} className="text-[#9aa7b7] transition group-hover:translate-x-1 group-hover:text-[#1454d8]" /></div></div></Link>)}</div>}
      </div>
    </main>
  );
}
