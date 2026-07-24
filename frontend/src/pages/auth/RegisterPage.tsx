import axios from "axios";
import { BadgeCheck, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import type { RegisterData } from "../../types/user";

function getRegistrationError(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response?.data) return "No pudimos crear la cuenta. Inténtalo nuevamente.";
  const data = error.response.data as Record<string, string | string[]>;
  const firstError = Object.values(data)[0];
  return Array.isArray(firstError) ? firstError[0] : firstError || "Revisa los datos ingresados.";
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { register, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = (location.state as { from?: string } | null)?.from ?? "/profile";

  if (isAuthenticated) return <Navigate to={destination} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const data: RegisterData = {
      email: String(form.get("email")),
      first_name: String(form.get("first_name")),
      last_name: String(form.get("last_name")),
      phone: String(form.get("phone")),
      password: String(form.get("password")),
      password_confirm: String(form.get("password_confirm")),
    };

    try {
      await register(data);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getRegistrationError(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-[#dce4ef] bg-[#f8fafc] px-4 py-3.5 outline-none transition focus:border-[#249fd3] focus:ring-4 focus:ring-[#249fd3]/10";

  return (
    <main className="site-container py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[24px] border border-[#e1e7ef] bg-white shadow-[0_30px_90px_rgba(13,38,76,0.12)] lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="relative overflow-hidden bg-[#071d41] p-9 text-white sm:p-12">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-[#249fd3]/55 blur-[90px]" />
          <div className="relative flex h-full min-h-[410px] flex-col">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#8fb5ff]"><UserPlus size={22} /></div>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-[#8fb5ff]">Crea tu cuenta</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">Tu compra, organizada y siempre disponible.</h1>
            <div className="mt-8 space-y-4 text-sm font-semibold text-[#dbe7f7]">
              <p className="flex items-center gap-3"><BadgeCheck size={19} className="text-[#8fb5ff]" /> Carrito asociado a tu cuenta</p>
              <p className="flex items-center gap-3"><BadgeCheck size={19} className="text-[#8fb5ff]" /> Seguimiento de tus pedidos</p>
              <p className="flex items-center gap-3"><ShieldCheck size={19} className="text-[#8fb5ff]" /> Información protegida</p>
            </div>
          </div>
        </aside>

        <section className="p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#249fd3]">Registro</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#102a4e]">Crea tu cuenta de cliente</h2>
          <p className="mt-2 text-sm text-[#6c798a]">Completa tus datos para comenzar.</p>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#334862]">Nombres<input name="first_name" required autoComplete="given-name" className={inputClass} placeholder="Tus nombres" /></label>
            <label className="block text-sm font-bold text-[#334862]">Apellidos<input name="last_name" required autoComplete="family-name" className={inputClass} placeholder="Tus apellidos" /></label>
            <label className="block text-sm font-bold text-[#334862] sm:col-span-2">Correo electrónico<input name="email" required type="email" autoComplete="email" className={inputClass} placeholder="correo@ejemplo.com" /></label>
            <label className="block text-sm font-bold text-[#334862] sm:col-span-2">Teléfono<input name="phone" required type="tel" inputMode="numeric" pattern="[0-9]{9}" maxLength={9} autoComplete="tel" className={inputClass} placeholder="987654321" /><span className="mt-1.5 block text-[11px] font-medium text-[#8a97a7]">9 dígitos, sin espacios</span></label>
            <label className="block text-sm font-bold text-[#334862]">Contraseña<span className="mt-2 flex items-center rounded-xl border border-[#dce4ef] bg-[#f8fafc] pr-3 focus-within:border-[#249fd3] focus-within:ring-4 focus-within:ring-[#249fd3]/10"><input name="password" required minLength={8} autoComplete="new-password" type={showPassword ? "text" : "password"} className="w-full bg-transparent px-4 py-3.5 outline-none" placeholder="Mínimo 8 caracteres" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"} className="p-2 text-[#6c798a]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <label className="block text-sm font-bold text-[#334862]">Confirmar contraseña<input name="password_confirm" required minLength={8} autoComplete="new-password" type={showPassword ? "text" : "password"} className={inputClass} placeholder="Repite tu contraseña" /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
            <button disabled={isSubmitting} className="rounded-xl bg-[#249fd3] px-5 py-4 text-sm font-black text-white hover:bg-[#167fac] disabled:opacity-60 sm:col-span-2">{isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-[#6c798a]">¿Ya tienes una cuenta? <Link to="/login" state={location.state} className="font-black text-[#249fd3] hover:underline">Inicia sesión</Link></p>
        </section>
      </div>
    </main>
  );
}
