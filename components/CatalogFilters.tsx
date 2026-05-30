import type { CatalogFilterOptions, CatalogFilters } from "@/lib/supabase/types";

export function CatalogFiltersForm({
  filters,
  options,
}: {
  filters: CatalogFilters;
  options: CatalogFilterOptions;
}) {
  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <input type="hidden" name="search" value={filters.search ?? ""} />
      <div className="grid gap-3 md:grid-cols-5">
        <FilterInput
          label="Especie"
          name="species"
          value={filters.species}
          placeholder="Paspalum..."
          suggestions={options.species}
        />
        <FilterInput
          label="País"
          name="country"
          value={filters.country}
          placeholder="Argentina"
          suggestions={options.countries}
        />
        <FilterInput
          label="Provincia"
          name="province"
          value={filters.province}
          placeholder="Corrientes"
          suggestions={options.provinces}
        />
        <label className="text-sm font-medium text-slate-700">
          Disponibilidad
          <select
            name="available"
            defaultValue={filters.available ?? ""}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todas</option>
            <option value="true">Disponible</option>
            <option value="false">No disponible</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="h-11 flex-1 rounded-xl bg-emerald-700 px-4 font-semibold text-white transition hover:bg-emerald-800">
            Filtrar
          </button>
          <a
            href="/catalog"
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar
          </a>
        </div>
      </div>
    </form>
  );
}

function FilterInput({
  label,
  name,
  value,
  placeholder,
  suggestions,
}: {
  label: string;
  name: string;
  value?: string;
  placeholder: string;
  suggestions: string[];
}) {
  const listId = `${name}-suggestions`;

  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        defaultValue={value ?? ""}
        list={suggestions.length > 0 ? listId : undefined}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
      {suggestions.length > 0 ? (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </label>
  );
}
