interface Props {
  label: string;
  value: string;
  hint?: string;
  tone: "yellow" | "pink" | "blue" | "lime";
  loading?: boolean;
}

/** Карточка с одним крупным показателем */
export default function StatCard({ label, value, hint, tone, loading }: Props) {
  return (
    <article className={`stat-card stat-card--${tone}`} aria-busy={loading}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{loading ? "…" : value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </article>
  );
}
