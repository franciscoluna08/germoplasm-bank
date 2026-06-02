import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <main id="top" className="mx-auto flex min-h-screen max-w-[1020px] flex-col px-4 py-6 sm:px-6 sm:py-8">
      <nav className="flex items-center justify-between gap-4 py-3">
        <Link
          href="/"
          aria-label="Germoplasm Bank inicio"
          className="text-[0.68rem] font-extrabold uppercase tracking-[0.46em] text-emerald-700"
        >
          Germoplasm Bank
        </Link>
        <Link href="/catalog" className="text-sm font-bold text-slate-700 transition hover:text-emerald-700">
          Ver catálogo
        </Link>
      </nav>

      <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.78fr] lg:gap-12">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-extrabold text-emerald-800 shadow-sm">
            Catálogo público de accesiones
          </p>
          <h1 className="max-w-[520px] text-4xl font-black leading-[0.93] tracking-[-0.07em] text-slate-950 sm:text-5xl lg:text-[3.25rem]">
            Consultá el banco de germoplasma de <span className="block text-emerald-700">Paspalum</span>
          </h1>
          <p className="mt-5 max-w-[520px] text-sm leading-7 text-slate-600 sm:text-base">
            Buscá accesiones por código, especie, colector o procedencia. El frontend consulta directamente las tablas y
            vistas publicadas por Supabase.
          </p>
          <div className="mt-7 max-w-[500px]">
            <SearchForm filters={{}} />
          </div>
        </div>

        <aside className="w-full max-w-[360px] rounded-[1.5rem] border border-emerald-100/90 bg-white/80 p-5 shadow-[0_12px_30px_rgba(18,63,50,0.08)] backdrop-blur-md lg:justify-self-end">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Qué podés consultar</h2>
          <dl className="mt-4 grid gap-3">
            <InfoItem title="Catálogo filtrable" description="Filtrá por especie, país, provincia y disponibilidad." />
            <InfoItem title="Disponibilidad" description="Revisá cantidad de semillas y estado disponible/no disponible." />
            <InfoItem title="Detalle completo" description="Accedé a colecta, localidad, coordenadas y observaciones." />
          </dl>
          <Link
            href="/catalog"
            className="mt-4 inline-flex w-full justify-center rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
          >
            Abrir catálogo
          </Link>
        </aside>
      </section>
    </main>
  );
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 p-4">
      <dt className="text-sm font-bold text-slate-900">{title}</dt>
      <dd className="mt-1 text-xs leading-5 text-slate-600">{description}</dd>
    </div>
  );
}
