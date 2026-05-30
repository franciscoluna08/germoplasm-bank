import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <nav className="flex items-center justify-between py-4">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Germoplasm Bank
        </span>
        <Link href="/catalog" className="font-medium text-slate-700 hover:text-emerald-700">
          Ver catálogo
        </Link>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            Catálogo público de accesiones
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Consultá el banco de germoplasma de <span className="text-emerald-700">Paspalum</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Buscá accesiones por código, especie, colector o procedencia. El frontend consulta directamente
            las tablas y vistas publicadas por Supabase.
          </p>
          <div className="mt-8">
            <SearchForm filters={{}} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Qué podés consultar</h2>
          <dl className="mt-6 grid gap-5">
            <InfoItem title="Catálogo filtrable" description="Filtrá por especie, país, provincia y disponibilidad." />
            <InfoItem title="Disponibilidad" description="Revisá cantidad de semillas y estado disponible/no disponible." />
            <InfoItem title="Detalle completo" description="Accedé a colecta, localidad, coordenadas y observaciones." />
          </dl>
          <Link
            href="/catalog"
            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Abrir catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <dt className="font-semibold text-slate-900">{title}</dt>
      <dd className="mt-1 text-sm text-slate-600">{description}</dd>
    </div>
  );
}
