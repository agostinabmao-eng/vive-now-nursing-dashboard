import { cn } from "@/lib/utils/style";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function Card({ className, children }: Props) {
  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
