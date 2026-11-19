import type { RatingDistribution } from "../lib/period";

export default function RatingBars({ data }: { data: RatingDistribution }) {
  const max = Math.max(1, ...data.counts);
  return (
    <section className="panel">
      <h2>Распределение оценок</h2>
      <div className="rating-rows">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = data.counts[stars - 1];
          return (
            <div className="rating-row" key={stars}>
              <span aria-hidden="true">{stars} ★</span>
              <span className="visually-hidden">Оценка {stars}:</span>
              <div className="rating-track">
                <div className="rating-fill" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span>{count}</span>
            </div>
          );
        })}
      </div>
      <p className="mut">Без оценки: {data.unrated}. Они не входят в среднюю оценку.</p>
    </section>
  );
}
