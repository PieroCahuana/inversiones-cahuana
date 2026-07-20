import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

import { getProducts } from "../../api/products";
import { ProductCard } from "../../components/products/ProductCard";

const benefits = [
  {
    icon: Truck,
    title: "Envíos seguros",
    description: "Despachos coordinados dentro de Lima.",
  },
  {
    icon: ShieldCheck,
    title: "Equipos garantizados",
    description: "Productos revisados antes de cada entrega.",
  },
  {
    icon: BadgeCheck,
    title: "Calidad comprobada",
    description: "Laptops y equipos seleccionados cuidadosamente.",
  },
  {
    icon: Headphones,
    title: "Atención personalizada",
    description: "Te ayudamos a elegir el equipo correcto.",
  },
];

export function HomePage() {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const featuredProducts = productsQuery.data
    ?.filter((product) => product.is_featured)
    .slice(0, 8);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,0.35),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-5 w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
              Tecnología para trabajar, estudiar y crecer
            </span>

            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Potencia tus ideas con el
              <span className="text-blue-500"> equipo correcto.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Encuentra laptops, PCs, All in One y monitores seleccionados
              para productividad, negocios, estudios y entretenimiento.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500"
              >
                Ver catálogo
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/products?featured=true"
                className="rounded-2xl border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Productos destacados
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-96 items-center justify-center">
            <div className="absolute size-80 rounded-full bg-blue-600/30 blur-3xl" />

            <div className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-300 p-8">
                <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white bg-white/70 text-center shadow-inner">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
                      Inversiones Cahuana
                    </p>
                    <p className="mt-4 text-4xl font-black text-slate-900">
                      Tecnología que impulsa
                    </p>
                    <p className="mt-2 text-slate-500">
                      Laptops · PCs · All in One · Monitores
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex items-start gap-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Selección especial
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Productos destacados
            </h2>
            <p className="mt-3 max-w-2xl text-slate-500">
              Equipos elegidos por rendimiento, confiabilidad y excelente
              relación entre precio y prestaciones.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 font-bold text-blue-600 hover:text-blue-700 sm:flex"
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </div>

        {productsQuery.isPending && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[470px] animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {productsQuery.isError && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-bold text-red-700">
              No fue posible cargar los productos.
            </p>
            <p className="mt-2 text-sm text-red-600">
              Verifica que Django esté ejecutándose en el puerto 8000.
            </p>
          </div>
        )}

        {featuredProducts && featuredProducts.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {featuredProducts?.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            Todavía no hay productos destacados.
          </div>
        )}
      </section>
    </main>
  );
}