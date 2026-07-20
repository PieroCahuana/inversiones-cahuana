import logo from "../../assets/logo-inversiones-cahuana.png";

interface BrandLogoProps {
  compact?: boolean;
  lightText?: boolean;
}

export function BrandLogo({
  compact = false,
  lightText = false,
}: BrandLogoProps) {
  const primaryTextClass = lightText
    ? "text-white"
    : "text-[#071d41]";

  const secondaryTextClass = lightText
    ? "text-zinc-300"
    : "text-[#1454d8]";

  return (
    <div className="flex items-center gap-3.5">
      <div
        className={`shrink-0 overflow-hidden rounded-full bg-black ring-1 ring-black/10 ${
          compact ? "size-10" : "size-12"
        }`}
      >
        <img
          src={logo}
          alt="Logo de Inversiones Cahuana"
          className="size-full object-cover"
        />
      </div>

      {!compact && (
        <div className="leading-none">
          <p
            className={`text-[11px] font-black tracking-[0.22em] ${primaryTextClass}`}
          >
            INVERSIONES
          </p>

          <p
            className={`mt-1.5 text-base font-medium tracking-[0.3em] ${secondaryTextClass}`}
          >
            CAHUANA
          </p>
        </div>
      )}
    </div>
  );
}
