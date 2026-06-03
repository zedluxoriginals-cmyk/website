import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoreSettings } from "@/lib/admin/settings";
import { updateStoreSettings } from "@/app/admin/settings/actions";

export const metadata: Metadata = { title: "Store Settings" };

export default async function AdminSettingsPage() {
  const [admin, settings] = await Promise.all([requireAdmin(), getStoreSettings()]);

  return (
    <AdminShell admin={admin} title="Store Settings" eyebrow="Store Control">
      <form action={updateStoreSettings} className="max-w-2xl space-y-6">
        <Field label="Announcement bar text" hint="Shown across the top of the store. Leave blank to hide.">
          <input name="announcement_text" defaultValue={settings?.announcementText ?? ""} className={inputCls} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Support email" required>
            <input name="support_email" type="email" required defaultValue={settings?.supportEmail ?? ""} className={inputCls} />
          </Field>
          <Field label="Support phone">
            <input name="support_phone" defaultValue={settings?.supportPhone ?? ""} className={inputCls} />
          </Field>
        </div>

        <Field label="Store hours" hint="e.g. Mon–Fri, 9AM – 6PM WAT">
          <input name="store_hours" defaultValue={settings?.storeHours ?? ""} className={inputCls} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Returns window (days)">
            <input name="returns_window_days" type="number" min="0" defaultValue={settings?.returnsWindowDays ?? 14} className={inputCls} />
          </Field>
          <Field label="Free shipping over (₦)">
            <input name="free_shipping_threshold" type="number" min="0" defaultValue={settings?.freeShippingThreshold ?? 150000} className={inputCls} />
          </Field>
        </div>

        <button className="bg-white px-6 py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
          Save changes
        </button>
      </form>
    </AdminShell>
  );
}

const inputCls =
  "h-[46px] w-full border border-[#303030] bg-[#090909] px-3.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-soft-muted">{hint}</span>}
    </label>
  );
}
