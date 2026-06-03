import Link from "next/link";
import { footerColumns, socialLinks } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#060606]">
      <div className="container-zed pt-14 pb-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-20">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-[20px] font-bold tracking-logo text-white">
              ZEDLUXE
            </p>
            <p className="mt-1 text-[8px] tracking-logo-sub text-white">
              ORIGINALS
            </p>
            <p className="mt-5 max-w-[220px] text-[12px] leading-relaxed text-[#bdbdbd]">
              Quality. Culture. Confidence. This is Zedluxe Originals.
            </p>
            <ul className="mt-6 flex gap-4">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-label text-[#bdbdbd] transition hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] text-[#bdbdbd] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#1f1f1f] pt-6 sm:flex-row sm:items-center">
          <p className="text-[11px] text-soft-muted">
            © {new Date().getFullYear()} ZEDLUXE ORIGINALS. All rights reserved.
          </p>
          <div className="flex gap-2 text-[10px] uppercase tracking-label text-soft-muted">
            <span>Paystack</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Verve</span>
            <span>Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
