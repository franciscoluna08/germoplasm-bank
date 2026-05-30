import type { CatalogFilters } from "@/lib/supabase/types";

function hrefForPage(filters: CatalogFilters, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...filters, page: page.toString() }).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `/catalog?${params.toString()}`;
}

export function CatalogPagination({ filters, page, totalPages }: { filters: CatalogFilters; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm sm:flex-row">
      <p className="text-slate-600">
        Página <span className="font-semibold text-slate-900">{page}</span> de{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <PageLink disabled={page <= 1} href={hrefForPage(filters, page - 1)} label="Anterior" />
        <PageLink disabled={page >= totalPages} href={hrefForPage(filters, page + 1)} label="Siguiente" />
      </div>
    </nav>
  );
}

function PageLink({ disabled, href, label }: { disabled: boolean; href: string; label: string }) {
  if (disabled) {
    return (
      <span className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-300">
        {label}
      </span>
    );
  }

  return (
    <a className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50" href={href}>
      {label}
    </a>
  );
}
