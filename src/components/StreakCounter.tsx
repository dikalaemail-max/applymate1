import { Flame } from "lucide-react";

interface Props {
  streak: number;
}

export function StreakCounter({ streak }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-foreground/5 border border-border/50">
      <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-500" : "text-muted-foreground/40"}`} />
      <span className="text-sm font-bold tabular-nums">{streak}</span>
      <span className="text-xs text-muted-foreground">day streak</span>
    </div>
  );
}
