create extension if not exists pgcrypto;

create table species (
    id uuid primary key default gen_random_uuid(),
    scientific_name text not null unique,
    created_at timestamptz not null default now()
);

create table accessions (
    id uuid primary key default gen_random_uuid(),

    accession_code text not null unique,

    species_id uuid not null references species(id),

    collector text,

    collection_date date,

    country text,

    province text,

    locality text,

    latitude numeric(10,7),

    longitude numeric(10,7),

    observations text,

    created_at timestamptz not null default now()
);

create index idx_accessions_code
on accessions(accession_code);

create index idx_accessions_country
on accessions(country);

create index idx_accessions_province
on accessions(province);

create table inventory (
    id uuid primary key default gen_random_uuid(),

    accession_id uuid not null
        references accessions(id)
        on delete cascade,

    seed_quantity integer not null default 0,

    available boolean not null default true,

    storage_location text,

    updated_at timestamptz not null default now()
);

create unique index idx_inventory_accession_id
on inventory(accession_id);

create index idx_inventory_available
on inventory(available);

create view accession_catalog as
select
    a.id,
    a.accession_code,
    s.scientific_name,
    a.collector,
    a.country,
    a.province,
    i.seed_quantity,
    i.available
from accessions a
join species s on s.id = a.species_id
left join inventory i on i.accession_id = a.id;
