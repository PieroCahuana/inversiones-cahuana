import axios from "axios";
import { BadgeCheck, CalendarDays, Mail, Phone, Save, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useAuth } from "../../hooks/useAuth";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  if (!user) return <div className="site-container py-20 text-center text-sm font-bold text-[#6c798a]">Cargando perfil...</div>;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await updateProfile({ first_name: String(form.get("first_name")), last_name: String(form.get("last_name")), phone: String(form.get("phone")) });
      setIsError(false);
      setMessage("Tus datos se actualizaron correctamente.");
    } catch (error) {
      setIsError(true);
      const data = axios.isAxiosError(error) ? error.response?.data as Record<string, string[]> | undefined : undefined;
      setMessage(data ? Object.values(data).flat()[0] : "No pudimos actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  const memberSince = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(user.created_at));
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase();
  const inputClass = "mt-2 w-full rounded-xl border border-[#d8e1ec] bg-[#f8fafc] px-4 py-3.5 outline-none transition focus:border-[#1454d8] focus:ring-4 focus:ring-[#1454d8]/10";

  return (
    <main className="bg-[#f7f9fc] py-10 sm:py-14">
      <div className="site-container max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1454d8]">Mi cuenta</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-[#071d41] sm:text-5xl">Perfil personal</h1>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white">
            <div className="bg-[#071d41] p-7 text-center text-white"><div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#1454d8] text-2xl font-black">{initials}</div><h2 className="mt-4 text-xl font-black">{user.full_name || user.username}</h2><p className="mt-1 break-all text-sm text-[#b9c8dc]">{user.email}</p></div>
            <div className="space-y-4 p-6 text-sm text-[#637286]"><p className="flex items-center gap-3"><Mail size={17} className="text-[#1454d8]" /> {user.email}</p><p className="flex items-center gap-3"><Phone size={17} className="text-[#1454d8]" /> {user.phone || "Sin teléfono"}</p><p className="flex items-center gap-3 capitalize"><CalendarDays size={17} className="text-[#1454d8]" /> Miembro desde {memberSince}</p><p className="flex items-center gap-3"><BadgeCheck size={17} className={user.is_verified ? "text-emerald-600" : "text-[#8a97a7]"} /> {user.is_verified ? "Cuenta verificada" : "Verificación pendiente"}</p></div>
          </aside>

          <section className="rounded-[20px] border border-[#dfe7f0] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-[#e8edf3] pb-5"><div className="flex size-11 items-center justify-center rounded-xl bg-[#edf3ff] text-[#1454d8]"><UserRound size={21} /></div><div><h2 className="text-xl font-black text-[#183353]">Información personal</h2><p className="mt-1 text-xs text-[#7b8999]">Mantén actualizados tus datos de contacto.</p></div></div>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#334862]">Nombres<input name="first_name" required defaultValue={user.first_name} className={inputClass} /></label>
              <label className="text-sm font-bold text-[#334862]">Apellidos<input name="last_name" required defaultValue={user.last_name} className={inputClass} /></label>
              <label className="text-sm font-bold text-[#334862] sm:col-span-2">Teléfono<input name="phone" required type="tel" inputMode="numeric" pattern="[0-9]{9}" maxLength={9} defaultValue={user.phone} className={inputClass} /></label>
              <label className="text-sm font-bold text-[#8794a5] sm:col-span-2">Correo electrónico<input value={user.email} disabled className={`${inputClass} cursor-not-allowed bg-[#eef2f6]`} /><span className="mt-1.5 block text-[11px] font-medium">El correo de acceso no puede modificarse.</span></label>
              {message && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold sm:col-span-2 ${isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message}</p>}
              <button disabled={isSaving} className="flex items-center justify-center gap-2 rounded-xl bg-[#1454d8] px-5 py-3.5 text-sm font-black text-white hover:bg-[#0d45bd] disabled:opacity-60 sm:col-span-2 sm:justify-self-end"><Save size={17} /> {isSaving ? "Guardando..." : "Guardar cambios"}</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
