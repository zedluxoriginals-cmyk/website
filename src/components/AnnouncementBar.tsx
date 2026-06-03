import { getStoreSettings } from "@/lib/api/content";

// Reads the announcement text from store_settings (admin-editable). Falls back
// to the default copy if the DB is unreachable (getStoreSettings handles that).
export default async function AnnouncementBar() {
  const { announcementText } = await getStoreSettings();
  return (
    <div className="flex h-[26px] items-center justify-center border-b border-white/[0.08] bg-black px-4">
      <p className="text-center text-[11px] font-semibold uppercase tracking-nav text-white">
        {announcementText}
      </p>
    </div>
  );
}
