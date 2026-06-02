import type { CatalogFilters } from "@/lib/supabase/types";

export function SearchForm({ filters }: { filters: CatalogFilters }) {
  return (
    <form
      action="/catalog"
      className="rounded-3xl border border-emerald-100/90 bg-white/80 p-4 shadow-[0_12px_30px_rgba(18,63,50,0.08)] backdrop-blur-md"
    >
      <label htmlFor="search" className="block text-sm font-bold text-slate-700">
        Buscar accesiones
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
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
          className="min-h-12 min-w-0 rounded-2xl border border-slate-200 bg-white/95 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-emerald-700 px-6 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          Buscar
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        La búsqueda consulta código de accesión, especie, colector, país y provincia.
      </p>
    </form>
  );
}
