import { getSupabaseClient, isSupabaseConfigured } from "./client";
import type {
  AccessionCatalogRow,
  AccessionDetail,
  CatalogFilterOptions,
  CatalogFilters,
  CatalogQueryResult,
} from "./types";

const DEFAULT_PAGE_SIZE = 25;
const FILTER_OPTIONS_LIMIT = 1000;

function normalize(value?: string) {
  return value?.trim() || undefined;
}

function parsePage(page?: string) {
  const parsed = Number(page);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function escapePostgrestValue(value: string) {
  return value
    .replace(/[(),]/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function uniqueSorted(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

function emptyCatalogResult(filters: CatalogFilters = {}, error?: string): CatalogQueryResult {
  const page = parsePage(filters.page);

  return {
    data: [],
    count: 0,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    error,
  };
}

export async function getCatalogAccessions(filters: CatalogFilters = {}): Promise<CatalogQueryResult> {
  if (!isSupabaseConfigured()) {
    return emptyCatalogResult(
      filters,
      "Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para consultar el catálogo.",
    );
  }

  const page = parsePage(filters.page);
  const from = (page - 1) * DEFAULT_PAGE_SIZE;
  const to = from + DEFAULT_PAGE_SIZE - 1;
  const supabase = getSupabaseClient();
  let query = supabase
    .from("accession_catalog")
    .select("id, accession_code, scientific_name, collector, country, province, seed_quantity, available", {
      count: "exact",
    })
    .order("accession_code", { ascending: true })
    .range(from, to);

  const search = normalize(filters.search);
  if (search) {
    const safeSearch = escapePostgrestValue(search);
    query = query.or(
      `accession_code.ilike.%${safeSearch}%,scientific_name.ilike.%${safeSearch}%,collector.ilike.%${safeSearch}%,country.ilike.%${safeSearch}%,province.ilike.%${safeSearch}%`,
    );
  }

  const species = normalize(filters.species);
  if (species) query = query.ilike("scientific_name", `%${escapePostgrestValue(species)}%`);

  const country = normalize(filters.country);
  if (country) query = query.ilike("country", `%${escapePostgrestValue(country)}%`);

  const province = normalize(filters.province);
  if (province) query = query.ilike("province", `%${escapePostgrestValue(province)}%`);

  if (filters.available === "true") query = query.eq("available", true);
  if (filters.available === "false") query = query.eq("available", false);

  const { data, error, count } = await query;

  if (error) return emptyCatalogResult(filters, error.message);

  const total = count ?? 0;

  return {
    data: (data ?? []) as AccessionCatalogRow[],
    count: total,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}

export async function getCatalogFilterOptions(): Promise<{ data: CatalogFilterOptions; error?: string }> {
  const emptyOptions = { species: [], countries: [], provinces: [] };

  if (!isSupabaseConfigured()) {
    return { data: emptyOptions };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("accession_catalog")
    .select("scientific_name, country, province")
    .order("scientific_name", { ascending: true })
    .limit(FILTER_OPTIONS_LIMIT);

  if (error) return { data: emptyOptions, error: error.message };

  const rows = (data ?? []) as Pick<AccessionCatalogRow, "scientific_name" | "country" | "province">[];

  return {
    data: {
      species: uniqueSorted(rows.map((row) => row.scientific_name)),
      countries: uniqueSorted(rows.map((row) => row.country)),
      provinces: uniqueSorted(rows.map((row) => row.province)),
    },
  };
}

export async function getAccessionById(id: string) {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: "Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para consultar detalles.",
    };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("accessions")
    .select(
      `
      id,
      accession_code,
      collector,
      collection_date,
      country,
      province,
      locality,
      latitude,
      longitude,
      observations,
      species:species_id(scientific_name),
      inventory(seed_quantity, available, storage_location, updated_at)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  return {
    data: data as AccessionDetail | null,
    error: error?.message,
  };
}
