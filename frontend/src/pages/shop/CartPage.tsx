import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link } from "react-router";

import { clearCart, getCart, removeCartItem, updateCartItem } from "../../api/cart";
import { useAuth } from "../../hooks/useAuth";

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(Number(value));
}

export function CartPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: getCart, enabled: isAuthenticated, retry: false });

  function refreshCart() {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => updateCartItem(itemId, quantity),
    onSuccess: refreshCart,
  });
  const removeMutation = useMutation({ mutationFn: removeCartItem, onSuccess: refreshCart });
  const clearMutation = useMutation({ mutationFn: clearCart, onSuccess: refreshCart });

  if (!isAuthenticated) {
    return (
      <main className="site-container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-[24px] border border-[#e1e7ef] bg-white px-7 py-14 text-center shadow-[0_24px_70px_rgba(13,38,76,0.09)]">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#edf3ff] text-[#1454d8]"><LockKeyhole size={32} /></div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-[#102a4e]">Inicia sesión para ver tu carrito</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#6c798a]">Tu selección se guarda de forma segura en tu cuenta y estará disponible cuando regreses.</p>
          <Link to="/login" state={{ from: "/cart" }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1454d8] px-6 py-3.5 text-sm font-black text-white hover:bg-[#0d45bd]">Iniciar sesión <ArrowRight size={17} /></Link>
        </div>
      </main>
    );
  }

  if (cartQuery.isPending) {
    return <main className="site-container flex min-h-[520px] items-center justify-center"><div className="text-center"><LoaderCircle size={36} className="mx-auto animate-spin text-[#1454d8]" /><p className="mt-4 text-sm font-bold text-[#6c798a]">Cargando tu carrito...</p></div></main>;
  }

  if (cartQuery.isError) {
    const unauthorized = axios.isAxiosError(cartQuery.error) && [401, 403].includes(cartQuery.error.response?.status ?? 0);
    return (
      <main className="site-container py-16 text-center">
        <div className="mx-auto max-w-xl rounded-[24px] border border-[#f0d5d0] bg-[#fff7f5] p-10">
          <h1 className="text-2xl font-black text-[#7c382c]">{unauthorized ? "Tu sesión necesita renovarse" : "No pudimos cargar el carrito"}</h1>
          <p className="mt-3 text-sm leading-6 text-[#9d6157]">{unauthorized ? "Vuelve a iniciar sesión para continuar con tu compra." : "Comprueba la conexión con el servidor e inténtalo nuevamente."}</p>
          {unauthorized ? <Link to="/login" state={{ from: "/cart" }} className="mt-6 inline-flex rounded-xl bg-[#1454d8] px-5 py-3 text-sm font-black text-white">Iniciar sesión</Link> : <button type="button" onClick={() => cartQuery.refetch()} className="mt-6 rounded-xl bg-[#1454d8] px-5 py-3 text-sm font-black text-white">Reintentar</button>}
        </div>
      </main>
    );
  }

  const cart = cartQuery.data;

  if (!cart.items.length) {
    return (
      <main className="site-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-[#e1e7ef] bg-white px-6 py-14 text-center shadow-[0_24px_70px_rgba(13,38,76,0.09)]">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#edf3ff] text-[#1454d8]"><ShoppingBag size={32} /></div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-[#102a4e]">Tu carrito está vacío</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#6c798a]">Explora el catálogo y agrega los equipos que mejor encajen con tus necesidades.</p>
          <Link to="/products" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1454d8] px-6 py-3.5 text-sm font-black text-white hover:bg-[#0d45bd]">Explorar productos <ArrowRight size={17} /></Link>
        </div>
      </main>
    );
  }

  const mutationError = updateMutation.error || removeMutation.error || clearMutation.error;
  const whatsappMessage = encodeURIComponent([
    "Hola, quisiera finalizar la compra de:",
    ...cart.items.map((item) => `• ${item.quantity} × ${item.product.name} — ${formatPrice(item.subtotal)}`),
    `Subtotal: ${formatPrice(cart.subtotal)}`,
  ].join("\n"));

  return (
    <main className="bg-[#f7f9fc] py-10 sm:py-14">
      <div className="site-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1454d8]">Tu selección</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-[#071d41] sm:text-5xl">Mi carrito</h1><p className="mt-2 text-sm text-[#6c798a]">{cart.total_items} {cart.total_items === 1 ? "producto" : "productos"} en tu carrito</p></div>
          <Link to="/products" className="flex items-center gap-2 text-sm font-black text-[#1454d8] hover:underline"><ArrowLeft size={16} /> Seguir comprando</Link>
        </div>

        {mutationError && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">No pudimos actualizar el carrito. Revisa el stock disponible e inténtalo otra vez.</div>}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-[20px] border border-[#e1e7ef] bg-white">
            <div className="flex items-center justify-between border-b border-[#e8edf3] px-5 py-4 sm:px-6"><h2 className="font-black text-[#183353]">Productos</h2><button type="button" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending} className="flex items-center gap-1.5 text-xs font-bold text-[#c24d3a] hover:underline disabled:opacity-50"><Trash2 size={14} /> Vaciar carrito</button></div>

            <div className="divide-y divide-[#e8edf3]">
              {cart.items.map((item) => {
                const isUpdating = updateMutation.isPending && updateMutation.variables?.itemId === item.id;
                const isRemoving = removeMutation.isPending && removeMutation.variables === item.id;
                return (
                  <article key={item.id} className={`grid gap-4 p-5 transition sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:p-6 ${isRemoving ? "opacity-45" : ""}`}>
                    <Link to={`/products/${item.product.slug}`} className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#f3f6fa]">
                      {item.product.primary_image ? <img src={item.product.primary_image} alt={item.product.name} className="size-full object-contain p-3" /> : <ImageIcon size={28} className="text-[#9aa7b7]" />}
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1454d8]">{item.product.brand}</p>
                      <Link to={`/products/${item.product.slug}`} className="mt-2 block text-lg font-black leading-6 text-[#102a4e] hover:text-[#1454d8]">{item.product.name}</Link>
                      <p className="mt-1 text-xs font-semibold text-[#8a97a7]">SKU: {item.product.sku}</p>
                      <p className="mt-4 text-sm font-black text-[#334862]">{formatPrice(item.unit_price)} <span className="font-medium text-[#8a97a7]">c/u</span></p>
                      {item.quantity >= item.product.stock && <p className="mt-2 text-xs font-bold text-amber-700">Cantidad máxima disponible</p>}
                    </div>
                    <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                      <button type="button" onClick={() => removeMutation.mutate(item.id)} disabled={removeMutation.isPending} aria-label={`Eliminar ${item.product.name}`} className="text-[#8794a5] transition hover:text-[#d14f38] disabled:opacity-40"><Trash2 size={18} /></button>
                      <div className="flex h-10 items-center rounded-xl border border-[#d8e1ec]">
                        <button type="button" onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1 || isUpdating} aria-label="Reducir cantidad" className="flex h-full w-10 items-center justify-center text-[#52647a] disabled:opacity-30"><Minus size={15} /></button>
                        <span className="w-8 text-center text-sm font-black text-[#102a4e]">{isUpdating ? <LoaderCircle size={14} className="mx-auto animate-spin" /> : item.quantity}</span>
                        <button type="button" onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })} disabled={item.quantity >= item.product.stock || isUpdating} aria-label="Aumentar cantidad" className="flex h-full w-10 items-center justify-center text-[#52647a] disabled:opacity-30"><Plus size={15} /></button>
                      </div>
                      <p className="text-lg font-black text-[#071d41]">{formatPrice(item.subtotal)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="sticky top-[190px] overflow-hidden rounded-[20px] border border-[#dce4ef] bg-white shadow-[0_18px_45px_rgba(13,38,76,0.08)]">
            <div className="bg-[#071d41] px-6 py-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#8fb5ff]">Resumen</p><h2 className="mt-2 text-xl font-black">Resumen de compra</h2></div>
            <div className="p-6">
              <div className="flex justify-between text-sm text-[#637286]"><span>Productos ({cart.total_items})</span><span className="font-bold text-[#334862]">{formatPrice(cart.subtotal)}</span></div>
              <div className="mt-4 flex justify-between text-sm text-[#637286]"><span>Envío</span><span className="font-bold text-[#0b8b58]">A coordinar</span></div>
              <div className="mt-5 border-t border-[#e1e7ef] pt-5"><div className="flex items-end justify-between"><span className="font-black text-[#183353]">Subtotal</span><span className="text-2xl font-black tracking-tight text-[#071d41]">{formatPrice(cart.subtotal)}</span></div><p className="mt-1 text-right text-[10px] text-[#8a97a7]">IGV incluido</p></div>
              <Link to="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1454d8] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#0d45bd]"><ShieldCheck size={18} /> Continuar al checkout</Link>
              <a href={`https://wa.me/51954107191?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9dfca] bg-[#f1fff7] px-5 py-3 text-xs font-black text-[#168250] transition hover:bg-[#e4faee]"><Headphones size={16} /> Comprar con asesoría</a>
              <div className="mt-5 space-y-3 border-t border-[#e8edf3] pt-5 text-xs font-bold text-[#637286]"><p className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#1454d8]" /> Compra asociada a tu cuenta</p><p className="flex items-center gap-2"><Headphones size={16} className="text-[#1454d8]" /> Asesoría antes de confirmar</p></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
