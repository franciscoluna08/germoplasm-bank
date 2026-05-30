import type { CatalogFilters } from "@/lib/supabase/types";

export function SearchForm({ filters }: { filters: CatalogFilters }) {
  return (
    <form action="/catalog" className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
      <label htmlFor="search" className="block text-sm font-medium text-slate-700">
        Buscar accesiones
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="species" value={filters.species ?? ""} />
        <input type="hidden" name="country" value={filters.country ?? ""} />
        <input type="hidden" name="province" value={filters.province ?? ""} />
        <input type="hidden" name="available" value={filters.available ?? ""} />
        <input
          id="search"
          name="search"
          type="search"
          defaultValue={filters.search}
          placeholder="Ej: PAS-001, Paspalum, colector, Argentina, Corrientes"
          className="min-h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-emerald-700 px-6 font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          Buscar
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        La búsqueda consulta código de accesión, especie, colector, país y provincia.
      </p>
    </form>
  );
}
