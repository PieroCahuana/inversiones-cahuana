import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Cpu,
  Headphones,
  Laptop,
  MapPin,
  Monitor,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import { getProducts } from "../../api/products";
import { getActiveBanners } from "../../api/commerce";
import heroCommerce from "../../assets/hero-commerce-v2.png";
import { ProductCard } from "../../components/products/ProductCard";

const categories = [
  { title: "Laptops", subtitle: "Trabajo y estudio", href: "/products?category=laptops", icon: Laptop, accent: "bg-[#e8f0ff] text-[#249fd3]" },
  { title: "Computadoras", subtitle: "Potencia para tu negocio", href: "/products?category=pcs", icon: Cpu, accent: "bg-[#e8f8f2] text-[#078252]" },
  { title: "All in One", subtitle: "Diseño y eficiencia", href: "/products?category=all-in-one", icon: Monitor, accent: "bg-[#fff1e8] text-[#e55f1d]" },
  { title: "Monitores", subtitle: "Más espacio visual", href: "/products?category=monitores", icon: Monitor, accent: "bg-[#f1ebff] text-[#7043c4]" },
];

const benefits = [
  { icon: ShieldCheck, title: "Compra segura", description: "Equipos revisados" },
  { icon: Headphones, title: "Asesoría experta", description: "Atención personalizada" },
  { icon: Truck, title: "Entrega coordinada", description: "En Lima Metropolitana" },
  { icon: Wrench, title: "Soporte técnico", description: "Antes y después de comprar" },
];

const brands = ["DELL", "LENOVO", "HP", "ASUS", "ACER", "LG", "SAMSUNG"];

export function HomePage() {
  const productsQuery = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => getProducts({ featured: true, page_size: 8 }),
  });
  const products = productsQuery.data?.results;
  const bannersQuery = useQuery({ queryKey: ["active-banners"], queryFn: getActiveBanners, staleTime: 60_000 });
  const banner = bannersQuery.data?.[0];

  return (
    <main className="bg-white">
      <section className="site-container pt-5 sm:pt-7">
        <div className="relative min-h-[500px] overflow-hidden rounded-[22px] bg-[#edf5ff] lg:min-h-[540px]">
          <img src={banner?.image_url || heroCommerce} alt={banner?.title || "Laptops, computadoras y monitores"} className="absolute inset-0 size-full object-cover object-center" />
          <div className="absolute inset-0 bg-white/90 lg:bg-gradient-to-r lg:from-white lg:via-white/65 lg:to-transparent" />
          <div className="relative flex min-h-[500px] max-w-[670px] flex-col justify-center px-7 py-14 sm:px-12 lg:min-h-[540px] lg:px-16">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ffeb72] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#102c57]">
              <Sparkles size={15} /> Renueva tu tecnología
            </span>
            <h1 className="mt-6 text-balance text-5xl font-black leading-[0.98] tracking-[-0.05em] text-[#071d41] sm:text-6xl lg:text-[68px]">
              {banner?.title || "Equipos que siguen tu ritmo."}
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-7 text-[#566579] sm:text-lg">
              {banner?.subtitle || "Laptops, computadoras y monitores seleccionados para trabajar, estudiar y hacer crecer tu negocio."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={banner?.link || "/products"} className="inline-flex items-center gap-2 rounded-xl bg-[#249fd3] px-6 py-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(36,159,211,0.25)] transition hover:-translate-y-0.5 hover:bg-[#167fac]">
                {banner?.button_text || "Ver catálogo"} <ArrowRight size={18} />
              </Link>
              <a href="https://wa.me/51954107191?text=Hola%2C%20quisiera%20asesoría%20para%20elegir%20un%20equipo." target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#cbd7e6] bg-white/90 px-6 py-4 text-sm font-black text-[#16345f] transition hover:border-[#249fd3] hover:text-[#249fd3]">
                Hablar con un asesor <ChevronRight size={18} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-[#68788d]">
              <span className="flex items-center gap-2"><BadgeCheck size={17} className="text-[#0b9b64]" /> Equipos verificados</span>
              <span className="flex items-center gap-2"><BadgeCheck size={17} className="text-[#0b9b64]" /> Atención en Lima</span>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container relative z-10 -mt-1 sm:-mt-5">
        <div className="grid overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white shadow-[0_15px_45px_rgba(13,38,76,0.1)] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className={`flex items-center gap-4 px-6 py-5 ${index ? "border-t border-[#e8edf3] sm:border-l sm:border-t-0" : ""}`}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7fc] text-[#249fd3]"><Icon size={21} /></div>
              <div><p className="text-sm font-black text-[#152b4a]">{title}</p><p className="mt-1 text-xs text-[#7a8797]">{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Compra por categoría</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#071d41] sm:text-4xl">Encuentra lo que necesitas</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-black text-[#249fd3] hover:underline sm:flex">Ver todo <ArrowRight size={17} /></Link>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ title, subtitle, href, icon: Icon, accent }) => (
            <Link key={title} to={href} className="group rounded-[22px] border border-[#e2e8f0] bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#b9cae4] hover:shadow-[0_18px_45px_rgba(17,55,107,0.11)]">
              <div className={`mx-auto flex aspect-[4/3] items-center justify-center rounded-2xl ${accent}`}>
                <Icon size={72} strokeWidth={1.25} className="transition duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-5 text-lg font-black text-[#132b4c]">{title}</h3>
              <p className="mt-1 text-sm text-[#7a8797]">{subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#249fd3]">Ver productos <ChevronRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e3e9f0] bg-[#f7f9fc] py-6">
        <div className="site-container flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8b97a7]">Marcas que encuentras</span>
          {brands.map((brand) => <span key={brand} className="text-lg font-black tracking-[0.1em] text-[#6e7b8d] transition hover:text-[#249fd3]">{brand}</span>)}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Recomendados para ti</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#071d41] sm:text-4xl">Productos destacados</h2>
              <p className="mt-3 max-w-2xl text-[#6c798a]">Equipos elegidos por su rendimiento, confiabilidad y relación precio-calidad.</p>
            </div>
            <Link to="/products" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white hover:bg-[#167fac]">Catálogo completo <ArrowRight size={17} /></Link>
          </div>

          {productsQuery.isPending && <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[460px] animate-pulse rounded-2xl bg-[#edf1f6]" />)}</div>}
          {productsQuery.isError && <div className="mt-9 rounded-2xl border border-[#f0d5d0] bg-[#fff7f5] p-10 text-center"><ShoppingBag className="mx-auto text-[#d86a54]" /><p className="mt-4 font-black text-[#8f3f31]">No pudimos cargar los productos.</p><p className="mt-2 text-sm text-[#a66559]">El catálogo aparecerá cuando el servidor esté disponible.</p></div>}
          {products && products.length > 0 && <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
          {products?.length === 0 && <div className="mt-9 rounded-2xl border border-dashed border-[#cad4e1] bg-[#f8fafc] p-12 text-center"><ShoppingBag className="mx-auto text-[#9ba8b8]" /><p className="mt-4 font-black text-[#334862]">Pronto tendremos productos destacados.</p></div>}
        </div>
      </section>

      <section id="soporte" className="site-container pb-20">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="relative overflow-hidden rounded-[24px] bg-[#249fd3] p-8 text-white lg:col-span-2 sm:p-10">
            <div className="absolute -right-12 -top-20 size-64 rounded-full bg-[#5f91f2] blur-[70px]" />
            <div className="relative max-w-2xl">
              <Wrench size={29} />
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#bcd1ff]">Soporte técnico</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Tu equipo también merece un buen respaldo.</h2>
              <p className="mt-4 max-w-xl leading-7 text-[#dbe6ff]">Diagnóstico, mantenimiento preventivo y asistencia especializada para laptops y computadoras.</p>
              <a href="https://wa.me/51954107191?text=Hola%2C%20necesito%20información%20sobre%20soporte%20técnico." target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#249fd3] hover:bg-[#ffd500] hover:text-[#071d41]">Solicitar soporte <ArrowRight size={17} /></a>
            </div>
          </article>
          <article className="rounded-[24px] border border-[#e1e7ef] bg-[#f7f9fc] p-8 sm:p-10">
            <MapPin size={29} className="text-[#249fd3]" />
            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Visítanos</p>
            <h3 className="mt-3 text-2xl font-black text-[#102a4e]">Estamos en Lima</h3>
            <p className="mt-4 text-sm leading-7 text-[#6c798a]">Jr. Leticia 949, Stand 109<br />Jr. Leticia 948, Stand 29B<br />Cercado de Lima</p>
          </article>
        </div>
      </section>
    </main>
  );
}
