import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { getAccessionById } from "@/lib/supabase/accessions";

type AccessionPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

export default async function AccessionDetailPage({ params }: AccessionPageProps) {
  const { id } = await params;
  const { data: accession, error } = await getAccessionById(id);

  if (!accession && !error) notFound();

  const inventory = accession?.inventory?.[0];

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <nav className="mb-8 flex items-center justify-between">
        <Link href="/catalog" className="font-semibold text-emerald-800">
          ← Volver al catálogo
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-emerald-700">
          Inicio
        </Link>
      </nav>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {accession ? (
        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 bg-emerald-50 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  Accesión
                </p>
                <h1 className="mt-2 text-4xl font-bold text-slate-950">{accession.accession_code}</h1>
                <p className="mt-2 text-xl italic text-slate-700">
                  {accession.species?.scientific_name ?? "Especie sin registrar"}
                </p>
              </div>
              <AvailabilityBadge available={inventory?.available ?? null} />
            </div>
          </header>

          <dl className="grid gap-6 p-8 md:grid-cols-2">
            <DetailItem label="Código" value={accession.accession_code} />
            <DetailItem label="Especie" value={accession.species?.scientific_name} />
            <DetailItem label="Colector" value={accession.collector} />
            <DetailItem label="Fecha de colecta" value={formatDate(accession.collection_date)} />
            <DetailItem label="País" value={accession.country} />
            <DetailItem label="Provincia" value={accession.province} />
            <DetailItem label="Localidad" value={accession.locality} />
            <DetailItem label="Latitud" value={accession.latitude} />
            <DetailItem label="Longitud" value={accession.longitude} />
            <DetailItem label="Cantidad de semillas" value={inventory?.seed_quantity ?? null} />
            <DetailItem label="Estado de disponibilidad" value={inventory?.available ? "Disponible" : "No disponible"} />
            <DetailItem label="Observaciones" value={accession.observations} wide />
          </dl>
        </article>
      ) : null}
    </main>
  );
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string | number | null | undefined;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 rounded-2xl bg-slate-50 p-4 text-slate-900">{formatValue(value)}</dd>
    </div>
  );
}
