import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, BadgeCheck, CircleCheck, Clock3, Headphones, MapPin, PackageCheck, ReceiptText } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";

import { getOrder } from "../../api/orders";
import { PaymentReceiptPanel } from "../../components/orders/PaymentReceiptPanel";
import { activeOrderSteps, orderStatusClasses, paymentStatusClasses } from "../../lib/order-status";
import type { OrderStatus } from "../../types/order";

const stepLabels: Record<OrderStatus, string> = { pending: "Pendiente", confirmed: "Confirmado", processing: "En preparación", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado" };

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(Number(value));
}

export function OrderDetailPage() {
  const { orderNumber = "" } = useParams();
  const location = useLocation();
  const created = Boolean((location.state as { created?: boolean } | null)?.created);
  const orderQuery = useQuery({ queryKey: ["order", orderNumber], queryFn: () => getOrder(orderNumber), enabled: Boolean(orderNumber) });

  if (orderQuery.isPending) return <main className="site-container py-12"><div className="h-64 animate-pulse rounded-[24px] bg-[#e7edf4]" /></main>;
  if (orderQuery.isError || !orderQuery.data) {
    const notFound = axios.isAxiosError(orderQuery.error) && orderQuery.error.response?.status === 404;
    return <main className="site-container py-20 text-center"><ReceiptText size={40} className="mx-auto text-[#249fd3]" /><h1 className="mt-5 text-3xl font-black text-[#102a4e]">{notFound ? "Este pedido no existe" : "No pudimos cargar el pedido"}</h1><Link to="/orders" className="mt-6 inline-flex rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white">Volver a mis pedidos</Link></main>;
  }

  const order = orderQuery.data;
  const currentStep = activeOrderSteps.indexOf(order.status);
  const whatsappMessage = encodeURIComponent(`Hola, quisiera consultar el estado del pedido ${order.order_number}.`);

  return (
    <main className="bg-[#f7f9fc] py-9 sm:py-12">
      <div className="site-container max-w-6xl">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-black text-[#249fd3] hover:underline"><ArrowLeft size={16} /> Mis pedidos</Link>
        {created && <div className="mt-5 flex gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"><CircleCheck size={24} className="shrink-0" /><div><p className="font-black">¡Pedido creado correctamente!</p><p className="mt-1 text-sm">Nos comunicaremos contigo para coordinar el pago y la entrega.</p></div></div>}

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#dce4ef] bg-white shadow-[0_18px_50px_rgba(13,38,76,0.07)]">
          <div className="flex flex-col justify-between gap-5 bg-[#071d41] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#8fb5ff]">Detalle del pedido</p><h1 className="mt-2 text-3xl font-black tracking-tight">{order.order_number}</h1><p className="mt-2 text-sm text-[#b9c8dc]">Realizado el {new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.created_at))}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${orderStatusClasses[order.status]}`}>{order.status_display}</span><span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${paymentStatusClasses[order.payment_status]}`}>Pago {order.payment_status_display}</span></div></div>

          <div className="p-6 sm:p-8">
            {order.status === "cancelled" ? <div className="rounded-2xl bg-red-50 p-5 text-center font-bold text-red-700">Este pedido fue cancelado.</div> : <div className="grid grid-cols-5"><div className="col-span-5 mb-3 flex justify-between">{activeOrderSteps.map((step, index) => { const active = index <= currentStep; return <div key={step} className="flex w-1/5 flex-col items-center text-center"><div className={`relative z-10 flex size-9 items-center justify-center rounded-full ${active ? "bg-[#249fd3] text-white" : "bg-[#e3e9f0] text-[#8a97a7]"}`}>{active ? <BadgeCheck size={18} /> : <Clock3 size={16} />}</div><span className={`mt-2 text-[10px] font-black sm:text-xs ${active ? "text-[#249fd3]" : "text-[#8a97a7]"}`}>{stepLabels[step]}</span></div>})}</div><div className="col-span-5 mx-[10%] -mt-[50px] mb-10 h-1 bg-[#e3e9f0]"><div className="h-full bg-[#249fd3] transition-all" style={{ width: `${Math.max(0, currentStep) / (activeOrderSteps.length - 1) * 100}%` }} /></div></div>}
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-[20px] border border-[#e1e7ef] bg-white"><div className="border-b border-[#e8edf3] px-6 py-5"><h2 className="font-black text-[#183353]">Productos del pedido</h2></div><div className="divide-y divide-[#e8edf3]">{order.items.map((item) => <div key={item.id} className="flex items-center gap-4 p-5 sm:p-6"><div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#eaf7fc] text-[#249fd3]"><PackageCheck size={22} /></div><div className="min-w-0 flex-1"><Link to={`/products/${item.product_slug}`} className="font-black text-[#102a4e] hover:text-[#249fd3]">{item.product_name}</Link><p className="mt-1 text-xs text-[#7b8999]">SKU: {item.product_sku} · {item.quantity} × {formatPrice(item.unit_price)}</p></div><p className="font-black text-[#071d41]">{formatPrice(item.subtotal)}</p></div>)}</div></section>

          <div className="space-y-6">
            <PaymentReceiptPanel order={order} />
            <aside className="rounded-[20px] border border-[#e1e7ef] bg-white p-6"><h2 className="flex items-center gap-2 font-black text-[#183353]"><ReceiptText size={19} className="text-[#249fd3]" /> Resumen</h2><div className="mt-5 space-y-3 text-sm text-[#637286]"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between"><span>Envío</span><span>{Number(order.shipping_cost) === 0 ? "Gratis" : formatPrice(order.shipping_cost)}</span></div><div className="flex justify-between border-t border-[#e1e7ef] pt-4 text-base font-black text-[#071d41]"><span>Total</span><span>{formatPrice(order.total)}</span></div></div><div className="mt-5 rounded-xl bg-[#f3f7fd] p-4 text-xs text-[#52647a]"><strong className="block text-[#183353]">Método de pago</strong><span className="mt-1 block">{order.payment_method_display}</span></div></aside>
            <aside className="rounded-[20px] border border-[#e1e7ef] bg-white p-6"><h2 className="flex items-center gap-2 font-black text-[#183353]"><MapPin size={19} className="text-[#249fd3]" /> Entrega</h2><p className="mt-4 text-sm font-black text-[#334862]">{order.recipient_name}</p><p className="mt-2 text-sm leading-6 text-[#637286]">{order.address}<br />{order.district}, {order.province}<br />{order.department}<br />Tel. {order.recipient_phone}</p>{order.address_reference && <p className="mt-3 text-xs text-[#7b8999]">Referencia: {order.address_reference}</p>}</aside>
            <a href={`https://wa.me/51954107191?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#20a764] px-5 py-3.5 text-sm font-black text-white hover:bg-[#178b51]"><Headphones size={18} /> Consultar pedido</a>
          </div>
        </div>
      </div>
    </main>
  );
}
