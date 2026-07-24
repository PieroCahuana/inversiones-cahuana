import logo from "../../assets/logo-inversiones-cahuana.png";

interface BrandLogoProps {
  compact?: boolean;
  lightText?: boolean;
}

export function BrandLogo({
  compact = false,
  lightText = false,
}: BrandLogoProps) {
  const wordmarkClass = lightText ? "text-[#70d0f2]" : "text-[#249fd3]";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`shrink-0 overflow-hidden rounded-full bg-black ring-2 ring-[#249fd3]/20 ${
          compact ? "size-10" : "size-12"
        }`}
      >
        <img
          src={logo}
          alt="Logo de Inversiones Cahuana"
          className="brand-logo-mark size-full object-cover"
        />
      </div>

      {!compact && (
        <div className={`grid gap-1.5 ${wordmarkClass}`}>
          <p className="text-[13px] font-black leading-none tracking-[0.16em]">
            INVERSIONES
          </p>
          <p className="text-[13px] font-black leading-none tracking-[0.16em]">
            CAHUANA
          </p>
        </div>
      )}
    </div>
  );
}
