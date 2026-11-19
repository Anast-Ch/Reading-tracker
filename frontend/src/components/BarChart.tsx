import type { Bucket } from "../lib/period";

interface Props {
  title: string;
  buckets: Bucket[];
}

export default function BarChart({ title, buckets }: Props) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const summary = buckets.map((b) => `${b.label}: ${b.count}`).join(", ");

  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="chart" role="img" aria-label={`${title}. ${summary}`}>
        {buckets.map((b) => (
          <div className="chart__col" key={b.label}>
            <div className="chart__area">
              <span className="chart__count">{b.count}</span>
              <div
                className={`chart__bar${b.count === 0 ? " chart__bar--zero" : ""}`}
                style={{ height: `${(b.count / max) * 85}%` }}
              />
            </div>
            <span className="chart__label">{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
