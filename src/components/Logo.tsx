import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex flex-col items-center leading-none ${className}`}
      aria-label="ZEDLUXE ORIGINALS home"
    >
      <span className="text-[22px] font-bold tracking-logo text-white sm:text-[25px]">
        ZEDLUXE
      </span>
      <span className="mt-1 text-[8px] tracking-logo-sub text-white sm:text-[9px]">
        ORIGINALS
      </span>
    </Link>
  );
}
