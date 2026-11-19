import type { Period, PeriodType } from "../lib/period";
import { canGoNext, periodHint, periodLabel } from "../lib/period";

interface Props {
  period: Period;
  onTypeChange: (type: PeriodType) => void;
  onShift: (delta: -1 | 1) => void;
}

const TYPES: { value: PeriodType; label: string }[] = [
  { value: "month", label: "Месяц" },
  { value: "season", label: "Сезон" },
  { value: "year", label: "Год" },
];

/** Переключатель «Месяц / Сезон / Год» и стрелки «‹ ›» для листания периодов */
export default function PeriodSwitcher({ period, onTypeChange, onShift }: Props) {
  const hint = periodHint(period);
  return (
    <div className="period">
      <div className="seg" role="group" aria-label="Тип периода">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className="seg__btn"
            aria-pressed={period.type === t.value}
            onClick={() => onTypeChange(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="period-nav">
        <button type="button" className="period-nav__btn" aria-label="Предыдущий период" onClick={() => onShift(-1)}>
          ‹
        </button>
        <span className="period-nav__label" aria-live="polite">
          {periodLabel(period)}
        </span>
        <button
          type="button"
          className="period-nav__btn"
          aria-label="Следующий период"
          disabled={!canGoNext(period)}
          onClick={() => onShift(1)}
        >
          ›
        </button>
      </div>

      {hint && <p className="mut period__hint">{hint}</p>}
    </div>
  );
}
