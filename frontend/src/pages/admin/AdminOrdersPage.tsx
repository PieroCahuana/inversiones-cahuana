import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { getAdminOrders } from "../../api/orders";
import { AdminEmpty, AdminLoading, AdminPageHeader, AdminSearch, fieldClass } from "../../components/admin/AdminUi";
import { orderStatusClasses, paymentStatusClasses } from "../../lib/order-status";
import type { OrderStatus, PaymentStatus } from "../../types/order";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [payment, setPayment] = useState<PaymentStatus | "">("");
  const orders = useQuery({ queryKey: ["admin", "orders", search, status, payment], queryFn: () => getAdminOrders({ search: search || undefined, status: status || undefined, payment_status: payment || undefined, ordering: "-created_at" }) });
  if (orders.isPending) return <AdminLoading />;
  return <>
    <AdminPageHeader eyebrow="Ventas" title="Pedidos" description="Supervisa cada venta, confirma pagos y acompaña el pedido hasta su entrega." />
    <div className="mb-4 grid gap-3 md:grid-cols-[minmax(240px,1fr)_210px_210px]"><AdminSearch value={search} onChange={setSearch} placeholder="Buscar número de pedido..." /><select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | "")} className={`${fieldClass} mt-0`}><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="confirmed">Confirmado</option><option value="processing">En preparación</option><option value="shipped">Enviado</option><option value="delivered">Entregado</option><option value="cancelled">Cancelado</option></select><select value={payment} onChange={(event) => setPayment(event.target.value as PaymentStatus | "")} className={`${fieldClass} mt-0`}><option value="">Todos los pagos</option><option value="pending">Pago pendiente</option><option value="paid">Pagado</option><option value="failed">Fallido</option><option value="refunded">Reembolsado</option></select></div>
    {!orders.data?.length ? <AdminEmpty>No hay pedidos para los filtros seleccionados.</AdminEmpty> : <div className="overflow-hidden rounded-2xl border border-[#dfe7ef] bg-white"><div className="divide-y divide-[#edf1f5]">{orders.data.map((order) => <Link key={order.id} to={`/admin/orders/${order.order_number}`} className="grid items-center gap-3 px-5 py-4 transition hover:bg-[#f8faff] md:grid-cols-[minmax(220px,1fr)_150px_150px_120px_30px]"><div className="flex min-w-0 items-center gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-[#1454d8]"><PackageSearch size={19} /></div><div><p className="text-sm font-black">{order.order_number}</p><p className="mt-1 text-xs text-[#7b8999]">{new Date(order.created_at).toLocaleString("es-PE")} · {order.total_items} artículo(s)</p></div></div><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black ${orderStatusClasses[order.status]}`}>{order.status_display}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black ${paymentStatusClasses[order.payment_status]}`}>{order.payment_status_display}</span><strong className="text-sm">{money.format(Number(order.total))}</strong><ArrowRight size={17} className="text-[#8a97a7]" /></Link>)}</div></div>}
  </>;
}
