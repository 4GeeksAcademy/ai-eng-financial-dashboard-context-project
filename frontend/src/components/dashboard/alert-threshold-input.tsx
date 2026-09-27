import { useEffect, useId, useRef, useState } from "react";
import {
  ALERT_THRESHOLD_MAX,
  ALERT_THRESHOLD_MIN,
  formatIncreaseRatio,
  parseThreshold,
} from "@/lib/financial-utils";

const DEBOUNCE_MS = 300;

interface AlertThresholdInputProps {
  value: number;
  onChange: (next: number) => void;
}

export function AlertThresholdInput({ value, onChange }: AlertThresholdInputProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const [draft, setDraft] = useState(String(value));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const parsed = parseThreshold(draft);
  const isInvalid = parsed === undefined;

  function handleChange(nextDraft: string) {
    setDraft(nextDraft);
    if (timerRef.current) clearTimeout(timerRef.current);

    const next = parseThreshold(nextDraft);
    if (next === undefined || next === value) return;
    timerRef.current = setTimeout(() => onChange(next), DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        Spike threshold
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="0.01"
        min={ALERT_THRESHOLD_MIN}
        max={ALERT_THRESHOLD_MAX}
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={helpId}
        className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm text-foreground tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
      />
      <p
        id={helpId}
        role={isInvalid ? "alert" : undefined}
        className={isInvalid ? "text-xs text-destructive-foreground" : "text-xs text-muted-foreground"}
      >
        {isInvalid
          ? `Enter a ratio between ${ALERT_THRESHOLD_MIN} and ${ALERT_THRESHOLD_MAX.toFixed(1)}.`
          : `Flag periods more than ${formatIncreaseRatio(value)} above the 3-period average.`}
      </p>
    </div>
  );
}
