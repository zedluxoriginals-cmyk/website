"use client";

/*
  Size charts with category tabs + inch/cm unit toggle (Phase 5). Pure
  client interaction over static data from src/data/sizeGuide.ts.
*/

import { useState } from "react";
import type { SizeChart } from "@/data/sizeGuide";

type Unit = "in" | "cm";

export default function SizeCharts({ sizeCharts }: { sizeCharts: SizeChart[] }) {
  const [activeTab, setActiveTab] = useState(sizeCharts[0].slug);
  const [unit, setUnit] = useState<Unit>("in");

  const chart = sizeCharts.find((c) => c.slug === activeTab) ?? sizeCharts[0];

  return (
    <div>
      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Size chart categories"
        className="flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4"
      >
        {sizeCharts.map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={activeTab === c.slug}
            onClick={() => setActiveTab(c.slug)}
            className={`text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
              activeTab === c.slug
                ? "text-white underline underline-offset-[6px]"
                : "text-muted hover:text-white"
            }`}
          >
            {c.category}
          </button>
        ))}
      </div>

      {/* Chart header + unit toggle */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
          {chart.category} — Size Chart
        </h2>
        <div className="inline-flex border border-line text-[11px] uppercase tracking-label">
          {(["in", "cm"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`px-3 py-1.5 transition ${
                unit === u ? "bg-white text-black" : "text-muted hover:text-white"
              }`}
            >
              {u === "in" ? "Inches" : "CM"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="bg-charcoal">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-label text-white">
                {unit === "in" ? "Measurement (in)" : "Measurement (cm)"}
              </th>
              {chart.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-label text-white"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <td className="px-4 py-3 text-[12px] uppercase tracking-label text-warm-grey">
                  {r.label}
                </td>
                {(unit === "in" ? r.inches : r.cm).map((cell, i) => (
                  <td key={i} className="px-4 py-3 text-[13px] text-muted">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] text-soft-muted">
        Measurements are garment measurements. For the best fit, measure
        yourself and compare to our charts.
      </p>
    </div>
  );
}
