import Link from "next/link";
import { AccessionTable } from "@/components/AccessionTable";
import { CatalogFiltersForm } from "@/components/CatalogFilters";
import { SearchForm } from "@/components/SearchForm";
import { getCatalogAccessions } from "@/lib/supabase/accessions";
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
  };
  const { data: accessions, error } = await getCatalogAccessions(filters);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-800">
          Germoplasm Bank
        </Link>
        <span className="text-sm text-slate-500">Catálogo de accesiones</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Catálogo de accesiones</h1>
        <p className="mt-2 text-slate-600">
          Buscá y filtrá accesiones disponibles en el banco de germoplasma.
        </p>
      </header>

      <div className="space-y-5">
        <SearchForm filters={filters} />
        <CatalogFiltersForm filters={filters} />
        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        ) : null}
        <AccessionTable accessions={accessions} />
      </div>
    </main>
  );
}
