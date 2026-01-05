interface HostFormProgressProps {
  current: number;
  total: number;
}

export function HostFormProgress({ current, total }: HostFormProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
      className="h-1 w-full bg-border overflow-hidden"
    >
      <div
        className="h-full bg-foreground transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
