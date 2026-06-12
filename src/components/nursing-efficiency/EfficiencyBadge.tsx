import { cn } from "@/lib/utils/style";
import { getEfficiencyTier } from "@/lib/nursing-efficiency/utils";

type Props = {
  percent: number;
  className?: string;
};

const TIER_CLASSES = {
  high: "border-vivenowgreen text-vivenowgreen",
  medium: "border-vivenowyellow text-vivenowyellow",
  low: "border-vivenowred text-vivenowred",
  none: "border-gray-300 text-gray-500",
} as const;

export default function EfficiencyBadge({ percent, className }: Props) {
  const tier = getEfficiencyTier(percent);
  const label = percent <= 0 ? "0%" : `${Math.round(percent)}%`;

  return (
    <span
      className={cn(
        "inline-flex min-w-[3.5rem] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TIER_CLASSES[tier],
        className
      )}
    >
      {label}
    </span>
  );
}
