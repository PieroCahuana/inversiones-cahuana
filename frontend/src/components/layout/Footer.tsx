import {
  ExternalLink,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import { BrandLogo } from "../common/BrandLogo";
import { useStoreSettings } from "../../hooks/useStoreSettings";

const shopLinks = [
  {
    label: "Laptops",
    href: "/products?category=laptops",
  },
  {
    label: "PCs",
    href: "/products?category=pcs",
  },
  {
    label: "All in One",
    href: "/products?category=all-in-one",
  },
  {
    label: "Monitores",
    href: "/products?category=monitores",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useStoreSettings();

  return (
    <footer className="bg-[#071d41] text-white">
      <div className="site-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <BrandLogo lightText />

          <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">
            Venta de laptops, computadoras y equipos tecnológicos,
            acompañada de soporte técnico especializado.
          </p>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-white">
            Tu socio tecnológico de confianza
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-300">
            Productos
          </h2>

          <nav className="mt-5 flex flex-col gap-3">
            {shopLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-300">
            Contacto
          </h2>

          <div className="mt-5 space-y-4">
            <a
              href={`tel:+${settings?.phone || "51954107191"}`}
              className="flex items-start gap-3 text-sm text-zinc-400 transition hover:text-white"
            >
              <Phone
                size={18}
                className="mt-0.5 shrink-0"
              />
              {settings?.phone || "+51 954 107 191"}
            </a>

            <div className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span className="whitespace-pre-line">{settings?.address || "Jr. Leticia 949, Stand 109\nJr. Leticia 948, Stand 29B\nCercado de Lima"}</span>
            </div>

            <div className="flex items-start gap-3 text-sm text-zinc-400">
              <Wrench
                size={18}
                className="mt-0.5 shrink-0"
              />
              {settings?.support_text || "Soporte técnico especializado"}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-300">
            Redes sociales
          </h2>

          <a
            href={settings?.facebook_url || "https://www.facebook.com/61591996100219/"}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
          >
            <ExternalLink size={19} />
            Visitar Facebook
          </a>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            Propietario:
            <br />
            <strong className="text-[#a8c6ff]">
              Rubén Cahuana
            </strong>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Inversiones Cahuana. Todos los derechos
            reservados.
          </p>

          <p>
            Tecnología que transforma vidas.
          </p>
        </div>
      </div>
    </footer>
  );
}
