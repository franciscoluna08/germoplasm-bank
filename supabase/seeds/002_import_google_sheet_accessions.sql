-- Importa accesiones directamente desde la Google Sheet publica usando solo SQL.
--
-- Uso en Supabase:
-- 1. Ejecutar supabase/migrations/001_initial_schema.sql.
-- 2. Ejecutar supabase/migrations/002_refresh_catalog_view.sql.
-- 3. Abrir Supabase > SQL Editor, pegar este archivo completo y presionar Run.
--
-- Este script usa la extension `http` de Supabase para leer la hoja publicada y
-- convertir la respuesta JSON de Google Visualization API en filas de la base.

create extension if not exists http with schema extensions;

create or replace function public._gb_gviz_cell_text(cells jsonb, cell_index integer)
returns text
language sql
immutable
as $$
    select nullif(
        btrim(
            coalesce(
                cells -> cell_index ->> 'f',
                cells -> cell_index ->> 'v',
                ''
            )
        ),
        ''
    );
$$;

create or replace function public._gb_first_integer(value text)
returns integer
language sql
immutable
as $$
    select nullif((regexp_match(coalesce(value, ''), '\d+'))[1], '')::integer;
$$;

create or replace function public._gb_normalize_species(value text)
returns text
language sql
immutable
as $$
    select case
        when value is null or btrim(value) = '' then null
        when btrim(value) ~* '^(p\.|paspalum)\s+' then btrim(value)
        else 'Paspalum ' || btrim(value)
    end;
$$;

create or replace function public._gb_country_from_origin(origin_value text)
returns text
language sql
immutable
as $$
    select case upper(nullif(split_part(coalesce(origin_value, ''), ',', 1), ''))
        when 'A' then 'Argentina'
        when 'AR' then 'Argentina'
        when 'ARG' then 'Argentina'
        when 'BR' then 'Brasil'
        when 'BRA' then 'Brasil'
        when 'BO' then 'Bolivia'
        when 'BOL' then 'Bolivia'
        when 'AUS' then 'Australia'
        when 'MEX' then 'Mexico'
        when 'CHILE' then 'Chile'
        when 'PARAGUAY' then 'Paraguay'
        when 'URUGUAY' then 'Uruguay'
        else nullif(initcap(btrim(split_part(coalesce(origin_value, ''), ',', 1))), '')
    end;
$$;

create or replace function public._gb_province_from_origin(origin_value text)
returns text
language sql
immutable
as $$
    select nullif(btrim(split_part(coalesce(origin_value, ''), ',', 2)), '');
$$;

do $$
declare
    v_url text := 'https://docs.google.com/spreadsheets/d/17bY7xB9jydXmUt_XP8mORxUp6n3iQ0oV/gviz/tq?tqx=out:json&gid=1262919653';
    v_status integer;
    v_content text;
    v_payload jsonb;
    v_imported integer;
begin
    select h.status, h.content
    into v_status, v_content
    from extensions.http_get(v_url) as h;

    if v_status is distinct from 200 then
        raise exception 'Google Sheet request failed with HTTP status %. Check that the sheet is public/viewable.', v_status;
    end if;

    v_payload := substring(
        v_content
        from 'google\.visualization\.Query\.setResponse\((.*)\);'
    )::jsonb;

    if v_payload is null then
        raise exception 'Could not parse Google Visualization response.';
    end if;

    create temp table _gb_raw_accessions on commit drop as
    with source_rows as (
        select
            row_number() over (order by row_ordinality) as source_row_number,
            row_value -> 'c' as cells
        from jsonb_array_elements(v_payload -> 'table' -> 'rows') with ordinality as r(row_value, row_ordinality)
    ),
    mapped_rows as (
        select
            source_row_number,
            public._gb_gviz_cell_text(cells, 1) as source_id,
            public._gb_gviz_cell_text(cells, 2) as box_number,
            public._gb_gviz_cell_text(cells, 3) as accession_number,
            public._gb_normalize_species(public._gb_gviz_cell_text(cells, 4)) as scientific_name,
            public._gb_gviz_cell_text(cells, 5) as collection_quarin,
            public._gb_gviz_cell_text(cells, 6) as other_identifications,
            public._gb_gviz_cell_text(cells, 7) as harvest_date_text,
            public._gb_gviz_cell_text(cells, 8) as conservation_date_text,
            public._gb_gviz_cell_text(cells, 9) as envelope_text,
            public._gb_gviz_cell_text(cells, 10) as seed_weight_text,
            public._gb_first_integer(public._gb_gviz_cell_text(cells, 11)) as seed_quantity,
            public._gb_gviz_cell_text(cells, 12) as conservation_observations,
            public._gb_gviz_cell_text(cells, 13) as origin_text,
            public._gb_gviz_cell_text(cells, 14) as ploidy_text,
            public._gb_gviz_cell_text(cells, 15) as reproduction_system
        from source_rows
    ),
    filtered_rows as (
        select
            *,
            count(*) over (partition by source_id) as source_id_count,
            row_number() over (partition by source_id order by source_row_number) as source_id_position
        from mapped_rows
        where scientific_name is not null
          and source_id is not null
          and source_id !~* '^(id|[-]+)$'
    )
    select
        case
            when source_id_count = 1 then 'BG-' || source_id
            else 'BG-' || source_id || '-' || source_id_position
        end as accession_code,
        scientific_name,
        null::text as collector,
        null::date as collection_date,
        public._gb_country_from_origin(origin_text) as country,
        public._gb_province_from_origin(origin_text) as province,
        null::text as locality,
        null::numeric(10,7) as latitude,
        null::numeric(10,7) as longitude,
        coalesce(seed_quantity, 0) as seed_quantity,
        coalesce(seed_quantity, 0) > 0 as available,
        nullif(
            concat_ws(
                ' | ',
                'Google Sheet row: ' || source_row_number,
                'ID: ' || source_id,
                'Caja: ' || box_number,
                'N: ' || accession_number,
                'Coleccion Quarin: ' || collection_quarin,
                'Otras identificaciones: ' || other_identifications,
                'Fecha de cosecha: ' || harvest_date_text,
                'Fecha de conservacion: ' || conservation_date_text,
                'Env.: ' || envelope_text,
                'Peso: ' || seed_weight_text,
                'Observaciones: ' || conservation_observations,
                'Origen: ' || origin_text,
                '2n: ' || ploidy_text,
                'Sistema reprod.: ' || reproduction_system
            ),
            ''
        ) as observations
    from filtered_rows;

    with upserted_species as (
        insert into species (scientific_name)
        select distinct scientific_name
        from _gb_raw_accessions
        on conflict (scientific_name) do update
            set scientific_name = excluded.scientific_name
        returning id, scientific_name
    ),
    all_species as (
        select id, scientific_name from upserted_species
        union
        select s.id, s.scientific_name
        from species s
        join (select distinct scientific_name from _gb_raw_accessions) r
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
        from _gb_raw_accessions r
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
    ),
    upserted_inventory as (
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
            'Importado desde Google Sheet',
            now()
        from _gb_raw_accessions r
        join upserted_accessions a on a.accession_code = r.accession_code
        on conflict (accession_id) do update
            set seed_quantity = excluded.seed_quantity,
                available = excluded.available,
                storage_location = excluded.storage_location,
                updated_at = now()
        returning id
    )
    select count(*)
    into v_imported
    from upserted_accessions;

    raise notice 'Imported % accessions from Google Sheet.', v_imported;
end $$;

-- Limpieza: las funciones auxiliares solo eran necesarias para esta importacion.
drop function if exists public._gb_gviz_cell_text(jsonb, integer);
drop function if exists public._gb_first_integer(text);
drop function if exists public._gb_normalize_species(text);
drop function if exists public._gb_country_from_origin(text);
drop function if exists public._gb_province_from_origin(text);

-- Verificacion rapida:
select count(*) as species_count from species;
select count(*) as accessions_count from accessions;
select count(*) as inventory_count from inventory;
select * from accession_catalog order by accession_code limit 50;
