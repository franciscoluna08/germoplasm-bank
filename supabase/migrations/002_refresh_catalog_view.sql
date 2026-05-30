-- Refresh the public catalog view used by the frontend search.
-- Apply this migration if the database was created with the first MVP draft,
-- where accession_catalog did not expose collector for global searches.

drop view if exists accession_catalog;

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

grant select on accession_catalog to anon, authenticated;
grant select on species, accessions, inventory to anon, authenticated;
