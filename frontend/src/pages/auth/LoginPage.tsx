import axios from "axios";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const destination = (location.state as { from?: string } | null)?.from ?? "/";

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const data = new FormData(event.currentTarget);

    try {
      await login(String(data.get("email")), String(data.get("password")));
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && requestError.response?.status === 401
        ? "El correo o la contraseña no son correctos."
        : "No pudimos iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-container py-12 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-[#e1e7ef] bg-white shadow-[0_30px_90px_rgba(13,38,76,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-[#071d41] p-9 text-white sm:p-12">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-[#1454d8]/55 blur-[90px]" />
          <div className="relative flex h-full min-h-[360px] flex-col">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#8fb5ff]"><LockKeyhole size={22} /></div>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-[#8fb5ff]">Área de clientes</p>
            <h1 className="display-title mt-4 text-4xl font-black sm:text-5xl">Todo lo importante, en un solo lugar.</h1>
            <p className="mt-5 leading-7 text-[#b9c8dc]">Accede para consultar tus datos y dar seguimiento a tus compras.</p>
            <div className="mt-auto flex items-center gap-3 pt-10 text-sm font-semibold text-[#dbe7f7]"><ShieldCheck size={19} className="text-[#8fb5ff]" /> Acceso protegido</div>
          </div>
        </aside>

        <section className="p-8 sm:p-12 lg:p-14">
          <p className="eyebrow">Bienvenido</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#102a4e]">Inicia sesión</h2>
          <p className="mt-3 text-sm leading-6 text-[#6c798a]">Ingresa con las credenciales de tu cuenta.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-[#334862]">Correo electrónico</span>
              <input name="email" required type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-[#dce4ef] bg-[#f8fafc] px-4 py-3.5 outline-none transition focus:border-[#1454d8] focus:ring-4 focus:ring-[#1454d8]/10" placeholder="correo@ejemplo.com" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#334862]">Contraseña</span>
              <span className="mt-2 flex items-center rounded-xl border border-[#dce4ef] bg-[#f8fafc] pr-3 transition focus-within:border-[#1454d8] focus-within:ring-4 focus-within:ring-[#1454d8]/10">
                <input name="password" required autoComplete="current-password" type={showPassword ? "text" : "password"} className="w-full bg-transparent px-4 py-3.5 outline-none" placeholder="Tu contraseña" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="rounded-full p-2 text-[#6c798a] hover:bg-[#edf3ff]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="-mt-2 text-right"><Link to="/forgot-password" className="text-xs font-black text-[#1454d8] hover:underline">Olvidé mi contraseña</Link></div>
            <button disabled={isSubmitting} className="w-full rounded-xl bg-[#1454d8] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0d45bd] disabled:opacity-60">
              {isSubmitting ? "Ingresando..." : "Ingresar a mi cuenta"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#6c798a]">¿Todavía no tienes una cuenta? <Link to="/register" state={location.state} className="font-black text-[#1454d8] hover:underline">Regístrate</Link></p>
        </section>
      </div>
    </main>
  );
}
