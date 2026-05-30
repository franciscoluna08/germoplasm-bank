export type AccessionCatalogRow = {
  id: string;
  accession_code: string;
  scientific_name: string;
  collector: string | null;
  country: string | null;
  province: string | null;
  seed_quantity: number | null;
  available: boolean | null;
};

export type AccessionDetail = {
  id: string;
  accession_code: string;
  collector: string | null;
  collection_date: string | null;
  country: string | null;
  province: string | null;
  locality: string | null;
  latitude: number | null;
  longitude: number | null;
  observations: string | null;
  species: {
    scientific_name: string;
  } | null;
  inventory: Array<{
    seed_quantity: number;
    available: boolean;
    storage_location: string | null;
    updated_at: string;
  }> | null;
};

export type CatalogFilters = {
  search?: string;
  species?: string;
  country?: string;
  province?: string;
  available?: string;
};
