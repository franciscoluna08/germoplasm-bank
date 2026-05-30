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
            Banco de germoplasma de <span className="text-emerald-700">Paspalum</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Consultá accesiones, procedencia y disponibilidad de semillas desde una interfaz simple
            conectada a Supabase.
          </p>
          <div className="mt-8">
            <SearchForm filters={{}} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">MVP de consulta</h2>
          <dl className="mt-6 grid gap-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <dt className="font-semibold text-slate-900">Sin autenticación</dt>
              <dd className="mt-1 text-sm text-slate-600">Consulta pública orientada a investigadores.</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <dt className="font-semibold text-slate-900">Filtros del catálogo</dt>
              <dd className="mt-1 text-sm text-slate-600">Especie, país, provincia y disponibilidad.</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <dt className="font-semibold text-slate-900">Detalle de accesión</dt>
              <dd className="mt-1 text-sm text-slate-600">Datos de colecta, ubicación, inventario y observaciones.</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
