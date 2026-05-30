import type { CatalogFilters } from "@/lib/supabase/types";

export function CatalogStats({
  count,
  page,
  totalPages,
  filters,
}: {
  count: number;
  page: number;
  totalPages: number;
  filters: CatalogFilters;
}) {
  const activeFilters = [filters.search, filters.species, filters.country, filters.province, filters.available].filter(Boolean)
    .length;

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Resultados" value={count.toLocaleString("es-AR")} />
      <StatCard label="Página" value={totalPages > 0 ? `${page} de ${totalPages}` : "—"} />
      <StatCard label="Filtros activos" value={activeFilters.toString()} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
