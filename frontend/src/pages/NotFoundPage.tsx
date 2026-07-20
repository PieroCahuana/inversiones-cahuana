import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071d41] px-4 text-center text-white">
      <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1454d8]/35 blur-[130px]" />
      <div className="relative max-w-2xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#8fb5ff]"><Search size={26} /></div>
        <p className="mt-7 text-sm font-black uppercase tracking-[0.35em] text-[#8fb5ff]">Error 404</p>
        <h1 className="display-title mt-4 text-5xl font-black sm:text-7xl">Esta página no está disponible.</h1>
        <p className="mx-auto mt-6 max-w-lg leading-7 text-[#b9c8dc]">La dirección puede haber cambiado o el contenido ya no existe. Volvamos a un lugar conocido.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#071d41] transition hover:bg-[#8fb5ff]">
          <ArrowLeft size={17} /> Volver al inicio
        </Link>
      </div>
    </main>
  );
}
