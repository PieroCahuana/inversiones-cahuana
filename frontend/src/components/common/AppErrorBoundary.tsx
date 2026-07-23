import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Unhandled application error", error, info.componentStack); }
  render() {
    if (this.state.hasError) return <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-6"><section className="max-w-lg rounded-3xl border border-[#dfe7ef] bg-white p-9 text-center shadow-xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1454d8]">Inversiones Cahuana</p><h1 className="mt-3 text-3xl font-black text-[#102a4e]">No pudimos mostrar esta sección</h1><p className="mt-3 text-sm leading-6 text-[#6c798a]">Recarga la aplicación. Si el problema continúa, comunícate con soporte.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-[#1454d8] px-5 py-3 text-sm font-black text-white">Recargar aplicación</button></section></main>;
    return this.props.children;
  }
}
