import Link from "next/link";
import { AccessionTable } from "@/components/AccessionTable";
import { CatalogFiltersForm } from "@/components/CatalogFilters";
import { CatalogPagination } from "@/components/CatalogPagination";
import { CatalogStats } from "@/components/CatalogStats";
import { SearchForm } from "@/components/SearchForm";
import { getCatalogAccessions, getCatalogFilterOptions } from "@/lib/supabase/accessions";
import type { CatalogFilters } from "@/lib/supabase/types";

type CatalogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const filters: CatalogFilters = {
    search: getParam(params, "search"),
    species: getParam(params, "species"),
    country: getParam(params, "country"),
    province: getParam(params, "province"),
    available: getParam(params, "available"),
    page: getParam(params, "page"),
  };
  const [catalog, filterOptions] = await Promise.all([getCatalogAccessions(filters), getCatalogFilterOptions()]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-800">
          Germoplasm Bank
        </Link>
        <span className="text-sm text-slate-500">Catálogo de accesiones</span>
      </nav>

      <header className="mb-8 rounded-[2rem] bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100">Consulta pública</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Catálogo de accesiones</h1>
        <p className="mt-3 max-w-3xl text-emerald-50">
          Buscá accesiones del banco de germoplasma por código, especie, colector, país o provincia y revisá
          su disponibilidad de semillas.
        </p>
      </header>

      <div className="space-y-5">
        <SearchForm filters={filters} />
        <CatalogFiltersForm filters={filters} options={filterOptions.data} />
        <CatalogStats count={catalog.count} page={catalog.page} totalPages={catalog.totalPages} filters={filters} />
        {catalog.error ? <CatalogError message={catalog.error} /> : null}
        {filterOptions.error ? <CatalogError message={filterOptions.error} /> : null}
        <AccessionTable accessions={catalog.data} />
        <CatalogPagination filters={filters} page={catalog.page} totalPages={catalog.totalPages} />
      </div>
    </main>
  );
}

function CatalogError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">No se pudo consultar Supabase</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
