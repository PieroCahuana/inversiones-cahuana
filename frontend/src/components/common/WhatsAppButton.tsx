import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "51954107191";

const MESSAGE = encodeURIComponent(
  "Hola, vi el catálogo de Inversiones Cahuana y quisiera recibir información sobre sus equipos.",
);

export function WhatsAppButton() {
  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-[#20a764] px-5 py-3.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(15,125,73,0.3)] transition hover:-translate-y-1 hover:bg-[#178b51]"
    >
      <MessageCircle size={21} />
      <span className="hidden sm:inline">
        WhatsApp
      </span>
    </a>
  );
}
