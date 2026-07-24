import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, BadgeCheck, Banknote, Landmark, LoaderCircle, LockKeyhole, MapPin, PackageCheck, Smartphone, Truck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";

import { getCart } from "../../api/cart";
import { checkout } from "../../api/orders";
import { validateCoupon } from "../../api/commerce";
import { useAuth } from "../../hooks/useAuth";
import { useStoreSettings } from "../../hooks/useStoreSettings";
import type { CheckoutData, PaymentMethod } from "../../types/order";
import { calculateCheckoutTotals } from "../../lib/checkout-calculations";

const paymentMethods: Array<{ value: PaymentMethod; label: string; description: string; icon: typeof Landmark }> = [
  { value: "bank_transfer", label: "Transferencia", description: "BCP o Interbank", icon: Landmark },
  { value: "yape", label: "Yape", description: "Pago desde tu celular", icon: Smartphone },
  { value: "plin", label: "Plin", description: "Pago desde tu banco", icon: Smartphone },
  { value: "cash_on_delivery", label: "Contra entrega", description: "Sujeto a coordinación", icon: Banknote },
];

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(Number(value));
}

function getCheckoutError(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response?.data) return "No pudimos crear el pedido. Inténtalo nuevamente.";
  const data = error.response.data as Record<string, string | string[]>;
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first[0] : first || "Revisa los datos de entrega.";
}

export function CheckoutPage() {
  const [couponCode, setCouponCode] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const { data: storeSettings } = useStoreSettings();
  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (order) => {
      queryClient.setQueryData(["cart"], undefined);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate(`/orders/${order.order_number}`, { replace: true, state: { created: true } });
    },
  });
  const couponMutation = useMutation({ mutationFn: validateCoupon });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data: CheckoutData = {
      payment_method: String(form.get("payment_method")) as PaymentMethod,
      recipient_name: String(form.get("recipient_name")),
      recipient_phone: String(form.get("recipient_phone")),
      department: String(form.get("department")),
      province: String(form.get("province")),
      district: String(form.get("district")),
      address: String(form.get("address")),
      address_reference: String(form.get("address_reference")),
      notes: String(form.get("notes")),
      coupon_code: couponMutation.data?.code || "",
    };
    checkoutMutation.mutate(data);
  }

  if (cartQuery.isPending) return <main className="flex min-h-[60vh] items-center justify-center"><LoaderCircle size={36} className="animate-spin text-[#249fd3]" /></main>;

  if (cartQuery.isError) return <main className="site-container py-20 text-center"><h1 className="text-2xl font-black text-[#102a4e]">No pudimos preparar el checkout</h1><button type="button" onClick={() => cartQuery.refetch()} className="mt-5 rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white">Reintentar</button></main>;

  const cart = cartQuery.data;
  if (!cart.items.length) return <main className="site-container py-20 text-center"><PackageCheck size={40} className="mx-auto text-[#249fd3]" /><h1 className="mt-5 text-3xl font-black text-[#102a4e]">Tu carrito está vacío</h1><p className="mt-2 text-[#6c798a]">Agrega productos antes de iniciar el checkout.</p><Link to="/products" className="mt-6 inline-flex rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white">Ir al catálogo</Link></main>;

  const subtotal = Number(cart.subtotal);
  const configuredShipping = Number(storeSettings?.shipping_cost ?? 0);
  const freeMinimum = storeSettings?.free_shipping_minimum ? Number(storeSettings.free_shipping_minimum) : null;
  const couponDiscount = Number(couponMutation.data?.discount_amount ?? 0);
  const totals = calculateCheckoutTotals(subtotal, configuredShipping, freeMinimum, couponDiscount);
  const shippingCost = totals.shipping;
  const checkoutTotal = totals.total;
  const inputClass = "mt-2 w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-4 py-3.5 text-sm outline-none transition focus:border-[#249fd3] focus:ring-4 focus:ring-[#249fd3]/10";

  return (
    <main className="bg-[#f7f9fc] py-9 sm:py-12">
      <div className="site-container">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-black text-[#249fd3] hover:underline"><ArrowLeft size={16} /> Volver al carrito</Link>
        <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Compra segura</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-[#071d41] sm:text-5xl">Finaliza tu pedido</h1></div>

        <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-[20px] border border-[#e1e7ef] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-[#e8edf3] pb-5"><div className="flex size-11 items-center justify-center rounded-xl bg-[#eaf7fc] text-[#249fd3]"><MapPin size={21} /></div><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#249fd3]">Paso 1</p><h2 className="mt-1 text-xl font-black text-[#183353]">Datos de entrega</h2></div></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-[#334862] sm:col-span-2">Nombre del destinatario<input name="recipient_name" required minLength={3} defaultValue={user?.full_name} className={inputClass} placeholder="Nombre completo" /></label>
                <label className="text-sm font-bold text-[#334862]">Teléfono<input name="recipient_phone" required type="tel" inputMode="numeric" pattern="[0-9]{9}" maxLength={9} defaultValue={user?.phone} className={inputClass} placeholder="987654321" /></label>
                <label className="text-sm font-bold text-[#334862]">Departamento<input name="department" required defaultValue="Lima" className={inputClass} /></label>
                <label className="text-sm font-bold text-[#334862]">Provincia<input name="province" required defaultValue="Lima" className={inputClass} /></label>
                <label className="text-sm font-bold text-[#334862]">Distrito<input name="district" required className={inputClass} placeholder="Ej. Cercado de Lima" /></label>
                <label className="text-sm font-bold text-[#334862] sm:col-span-2">Dirección completa<input name="address" required minLength={8} autoComplete="street-address" className={inputClass} placeholder="Av., calle, número, urbanización" /></label>
                <label className="text-sm font-bold text-[#334862] sm:col-span-2">Referencia <span className="font-medium text-[#8a97a7]">(opcional)</span><input name="address_reference" className={inputClass} placeholder="Frente a..., edificio..., piso..." /></label>
              </div>
            </section>

            <section className="rounded-[20px] border border-[#e1e7ef] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-[#e8edf3] pb-5"><div className="flex size-11 items-center justify-center rounded-xl bg-[#eaf7fc] text-[#249fd3]"><Landmark size={21} /></div><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#249fd3]">Paso 2</p><h2 className="mt-1 text-xl font-black text-[#183353]">Método de pago</h2></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {paymentMethods.map(({ value, label, description, icon: Icon }, index) => <label key={value} className="group cursor-pointer"><input type="radio" name="payment_method" value={value} required defaultChecked={index === 0} className="peer sr-only" /><span className="flex items-center gap-3 rounded-2xl border-2 border-[#e1e7ef] p-4 transition peer-checked:border-[#249fd3] peer-checked:bg-[#f3f7ff]"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf7fc] text-[#249fd3]"><Icon size={19} /></span><span><strong className="block text-sm text-[#183353]">{label}</strong><small className="mt-1 block text-[#7b8999]">{description}</small></span></span></label>)}
              </div>
              {storeSettings && (storeSettings.yape_number || storeSettings.plin_number || storeSettings.bank_details) && <div className="mt-5 rounded-2xl bg-[#f3f7fd] p-4 text-xs leading-6 text-[#52647a]"><p className="font-black text-[#183353]">Datos para realizar el pago</p>{storeSettings.yape_number && <p><strong>Yape:</strong> {storeSettings.yape_number} {storeSettings.yape_holder && `· ${storeSettings.yape_holder}`}</p>}{storeSettings.plin_number && <p><strong>Plin:</strong> {storeSettings.plin_number} {storeSettings.plin_holder && `· ${storeSettings.plin_holder}`}</p>}{storeSettings.bank_details && <p className="whitespace-pre-line"><strong>Transferencia:</strong> {storeSettings.bank_details}</p>}</div>}
              <label className="mt-5 block text-sm font-bold text-[#334862]">Observaciones <span className="font-medium text-[#8a97a7]">(opcional)</span><textarea name="notes" rows={3} className={`${inputClass} resize-none`} placeholder="Indicaciones adicionales para tu pedido" /></label>
            </section>
          </div>

          <aside className="sticky top-[190px] overflow-hidden rounded-[20px] border border-[#dce4ef] bg-white shadow-[0_18px_45px_rgba(13,38,76,0.08)]">
            <div className="bg-[#071d41] px-6 py-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#8fb5ff]">Paso 3</p><h2 className="mt-2 text-xl font-black">Revisa tu compra</h2></div>
            <div className="max-h-72 divide-y divide-[#e8edf3] overflow-y-auto px-6">
              {cart.items.map((item) => <div key={item.id} className="flex gap-3 py-4"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3f6fa]">{item.product.primary_image ? <img src={item.product.primary_image} alt="" className="size-full object-contain p-1.5" /> : <PackageCheck size={20} className="text-[#9aa7b7]" />}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-black leading-5 text-[#334862]">{item.product.name}</p><p className="mt-1 text-[11px] text-[#7b8999]">{item.quantity} × {formatPrice(item.unit_price)}</p></div><p className="text-xs font-black text-[#102a4e]">{formatPrice(item.subtotal)}</p></div>)}
            </div>
            <div className="border-t border-[#e1e7ef] p-6">
              <div className="mb-5"><label className="text-xs font-black text-[#334862]">¿Tienes un cupón?</label><div className="mt-2 flex gap-2"><input value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); couponMutation.reset(); }} placeholder="CÓDIGO" className="h-10 min-w-0 flex-1 rounded-xl border border-[#d8e1ec] px-3 text-xs font-black uppercase outline-none focus:border-[#249fd3]" /><button type="button" onClick={() => couponMutation.mutate(couponCode)} disabled={!couponCode.trim() || couponMutation.isPending} className="rounded-xl bg-[#eaf7fc] px-3 text-xs font-black text-[#249fd3] disabled:opacity-50">Aplicar</button></div>{couponMutation.isError && <p className="mt-2 text-[10px] font-bold text-red-600">Cupón inválido, vencido o no aplicable.</p>}{couponMutation.data && <p className="mt-2 text-[10px] font-bold text-emerald-700">Cupón {couponMutation.data.code}: ahorras {formatPrice(couponMutation.data.discount_amount)}</p>}</div>
              <div className="flex justify-between text-sm text-[#637286]"><span>Subtotal</span><span className="font-bold">{formatPrice(cart.subtotal)}</span></div>{couponDiscount > 0 && <div className="mt-3 flex justify-between text-sm text-emerald-700"><span>Descuento</span><span className="font-bold">− {formatPrice(String(couponDiscount))}</span></div>}<div className="mt-3 flex justify-between text-sm text-[#637286]"><span>Envío</span><span className={`font-bold ${shippingCost === 0 ? "text-emerald-700" : ""}`}>{shippingCost === 0 ? "Gratis" : formatPrice(String(shippingCost))}</span></div><div className="mt-5 flex items-end justify-between border-t border-[#e1e7ef] pt-5"><span className="font-black text-[#183353]">Total</span><span className="text-2xl font-black text-[#071d41]">{formatPrice(String(checkoutTotal))}</span></div>
              {checkoutMutation.isError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-xs font-bold text-red-700">{getCheckoutError(checkoutMutation.error)}</p>}
              <button disabled={checkoutMutation.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#249fd3] px-5 py-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(36,159,211,0.22)] hover:bg-[#167fac] disabled:opacity-60">{checkoutMutation.isPending ? <><LoaderCircle size={18} className="animate-spin" /> Creando pedido...</> : <><BadgeCheck size={18} /> Confirmar pedido</>}</button>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#7b8999]"><LockKeyhole size={14} className="text-[#249fd3]" /> Tus datos se envían de forma segura</div>
              <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#7b8999]"><Truck size={14} className="shrink-0 text-[#249fd3]" /> {storeSettings?.checkout_message || "Coordinaremos la entrega contigo"}</div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
