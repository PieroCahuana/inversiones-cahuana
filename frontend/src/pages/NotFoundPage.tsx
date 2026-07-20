import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-blue-600">
        404
      </p>
      <h1 className="mt-4 text-3xl font-black text-slate-950">
        Página no encontrada
      </h1>
      <Link
        to="/"
        className="mt-8 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
      >
        Volver al inicio
      </Link>
    </main>
  );
}