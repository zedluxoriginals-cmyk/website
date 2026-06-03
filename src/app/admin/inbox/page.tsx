import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { getMessages, getSubscribers, CONTACT_STATUSES } from "@/lib/admin/inbox";
import { setMessageStatus } from "@/app/admin/inbox/actions";
import { shortDate, dateTime } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Inbox" };

const statusTone: Record<string, "amber" | "blue" | "green" | "grey"> = {
  new: "amber",
  in_review: "blue",
  resolved: "green",
  spam: "grey",
};
const statusLabel: Record<string, string> = {
  new: "New",
  in_review: "In review",
  resolved: "Resolved",
  spam: "Spam",
};

export default async function AdminInboxPage() {
  const [admin, messages, subscribers] = await Promise.all([
    requireAdmin(),
    getMessages(),
    getSubscribers(),
  ]);

  return (
    <AdminShell admin={admin} title="Inbox" eyebrow="Store Control">
      {/* Messages */}
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Messages ({messages.filter((m) => m.status === "new").length} new)
      </p>
      {messages.length === 0 ? (
        <EmptyNote>No messages yet. Customer enquiries land here.</EmptyNote>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="border border-line bg-ink p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white">
                    {m.name}{" "}
                    <span className="font-normal text-soft-muted">· {m.email}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-soft-muted">
                    {m.topic ?? "General"}
                    {m.orderNumber ? ` · ${m.orderNumber}` : ""} · {dateTime(m.createdAt)}
                  </p>
                </div>
                <StatusBadge label={statusLabel[m.status]} tone={statusTone[m.status]} />
              </div>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-off-white/90">
                {m.message}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${m.email}`}
                  className="text-[11px] font-semibold uppercase tracking-label text-white transition hover:opacity-70"
                >
                  Reply by email →
                </a>
                <form action={setMessageStatus} className="flex items-center gap-2">
                  <input type="hidden" name="message_id" value={m.id} />
                  <select
                    name="status"
                    defaultValue={m.status}
                    className="h-[36px] border border-[#303030] bg-[#090909] px-2.5 text-[12px] text-white focus:border-white focus:outline-none"
                  >
                    {CONTACT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                  <button className="h-[36px] border border-line px-3 text-[10px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
                    Update
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Subscribers */}
      <p className="mb-3 mt-10 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Newsletter subscribers ({subscribers.filter((s) => s.isActive).length})
      </p>
      {subscribers.length === 0 ? (
        <EmptyNote>No subscribers yet.</EmptyNote>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead className="bg-ink">
              <tr className="text-[10px] uppercase tracking-label text-soft-muted">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-black">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-[12px] text-white">{s.email}</td>
                  <td className="px-4 py-3 text-[12px] text-muted">{s.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-soft-muted">{s.source ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-soft-muted">{shortDate(s.subscribedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={s.isActive ? "Active" : "Unsubscribed"}
                      tone={s.isActive ? "green" : "grey"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line px-4 py-8 text-[13px] text-soft-muted">
      {children}
    </div>
  );
}
