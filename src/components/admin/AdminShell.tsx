import Header from "@/components/Header";
import AdminNav from "@/components/admin/AdminNav";
import type { AdminUser } from "@/lib/admin/auth";

/*
  Store-control shell. Desktop-first: a fixed left section nav + the page body.
  All labels are plain store language — no infrastructure or vendor names.
*/
export default function AdminShell({
  admin,
  title,
  eyebrow = "Store Control",
  actions,
  children,
}: {
  admin: AdminUser;
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
              {eyebrow}
            </p>
            <p className="mt-1 truncate text-[12px] text-muted">
              {admin.fullName ?? admin.email}
            </p>
            <AdminNav />
          </aside>

          <section>
            <div className="mb-7 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-serif text-[34px] leading-none text-white md:text-[44px]">
                {title}
              </h1>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
            {children}
          </section>
        </div>
      </main>
    </>
  );
}
