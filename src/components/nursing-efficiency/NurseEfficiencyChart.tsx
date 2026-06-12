"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import useResizeObserver from "@/lib/hooks/useResizeObserver";
import { ENROLLMENT_CONTENT_SHELL } from "@/lib/enrollment/styles";
import type { NurseChartSeries } from "@/lib/nursing-efficiency/types";
import { cn } from "@/lib/utils/style";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const NURSE_COLORS = ["#3EB1C8", "#22C55E", "#F0B323"];

type Props = {
  series: NurseChartSeries[];
  className?: string;
};

export default function NurseEfficiencyChart({ series, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(containerRef);

  if (series.length === 0 || series.every((item) => item.points.length === 0)) {
    return (
      <div
        className={cn(
          ENROLLMENT_CONTENT_SHELL,
          "flex w-full items-center justify-center px-4 py-16 text-sm text-[#5F8899]",
          className
        )}
      >
        Select a date range to view efficiency trends.
      </div>
    );
  }

  const weekLabels = series[0]?.points.map((point) => point.weekLabel) ?? [];

  const traces = series.map((item, index) => ({
    x: item.points.map((point) => point.weekLabel),
    y: item.points.map((point) => Math.round(point.efficiencyPercent)),
    type: "scatter" as const,
    mode: "lines+markers" as const,
    name: item.nurseName,
    line: {
      color: NURSE_COLORS[index % NURSE_COLORS.length],
      width: 3,
    },
    marker: { size: 8 },
  }));

  return (
    <div className={cn(ENROLLMENT_CONTENT_SHELL, "w-full overflow-x-auto", className)}>
      <div className="h-[360px] w-full" ref={containerRef}>
        <Plot
          data={traces}
          layout={{
            autosize: true,
            margin: { l: 56, r: 24, t: 24, b: 80 },
            yaxis: {
              title: { text: "Efficiency (%)" },
              tickfont: { size: 14 },
              fixedrange: true,
              rangemode: "tozero",
            },
            xaxis: {
              title: { text: "" },
              tickvals: weekLabels,
              ticktext: weekLabels,
              tickfont: { size: 12 },
              tickangle: -25,
              fixedrange: true,
            },
            legend: {
              orientation: "h",
              y: 1.15,
              x: 0,
              font: { size: 14 },
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
          }}
          useResizeHandler
          config={{
            displayModeBar: false,
            responsive: true,
            scrollZoom: false,
            doubleClick: false,
          }}
          style={{ width: dimensions?.width ?? "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
