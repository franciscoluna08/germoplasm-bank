-- Seed de ejemplo para cargar accesiones desde el SQL Editor de Supabase.
--
-- IMPORTANTE:
-- Este archivo carga datos DEMO. Si querés que cargue tus datos reales,
-- enviá la planilla Excel/CSV o pegá las filas y se puede generar este mismo
-- formato con todas tus accesiones.
--
-- Cómo usar:
-- 1. Ejecutá primero supabase/migrations/001_initial_schema.sql.
-- 2. Ejecutá supabase/migrations/002_refresh_catalog_view.sql si tu vista no tiene collector.
-- 3. Pegá este archivo en Supabase > SQL Editor > Run.

begin;

with raw_accessions (
    accession_code,
    scientific_name,
    collector,
    collection_date,
    country,
    province,
    locality,
    latitude,
    longitude,
    seed_quantity,
    available,
    storage_location,
    observations
) as (
    values
        (
            'PAS-001',
            'Paspalum notatum',
            'Juan Perez',
            '2021-03-15'::date,
            'Argentina',
            'Corrientes',
            'San Cosme',
            -27.3712000::numeric,
            -58.5123000::numeric,
            120,
            true,
            'Camara fria A - Estante 1',
            'Accesion demo para pruebas del catalogo.'
        ),
        (
            'PAS-002',
            'Paspalum dilatatum',
            'Ana Gomez',
            '2020-11-08'::date,
            'Argentina',
            'Entre Rios',
            'Concordia',
            -31.3917000::numeric,
            -58.0174000::numeric,
            80,
            true,
            'Camara fria A - Estante 2',
            'Material con buena disponibilidad de semillas.'
        ),
        (
            'PAS-003',
            'Paspalum plicatulum',
            'Carlos Silva',
            '2019-05-22'::date,
            'Argentina',
            'Misiones',
            'Posadas',
            -27.3621000::numeric,
            -55.9009000::numeric,
            0,
            false,
            'Camara fria B - Estante 4',
            'Sin semillas disponibles actualmente.'
        ),
        (
            'PAS-004',
            'Paspalum almum',
            'Laura Fernandez',
            '2022-02-10'::date,
            'Argentina',
            'Santa Fe',
            'Reconquista',
            -29.1448000::numeric,
            -59.6436000::numeric,
            45,
            true,
            'Camara fria A - Estante 3',
            null
        ),
        (
            'PAS-005',
            'Paspalum urvillei',
            'Equipo INTA',
            '2018-12-03'::date,
            'Uruguay',
            'Canelones',
            'Las Piedras',
            -34.7302000::numeric,
            -56.2192000::numeric,
            30,
            true,
            'Camara fria C - Estante 1',
            'Origen regional Uruguay.'
        ),
        (
            'PAS-006',
            'Paspalum quadrifarium',
            'Marta Rios',
            '2023-01-18'::date,
            'Argentina',
            'Buenos Aires',
            'Tandil',
            -37.3217000::numeric,
            -59.1332000::numeric,
            65,
            true,
            'Camara fria B - Estante 2',
            'Accesion de ambiente serrano.'
        ),
        (
            'PAS-007',
            'Paspalum vaginatum',
            'Roberto Lima',
            '2021-09-29'::date,
            'Brasil',
            'Rio Grande do Sul',
            'Pelotas',
            -31.7654000::numeric,
            -52.3376000::numeric,
            0,
            false,
            'Camara fria C - Estante 5',
            'Pendiente multiplicacion.'
        ),
        (
            'PAS-008',
            'Paspalum simplex',
            'Natalia Torres',
            '2020-04-12'::date,
            'Paraguay',
            'Central',
            'Aregua',
            -25.3125000::numeric,
            -57.3847000::numeric,
            25,
            true,
            'Camara fria A - Estante 5',
            null
        )
),
upserted_species as (
    insert into species (scientific_name)
    select distinct scientific_name
    from raw_accessions
    on conflict (scientific_name) do update
        set scientific_name = excluded.scientific_name
    returning id, scientific_name
),
all_species as (
    select id, scientific_name from upserted_species
    union
    select s.id, s.scientific_name
    from species s
    join (select distinct scientific_name from raw_accessions) r
        on r.scientific_name = s.scientific_name
),
upserted_accessions as (
    insert into accessions (
        accession_code,
        species_id,
        collector,
        collection_date,
        country,
        province,
        locality,
        latitude,
        longitude,
        observations
    )
    select
        r.accession_code,
        s.id,
        r.collector,
        r.collection_date,
        r.country,
        r.province,
        r.locality,
        r.latitude,
        r.longitude,
        r.observations
    from raw_accessions r
    join all_species s on s.scientific_name = r.scientific_name
    on conflict (accession_code) do update
        set species_id = excluded.species_id,
            collector = excluded.collector,
            collection_date = excluded.collection_date,
            country = excluded.country,
            province = excluded.province,
            locality = excluded.locality,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            observations = excluded.observations
    returning id, accession_code
)
insert into inventory (
    accession_id,
    seed_quantity,
    available,
    storage_location,
    updated_at
)
select
    a.id,
    r.seed_quantity,
    r.available,
    r.storage_location,
    now()
from raw_accessions r
join upserted_accessions a on a.accession_code = r.accession_code
on conflict (accession_id) do update
    set seed_quantity = excluded.seed_quantity,
        available = excluded.available,
        storage_location = excluded.storage_location,
        updated_at = now();

commit;

-- Verificacion rapida:
select *
from accession_catalog
order by accession_code;
