import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function ApplyMateLogo({ className, size = "md" }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn(sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Abstract "A" — two converging lines forming an upward arrow/compass */}
      <path
        d="M20 4L6 36"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 4L34 36"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Crossbar */}
      <path
        d="M11 24H29"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Dot at apex */}
      <circle cx="20" cy="4" r="2.5" fill="currentColor" />
    </svg>
  );
}
