import { LoaderCircle, Search, X } from "lucide-react";
import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#249fd3]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#102a4e] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6c798a]">{description}</p></div>{action}</div>;
}

export function AdminSearch({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[#dce4ed] bg-white px-3 focus-within:border-[#249fd3]"><Search size={17} className="shrink-0 text-[#8190a3]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium outline-none" /></label>;
}

export function AdminModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#06152d]/65 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e4e9f0] bg-white px-6 py-5"><h2 className="text-xl font-black text-[#102a4e]">{title}</h2><button type="button" onClick={onClose} className="rounded-xl bg-[#f2f5f9] p-2 text-[#5d6c80] hover:bg-[#e7edf5]"><X size={20} /></button></div><div className="p-6">{children}</div></div></div>;
}

export function AdminLoading() { return <div className="flex min-h-72 items-center justify-center"><LoaderCircle className="animate-spin text-[#249fd3]" size={34} /></div>; }
export function AdminEmpty({ children }: { children: ReactNode }) { return <div className="rounded-2xl border border-dashed border-[#ccd7e4] bg-white px-5 py-16 text-center text-sm font-semibold text-[#738196]">{children}</div>; }

export const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-[#dbe3ec] bg-white px-3 text-sm font-medium outline-none transition focus:border-[#249fd3] focus:ring-3 focus:ring-[#249fd3]/10";
export const textareaClass = "mt-1.5 min-h-24 w-full resize-y rounded-xl border border-[#dbe3ec] bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#249fd3] focus:ring-3 focus:ring-[#249fd3]/10";
export const primaryButton = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#249fd3] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(36,159,211,0.2)] transition hover:bg-[#167fac] disabled:opacity-50";
export const secondaryButton = "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d9e2ec] bg-white px-4 text-sm font-bold text-[#334862] transition hover:border-[#b9c9dc] hover:bg-[#f7f9fc]";
