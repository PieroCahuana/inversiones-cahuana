import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Package, ReceiptText, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/store";

const iconMap = { order: Package, payment: ReceiptText, inventory: TriangleAlert, system: Bell };

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false); const navigate = useNavigate(); const client = useQueryClient();
  const query = useQuery({ queryKey: ["notifications"], queryFn: getNotifications, refetchInterval: 30_000, staleTime: 10_000 });
  const refresh = () => client.invalidateQueries({ queryKey: ["notifications"] });
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });
  async function openNotification(id: number, link: string) { await markOne.mutateAsync(id); setOpen(false); if (link) navigate(link); }
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notificaciones" className={`relative flex size-10 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-white" : "bg-[#f1f5f9] text-[#334862]"}`}><Bell size={19} />{Boolean(query.data?.unread_count) && <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#ff563f] px-1 text-[9px] font-black leading-5 text-white">{Math.min(query.data?.unread_count ?? 0, 99)}</span>}</button>{open && <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#dce4ed] bg-white text-[#102a4e] shadow-[0_22px_60px_rgba(6,25,53,0.2)]"><div className="flex items-center justify-between border-b border-[#e8edf3] px-4 py-3"><div><p className="text-sm font-black">Notificaciones</p><p className="text-[10px] text-[#7a899a]">{query.data?.unread_count ?? 0} sin leer</p></div><button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-[10px] font-black text-[#1454d8]"><CheckCheck size={14} /> Leer todas</button></div><div className="max-h-96 divide-y divide-[#edf1f5] overflow-y-auto">{query.data?.results.length ? query.data.results.map((notification) => { const Icon = iconMap[notification.notification_type]; return <button key={notification.id} onClick={() => openNotification(notification.id, notification.link)} className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-[#f7f9fc] ${notification.is_read ? "opacity-65" : "bg-[#f3f7ff]"}`}><div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1454d8]"><Icon size={16} /></div><div><p className="text-xs font-black">{notification.title}</p><p className="mt-1 text-[11px] leading-5 text-[#64758a]">{notification.message}</p><p className="mt-1 text-[9px] text-[#94a0ad]">{new Date(notification.created_at).toLocaleString("es-PE")}</p></div></button>; }) : <p className="p-8 text-center text-xs text-[#7c8998]">No tienes notificaciones.</p>}</div></div>}</div>;
}
