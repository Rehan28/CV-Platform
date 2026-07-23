import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import "./HomePage.css";

interface Stats {
  candidates: number;
  recruiters: number;
  positions: number;
  cvsTotal: number;
  cvsLast24h: number;
  attributesCount: number;
}

export function HomePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/stats").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>{t("nav.positions")} · {t("nav.attributes")} · CVs</h1>
        <p>
          Recruiters build reusable attribute-driven position templates. Candidates fill their profile once and
          generate a tailored CV for every position they're eligible for.
        </p>
      </section>

      <section className="stats-grid">
        {stats ? (
          <>
            <StatCard label="Candidates" value={stats.candidates} />
            <StatCard label="Recruiters" value={stats.recruiters} />
            <StatCard label="Positions" value={stats.positions} />
            <StatCard label="CVs submitted" value={stats.cvsTotal} />
            <StatCard label="CVs in last 24h" value={stats.cvsLast24h} />
            <StatCard label="Library attributes" value={stats.attributesCount} />
          </>
        ) : (
          <p>{t("common.loading")}</p>
        )}
      </section>

      <section className="placeholder-card">
        <h2>Latest &amp; most popular positions</h2>
        <p className="text-muted">Arriving in Phase 2, once Position management is built.</p>
      </section>

      <section className="placeholder-card">
        <h2>Technology tag cloud</h2>
        <p className="text-muted">Arriving once candidate Projects (Phase 3) exist to source tags from.</p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
