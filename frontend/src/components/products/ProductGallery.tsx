import { ChevronLeft, ChevronRight, ImageIcon, X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";

import type { ProductImage } from "../../types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

function getImageSource(image: ProductImage) {
  return image.image_url || image.image;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [images]);

  const activeImage = images[activeIndex];

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[24px] border border-[#e1e7ef] bg-[#f3f6fa] text-center text-[#8997a8]">
        <div><ImageIcon size={42} className="mx-auto" /><p className="mt-4 text-sm font-bold">Imagen próximamente</p></div>
      </div>
    );
  }

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-[24px] border border-[#e1e7ef] bg-[#f3f6fa]">
        <img src={getImageSource(activeImage)} alt={activeImage.alt_text || productName} className="size-full object-contain p-7 sm:p-10" />
        <button type="button" onClick={() => setLightboxOpen(true)} aria-label="Ampliar imagen" className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-[#dce4ef] bg-white/95 text-[#334862] shadow-sm transition hover:bg-[#1454d8] hover:text-white"><ZoomIn size={19} /></button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label="Imagen anterior" className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#334862] shadow-md opacity-0 transition group-hover:opacity-100"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Imagen siguiente" className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#334862] shadow-md opacity-0 transition group-hover:opacity-100"><ChevronRight size={20} /></button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((image, index) => (
            <button key={image.id} type="button" onClick={() => setActiveIndex(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-[#f5f7fa] transition ${activeIndex === index ? "border-[#1454d8]" : "border-transparent hover:border-[#b9cae4]"}`}>
              <img src={getImageSource(image)} alt={image.alt_text || `${productName}, imagen ${index + 1}`} className="size-full object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#03112b]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Vista ampliada del producto">
          <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Cerrar imagen" className="absolute right-5 top-5 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><X size={24} /></button>
          {images.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Imagen anterior" className="absolute left-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8"><ChevronLeft size={26} /></button>}
          <img src={getImageSource(activeImage)} alt={activeImage.alt_text || productName} className="max-h-[88vh] max-w-[88vw] object-contain" />
          {images.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Imagen siguiente" className="absolute right-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8"><ChevronRight size={26} /></button>}
        </div>
      )}
    </div>
  );
}
