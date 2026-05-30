import { getSupabaseClient, isSupabaseConfigured } from "./client";
import type { AccessionCatalogRow, AccessionDetail, CatalogFilters } from "./types";

const DEFAULT_LIMIT = 100;

function normalize(value?: string) {
  return value?.trim() || undefined;
}

export async function getCatalogAccessions(filters: CatalogFilters = {}) {
  if (!isSupabaseConfigured()) {
    return {
      data: [] as AccessionCatalogRow[],
      error: "Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para consultar el catálogo.",
    };
  }

  const supabase = getSupabaseClient();
  let query = supabase
    .from("accession_catalog")
    .select("id, accession_code, scientific_name, collector, country, province, seed_quantity, available")
    .order("accession_code", { ascending: true })
    .limit(DEFAULT_LIMIT);

  const search = normalize(filters.search);
  if (search) {
    query = query.or(
      `accession_code.ilike.%${search}%,scientific_name.ilike.%${search}%,collector.ilike.%${search}%,country.ilike.%${search}%,province.ilike.%${search}%`,
    );
  }

  const species = normalize(filters.species);
  if (species) query = query.ilike("scientific_name", `%${species}%`);

  const country = normalize(filters.country);
  if (country) query = query.ilike("country", `%${country}%`);

  const province = normalize(filters.province);
  if (province) query = query.ilike("province", `%${province}%`);

  if (filters.available === "true") query = query.eq("available", true);
  if (filters.available === "false") query = query.eq("available", false);

  const { data, error } = await query;

  return {
    data: (data ?? []) as AccessionCatalogRow[],
    error: error?.message,
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
    .single();

  return {
    data: data as AccessionDetail | null,
    error: error?.message,
  };
}
