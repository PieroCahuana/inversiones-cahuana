import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FileCheck2, FileUp, Paperclip } from "lucide-react";
import { type FormEvent, useState } from "react";
import { uploadPaymentReceipt } from "../../api/orders";
import type { Order } from "../../types/order";

const statusClass = { pending: "bg-amber-50 text-amber-700", approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700" };

export function PaymentReceiptPanel({ order }: { order: Order }) {
  const client = useQueryClient(); const [error, setError] = useState(""); const receipt = order.payment_receipt;
  const upload = useMutation({ mutationFn: ({ file, note }: { file: File; note: string }) => uploadPaymentReceipt(order.order_number, file, note), onSuccess: () => client.invalidateQueries({ queryKey: ["order", order.order_number] }), onError: (cause) => setError(axios.isAxiosError(cause) ? JSON.stringify(cause.response?.data) : "No se pudo enviar el comprobante.") });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const file = form.get("file"); if (!(file instanceof File) || !file.size) { setError("Selecciona un archivo."); return; } upload.mutate({ file, note: String(form.get("customer_note") ?? "") }); }
  if (order.payment_method === "cash_on_delivery") return null;
  const showForm = order.payment_status !== "paid" && (!receipt || receipt.status === "rejected");
  return <aside className="rounded-[20px] border border-[#e1e7ef] bg-white p-6"><h2 className="flex items-center gap-2 font-black text-[#183353]"><FileCheck2 size={19} className="text-[#1454d8]" /> Comprobante de pago</h2>{receipt && <div className="mt-4 rounded-xl bg-[#f5f8fc] p-4"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass[receipt.status]}`}>{receipt.status_display}</span><a href={receipt.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-black text-[#1454d8]"><Paperclip size={14} /> Ver archivo</a></div>{receipt.review_note && <p className="mt-3 text-xs leading-5 text-[#65758a]"><strong>Respuesta:</strong> {receipt.review_note}</p>}</div>}{showForm && <form onSubmit={submit} className="mt-4 grid gap-3"><p className="text-xs leading-5 text-[#6f7f92]">{receipt ? "Corrige el comprobante y vuelve a enviarlo." : "Adjunta una captura o PDF para confirmar tu pago."}</p><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#b9c8da] bg-[#f8faff] p-3 text-xs font-bold"><FileUp size={17} /><input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="min-w-0" /></label><input name="customer_note" maxLength={255} placeholder="N.º de operación o nota (opcional)" className="h-10 rounded-xl border border-[#dce4ef] px-3 text-xs outline-none focus:border-[#1454d8]" />{error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}<button disabled={upload.isPending} className="rounded-xl bg-[#1454d8] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{upload.isPending ? "Enviando..." : receipt ? "Enviar nuevo comprobante" : "Enviar comprobante"}</button></form>}</aside>;
}
