import Link from "next/link";
import type { AccessionCatalogRow } from "@/lib/supabase/types";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function AccessionTable({ accessions }: { accessions: AccessionCatalogRow[] }) {
  if (accessions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        <p className="text-lg font-semibold text-slate-900">No se encontraron accesiones</p>
        <p className="mt-2">Probá modificar la búsqueda o limpiar los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Especie</th>
              <th className="px-5 py-4">Colector</th>
              <th className="px-5 py-4">País</th>
              <th className="px-5 py-4">Provincia</th>
              <th className="px-5 py-4">Semillas</th>
              <th className="px-5 py-4">Disponibilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accessions.map((accession) => (
              <tr key={accession.id} className="transition hover:bg-emerald-50/50">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-800">
                  <Link className="hover:underline" href={`/accessions/${accession.id}`}>
                    {accession.accession_code}
                  </Link>
                </td>
                <td className="px-5 py-4 italic text-slate-800">{accession.scientific_name}</td>
                <td className="px-5 py-4 text-slate-600">{accession.collector ?? "—"}</td>
                <td className="px-5 py-4 text-slate-600">{accession.country ?? "—"}</td>
                <td className="px-5 py-4 text-slate-600">{accession.province ?? "—"}</td>
                <td className="px-5 py-4 text-slate-600">{accession.seed_quantity ?? "—"}</td>
                <td className="px-5 py-4">
                  <AvailabilityBadge available={accession.available} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
