interface Props {
  value?: number | null;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, disabled }: Props) {
  const v = value ?? 0;
  if (!onChange) {
    return (
      <span className="stars" aria-label={`Оценка ${v} из 5`}>
        {"★".repeat(v)}
        <span className="stars__off">{"★".repeat(5 - v)}</span>
      </span>
    );
  }
  return (
    <div className="stars stars--edit" role="group" aria-label="Оценка">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${n <= v ? " star-btn--on" : ""}`}
          disabled={disabled}
          aria-label={`${n} из 5`}
          aria-pressed={n === v}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
