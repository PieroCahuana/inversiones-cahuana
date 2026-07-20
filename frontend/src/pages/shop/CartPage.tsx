import { ArrowRight, Headphones, ShieldCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router";

export function CartPage() {
  return (
    <main className="site-container py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Tu selección</p>
        <h1 className="display-title mt-3 text-5xl font-black text-[#102a4e] sm:text-6xl">Mi carrito</h1>

        <div className="mt-10 grid overflow-hidden rounded-[24px] border border-[#e1e7ef] bg-white shadow-[0_24px_70px_rgba(13,38,76,0.09)] lg:grid-cols-[1fr_360px]">
          <section className="flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-[#edf3ff] text-[#1454d8]">
              <ShoppingBag size={32} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-[#102a4e]">Tu carrito está esperando</h2>
            <p className="mt-3 max-w-md leading-7 text-[#6c798a]">
              Explora el catálogo y guarda aquí los equipos que mejor encajen con tu presupuesto y forma de trabajo.
            </p>
            <Link to="/products" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1454d8] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#0d45bd]">
              Explorar productos <ArrowRight size={17} />
            </Link>
          </section>

          <aside className="bg-[#071d41] p-8 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8fb5ff]">Compra con confianza</p>
            <h2 className="mt-4 text-2xl font-black">Te acompañamos en tu elección.</h2>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#8fb5ff]" size={22} />
                <div><p className="font-bold">Equipos revisados</p><p className="mt-1 text-sm leading-6 text-[#bdb5c7]">Verificamos cada equipo antes de la entrega.</p></div>
              </div>
              <div className="flex gap-4">
                <Headphones className="mt-0.5 shrink-0 text-[#8fb5ff]" size={22} />
                <div><p className="font-bold">Asesoría personalizada</p><p className="mt-1 text-sm leading-6 text-[#bdb5c7]">Resolvemos tus dudas por WhatsApp.</p></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
