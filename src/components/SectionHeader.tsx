import Link from "next/link";

export default function SectionHeader({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-[18px] font-bold uppercase tracking-wide text-white md:text-[20px]">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-[11px] font-semibold uppercase tracking-nav text-muted transition hover:text-white"
        >
          View All
        </Link>
      )}
    </div>
  );
}
