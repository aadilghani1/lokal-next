interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-primary";
  if (score >= 50) return "text-chart-2";
  return "text-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 88,
  strokeWidth = 6,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const offset = circumference - progress * circumference;
  const colorClass = getScoreColor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClass} transition-all duration-700 ease-out`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono text-xl font-bold leading-none ${colorClass}`}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
