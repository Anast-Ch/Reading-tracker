import { useMemo, useState } from "react";
import BarChart from "../components/BarChart";
import PeriodSwitcher from "../components/PeriodSwitcher";
import RatingBars from "../components/RatingBars";
import ReadBooksList from "../components/ReadBooksList";
import StatCard from "../components/StatCard";
import { useStatistics } from "../hooks/useStatistics";
import {
  bucketsFor,
  chartTitle,
  currentPeriod,
  formatAverage,
  inRange,
  periodRange,
  ratingDistribution,
  shiftPeriod,
} from "../lib/period";
import type { Period, PeriodType } from "../lib/period";
import "./StatsPage.css";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>(() => currentPeriod("year"));
  const { books, booksLoading, stats, statsLoading, error } = useStatistics(period);

  const inPeriod = useMemo(() => {
    const range = periodRange(period);
    return books
      .filter((b) => inRange(b.finish_date, range))
      .sort((a, b) => (b.finish_date ?? "").localeCompare(a.finish_date ?? "") || b.id - a.id);
  }, [books, period]);

  const buckets = useMemo(() => bucketsFor(period, inPeriod), [period, inPeriod]);
  const distribution = useMemo(() => ratingDistribution(inPeriod), [inPeriod]);

  const withPages = inPeriod.filter((b) => b.pages_count);
  const pagesTotal = withPages.reduce((sum, b) => sum + (b.pages_count ?? 0), 0);

  const isEmpty = !booksLoading && inPeriod.length === 0;

  return (
    <main className="container page">
      <div className="stats-head">
        <h1>Статистика</h1>
        <PeriodSwitcher
          period={period}
          onTypeChange={(t: PeriodType) => setPeriod(currentPeriod(t))}
          onShift={(delta) => setPeriod((p) => shiftPeriod(p, delta))}
        />
      </div>

      {error && (
        <p className="stats-error" role="alert">
          {error}
        </p>
      )}

      <div className="stat-cards">
        <StatCard
          tone="yellow"
          label="Прочитано книг"
          value={String(stats?.count_read ?? "—")}
          loading={statsLoading}
        />
        <StatCard
          tone="pink"
          label="Средняя оценка"
          value={formatAverage(stats?.average_rating)}
          hint="Книги без оценки не учитываются"
          loading={statsLoading}
        />
        <StatCard
          tone="blue"
          label="Прочитано страниц"
          value={pagesTotal.toLocaleString("ru-RU")}
          hint={withPages.length ? `По книгам, где указаны страницы: ${withPages.length}` : "Страницы в книгах не указаны"}
          loading={booksLoading}
        />
      </div>

      {booksLoading ? (
        <p className="mut">Загрузка...</p>
      ) : isEmpty ? (
        <div className="empty">
          <h2>За этот период нет прочитанных книг</h2>
          <p>Книга попадает в статистику по дате окончания чтения. Выберите другой период или отметьте книгу как прочитанную.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <BarChart title={chartTitle(period)} buckets={buckets} />
            <RatingBars data={distribution} />
          </div>
          <ReadBooksList books={inPeriod} />
        </>
      )}
    </main>
  );
}
