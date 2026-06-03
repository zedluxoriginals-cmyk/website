import { benefits } from "@/data/site";
import { benefitIcons } from "./icons";

export default function BenefitsStrip() {
  return (
    <section className="border-y border-[#242424] bg-[#151515]">
      <div className="container-zed grid grid-cols-1 divide-y divide-white/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0">
        {benefits.map((b) => {
          const Icon = benefitIcons[b.icon];
          return (
            <div
              key={b.title}
              className="flex items-center gap-4 px-2 py-6 md:justify-center md:py-0 md:h-[92px]"
            >
              <Icon className="h-[34px] w-[34px] shrink-0 text-white" />
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-nav text-white">
                  {b.title}
                </h3>
                <p className="mt-0.5 text-[12px] text-muted">{b.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
