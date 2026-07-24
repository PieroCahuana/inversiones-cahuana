import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BadgeCheck,
  ChevronRight,
  Headphones,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { addCartItem } from "../../api/cart";
import { getProduct, getProducts } from "../../api/products";
import { ProductCard } from "../../components/products/ProductCard";
import { ProductGallery } from "../../components/products/ProductGallery";
import { useAuth } from "../../hooks/useAuth";
import type { ProductSummary } from "../../types/product";

const conditionLabels: Record<ProductSummary["condition"], string> = {
  new: "Nuevo",
  refurbished: "Reacondicionado",
  used: "Seminuevo",
};

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(Number(value));
}

function formatSpecificationName(value: string) {
  const text = value.replaceAll("_", " ").replaceAll("-", " ");
  return text.charAt(0).toLocaleUpperCase("es-PE") + text.slice(1);
}

function formatSpecificationValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${formatSpecificationName(key)}: ${String(item)}`).join(" · ");
  return String(value);
}

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  });
  const product = productQuery.data;

  const relatedQuery = useQuery({
    queryKey: ["products", "related", product?.category.slug],
    queryFn: () => getProducts({ category: product!.category.slug, page_size: 5 }),
    enabled: Boolean(product?.category.slug),
  });

  const relatedProducts = useMemo(
    () => relatedQuery.data?.results.filter((item) => item.id !== product?.id).slice(0, 4) ?? [],
    [relatedQuery.data, product?.id],
  );

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} | Inversiones Cahuana`;
    setQuantity(1);
    setCartMessage("");
    return () => { document.title = "Inversiones Cahuana"; };
  }, [product]);

  const cartMutation = useMutation({
    mutationFn: () => addCartItem(product!.id, quantity),
    onSuccess: (response) => {
      setCartMessage(response.message);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login", { state: { from: `/products/${slug}` } });
        return;
      }
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
      setCartMessage(Array.isArray(detail) ? detail.join(" ") : typeof detail === "string" ? detail : "No pudimos agregar el producto. Revisa el stock e inténtalo otra vez.");
    },
  });

  function addProductToCart() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${slug}` } });
      return;
    }
    cartMutation.mutate();
  }

  if (productQuery.isPending) {
    return (
      <main className="site-container py-10">
        <div className="h-5 w-72 animate-pulse rounded bg-[#e7edf4]" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2"><div className="aspect-square animate-pulse rounded-[24px] bg-[#eaf0f6]" /><div className="space-y-5 pt-5">{["w-32", "w-full", "w-2/3", "w-1/2", "w-full"].map((width, index) => <div key={index} className={`h-8 ${width} animate-pulse rounded bg-[#eaf0f6]`} />)}</div></div>
      </main>
    );
  }

  if (productQuery.isError || !product) {
    const isNotFound = axios.isAxiosError(productQuery.error) && productQuery.error.response?.status === 404;
    return (
      <main className="site-container py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#eaf7fc] text-[#249fd3]"><PackageCheck size={34} /></div>
        <h1 className="mt-6 text-3xl font-black text-[#102a4e]">{isNotFound ? "Este producto ya no está disponible" : "No pudimos cargar el producto"}</h1>
        <p className="mx-auto mt-3 max-w-lg text-[#6c798a]">{isNotFound ? "Puede haber cambiado de dirección o haber sido retirado del catálogo." : "Comprueba tu conexión e inténtalo nuevamente."}</p>
        <div className="mt-7 flex justify-center gap-3"><Link to="/products" className="rounded-xl bg-[#249fd3] px-5 py-3 text-sm font-black text-white">Volver al catálogo</Link>{!isNotFound && <button type="button" onClick={() => productQuery.refetch()} className="rounded-xl border border-[#d8e1ec] px-5 py-3 text-sm font-black text-[#334862]">Reintentar</button>}</div>
      </main>
    );
  }

  const discountPercentage = product.has_discount
    ? Math.round((1 - Number(product.current_price) / Number(product.price)) * 100)
    : 0;
  const whatsappMessage = encodeURIComponent(`Hola, quisiera información sobre ${product.name} (${product.sku}). Cantidad: ${quantity}.`);
  const specifications = Object.entries(product.specifications ?? {});

  return (
    <main className="bg-white">
      <div className="site-container py-5">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#7b8999]">
          <Link to="/" className="hover:text-[#249fd3]">Inicio</Link><ChevronRight size={13} />
          <Link to="/products" className="hover:text-[#249fd3]">Productos</Link><ChevronRight size={13} />
          <Link to={`/products?category=${product.category.slug}`} className="hover:text-[#249fd3]">{product.category.name}</Link><ChevronRight size={13} />
          <span className="max-w-[260px] truncate text-[#334862]">{product.name}</span>
        </nav>
      </div>

      <section className="site-container grid gap-9 pb-14 pt-3 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eaf7fc] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#249fd3]">{product.brand.name}</span>
            <span className="rounded-full bg-[#f0f3f7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#52647a]">{conditionLabels[product.condition]}</span>
            {product.has_discount && <span className="rounded-full bg-[#ff5a36] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">-{discountPercentage}%</span>}
          </div>

          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.04] tracking-[-0.045em] text-[#071d41] sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-[#8a97a7]">SKU: {product.sku}</p>
          <p className="mt-5 text-base leading-7 text-[#637286]">{product.short_description}</p>

          <div className="mt-7 border-y border-[#e3e9f0] py-6">
            {product.has_discount && <div className="flex items-center gap-3"><span className="text-sm text-[#8a97a7] line-through">{formatPrice(product.price)}</span><span className="rounded-md bg-[#fff0ec] px-2 py-1 text-xs font-black text-[#d84f31]">Ahorras {formatPrice(String(Number(product.price) - Number(product.current_price)))}</span></div>}
            <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="text-4xl font-black tracking-[-0.04em] text-[#071d41]">{formatPrice(product.current_price)}</p>
              <span className="pb-1 text-xs font-semibold text-[#8a97a7]">IGV incluido</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-black">
            <span className={`size-2.5 rounded-full ${product.is_in_stock ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className={product.is_in_stock ? "text-emerald-700" : "text-red-600"}>{product.is_in_stock ? `${product.stock} unidades disponibles` : "Producto agotado"}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-13 w-fit items-center rounded-xl border border-[#d8e1ec] bg-white">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Reducir cantidad" className="flex h-full w-12 items-center justify-center text-[#52647a] disabled:opacity-30"><Minus size={17} /></button>
              <span className="w-10 text-center text-sm font-black text-[#102a4e]">{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} disabled={quantity >= product.stock} aria-label="Aumentar cantidad" className="flex h-full w-12 items-center justify-center text-[#52647a] disabled:opacity-30"><Plus size={17} /></button>
            </div>
            <button type="button" disabled={!product.is_in_stock || cartMutation.isPending} onClick={addProductToCart} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-[#249fd3] px-6 text-sm font-black text-white shadow-[0_10px_25px_rgba(36,159,211,0.22)] transition hover:bg-[#167fac] disabled:cursor-not-allowed disabled:bg-[#aeb9c8]">
              <ShoppingCart size={19} /> {cartMutation.isPending ? "Agregando..." : "Agregar al carrito"}
            </button>
          </div>
          {cartMessage && <p role="status" className={`mt-3 rounded-xl px-4 py-3 text-sm font-bold ${cartMutation.isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{cartMessage}</p>}

          <a href={`https://wa.me/51954107191?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#20a764] bg-white px-6 text-sm font-black text-[#168250] transition hover:bg-[#ecfff5]">
            <Headphones size={19} /> Consultar este equipo por WhatsApp
          </a>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[{ icon: ShieldCheck, text: "Equipo revisado" }, { icon: Truck, text: "Entrega coordinada" }, { icon: BadgeCheck, text: "Asesoría incluida" }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-2 rounded-xl bg-[#f5f8fc] px-3 py-3 text-xs font-bold text-[#52647a]"><Icon size={17} className="shrink-0 text-[#249fd3]" />{text}</div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e1e7ef] bg-[#f7f9fc] py-14 sm:py-16">
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <article>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Descripción</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#102a4e]">Conoce mejor este equipo</h2>
            <p className="mt-5 whitespace-pre-line leading-8 text-[#637286]">{product.description}</p>
          </article>

          <article>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Ficha técnica</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#102a4e]">Especificaciones</h2>
            {specifications.length > 0 ? (
              <dl className="mt-6 overflow-hidden rounded-[18px] border border-[#dfe7f0] bg-white">
                {specifications.map(([name, value], index) => <div key={name} className={`grid gap-1 px-5 py-4 sm:grid-cols-[190px_1fr] ${index ? "border-t border-[#e8edf3]" : ""}`}><dt className="text-sm font-black text-[#334862]">{formatSpecificationName(name)}</dt><dd className="text-sm leading-6 text-[#637286]">{formatSpecificationValue(value)}</dd></div>)}
              </dl>
            ) : <div className="mt-6 rounded-[18px] border border-dashed border-[#cbd6e2] bg-white p-8 text-center text-sm text-[#718094]">Las especificaciones detalladas estarán disponibles próximamente.</div>}
          </article>
        </div>
      </section>

      {(relatedQuery.isPending || relatedProducts.length > 0) && (
        <section className="site-container py-16 lg:py-20">
          <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">También podría interesarte</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#071d41] sm:text-4xl">Productos relacionados</h2></div><Link to={`/products?category=${product.category.slug}`} className="hidden items-center gap-2 text-sm font-black text-[#249fd3] hover:underline sm:flex">Ver categoría <ChevronRight size={17} /></Link></div>
          {relatedQuery.isPending ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[460px] animate-pulse rounded-[20px] bg-[#eaf0f6]" />)}</div> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>}
        </section>
      )}
    </main>
  );
}
