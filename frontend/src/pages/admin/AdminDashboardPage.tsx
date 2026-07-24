import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CircleDollarSign, PackageCheck, ShoppingBag, Warehouse } from "lucide-react";
import { Link } from "react-router";

import { getAdminOrders } from "../../api/orders";
import { getProducts } from "../../api/products";
import { getCommercialMetrics } from "../../api/commerce";
import { AdminLoading, AdminPageHeader } from "../../components/admin/AdminUi";
import { orderStatusClasses } from "../../lib/order-status";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function AdminDashboardPage() {
  const products = useQuery({ queryKey: ["admin", "products", "dashboard"], queryFn: () => getProducts({ page_size: 100, ordering: "stock" }) });
  const orders = useQuery({ queryKey: ["admin", "orders", "dashboard"], queryFn: () => getAdminOrders({ ordering: "-created_at" }) });
  const metrics = useQuery({ queryKey: ["admin", "commercial-metrics"], queryFn: getCommercialMetrics });

  if (products.isPending || orders.isPending || metrics.isPending) return <AdminLoading />;

  const productList = products.data?.results ?? [];
  const orderList = orders.data ?? [];
  const lowStock = productList.filter((product) => product.stock <= 5);
  const activeOrders = orderList.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const paidTotal = orderList.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0);
  const cards = [
    { label: "Productos", value: products.data?.count ?? 0, note: `${productList.filter((p) => p.is_active).length} activos`, icon: PackageCheck, color: "bg-blue-50 text-blue-700" },
    { label: "Stock bajo", value: lowStock.length, note: "5 unidades o menos", icon: AlertTriangle, color: "bg-amber-50 text-amber-700" },
    { label: "Pedidos activos", value: activeOrders.length, note: `${orderList.length} pedidos totales`, icon: ShoppingBag, color: "bg-violet-50 text-violet-700" },
    { label: "Ventas cobradas", value: money.format(Number(metrics.data?.revenue ?? paidTotal)), note: `Ticket promedio ${money.format(Number(metrics.data?.average_ticket ?? 0))}`, icon: CircleDollarSign, color: "bg-emerald-50 text-emerald-700" },
  ];

  return <>
    <AdminPageHeader eyebrow="Visión general" title="Hola, aquí está tu negocio" description="Revisa las prioridades del catálogo, el inventario y los pedidos desde un solo lugar." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_10px_35px_rgba(15,42,78,0.04)]"><div className={`flex size-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></div><p className="mt-5 text-3xl font-black tracking-tight text-[#102a4e]">{value}</p><p className="mt-1 text-sm font-black text-[#263d59]">{label}</p><p className="mt-1 text-xs text-[#7b8999]">{note}</p></article>)}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-2xl border border-[#e0e7ef] bg-white"><div className="flex items-center justify-between border-b border-[#e7ecf2] px-5 py-4"><div><h2 className="font-black">Pedidos recientes</h2><p className="mt-0.5 text-xs text-[#7c8999]">Última actividad comercial</p></div><Link to="/admin/orders" className="flex items-center gap-1 text-xs font-black text-[#249fd3]">Ver todos <ArrowRight size={15} /></Link></div><div className="divide-y divide-[#edf1f5]">{orderList.slice(0, 6).map((order) => <Link key={order.id} to={`/admin/orders/${order.order_number}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#f8faff]"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{order.order_number}</p><p className="mt-1 text-xs text-[#788697]">{new Date(order.created_at).toLocaleDateString("es-PE")} · {order.total_items} artículo(s)</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${orderStatusClasses[order.status]}`}>{order.status_display}</span><strong className="hidden text-sm sm:block">{money.format(Number(order.total))}</strong></Link>)}{orderList.length === 0 && <p className="p-8 text-center text-sm text-[#7a8798]">Aún no hay pedidos.</p>}</div></div>
      <div className="overflow-hidden rounded-2xl border border-[#e0e7ef] bg-white"><div className="flex items-center justify-between border-b border-[#e7ecf2] px-5 py-4"><div><h2 className="font-black">Atención de inventario</h2><p className="mt-0.5 text-xs text-[#7c8999]">Productos con pocas unidades</p></div><Link to="/admin/inventory" className="flex items-center gap-1 text-xs font-black text-[#249fd3]">Gestionar <ArrowRight size={15} /></Link></div><div className="divide-y divide-[#edf1f5]">{lowStock.slice(0, 6).map((product) => <div key={product.id} className="flex items-center gap-3 px-5 py-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f5f9] text-[#637389]"><Warehouse size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{product.name}</p><p className="mt-1 text-xs text-[#7c8999]">{product.sku}</p></div><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{product.stock} un.</span></div>)}{lowStock.length === 0 && <p className="p-8 text-center text-sm text-[#7a8798]">El inventario está saludable.</p>}</div></div>
    </section>
    <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-[#e0e7ef] bg-white"><div className="border-b border-[#e7ecf2] px-5 py-4"><h2 className="font-black">Productos más vendidos</h2><p className="mt-1 text-xs text-[#7c8999]">Unidades de pedidos pagados</p></div><div className="divide-y divide-[#edf1f5]">{metrics.data?.top_products.map((item, index) => <div key={item.product_sku} className="flex items-center gap-3 px-5 py-3"><span className="flex size-7 items-center justify-center rounded-lg bg-[#eaf7fc] text-xs font-black text-[#249fd3]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.product_name}</p><p className="text-[10px] text-[#8190a1]">{item.product_sku}</p></div><strong className="text-sm">{item.quantity} un.</strong></div>)}{!metrics.data?.top_products.length && <p className="p-8 text-center text-sm text-[#7c8999]">Aún no hay ventas pagadas.</p>}</div></div><div className="overflow-hidden rounded-2xl border border-[#e0e7ef] bg-white"><div className="border-b border-[#e7ecf2] px-5 py-4"><h2 className="font-black">Rendimiento de cupones</h2><p className="mt-1 text-xs text-[#7c8999]">Uso y descuento acumulado</p></div><div className="divide-y divide-[#edf1f5]">{metrics.data?.top_coupons.map((item) => <div key={item.coupon__code} className="flex items-center gap-3 px-5 py-4"><span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">{item.coupon__code}</span><p className="flex-1 text-xs text-[#66768a]">{item.uses} usos</p><strong className="text-sm">−{money.format(Number(item.discount))}</strong></div>)}{!metrics.data?.top_coupons.length && <p className="p-8 text-center text-sm text-[#7c8999]">Aún no se utilizaron cupones.</p>}</div></div></section>
  </>;
}
