# Germoplasm Bank

MVP de consulta pública para un banco de germoplasma de especies del género _Paspalum_.

## Funcionalidades incluidas

- Home con buscador general.
- Catálogo de accesiones con tabla y filtros por especie, país, provincia y disponibilidad.
- Página de detalle de accesión.
- Cliente Supabase para consultar la API REST automática.
- Migración SQL inicial para Supabase.
- Script de importación Excel/CSV hacia Supabase.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL

## Configuración local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

3. Completar `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Ejecutar la app:

   ```bash
   npm run dev
   ```

## Base de datos

Las migraciones están en:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_refresh_catalog_view.sql
```

Aplicá `001_initial_schema.sql` para crear tablas, índices y la vista pública `accession_catalog`. Si ya creaste la base con una versión anterior de la vista, aplicá también `002_refresh_catalog_view.sql` para exponer el campo `collector`, necesario para el buscador general.

## Frontend de consultas

El frontend consulta Supabase con la anon key pública configurada en `.env.local`:

- `/`: buscador principal.
- `/catalog`: tabla paginada, filtros por especie/país/provincia/disponibilidad y sugerencias de filtros tomadas de Supabase.
- `/accessions/[id]`: detalle completo de la accesión seleccionada.



## Carga de datos sin Python

Si no podés ejecutar Python en tu computadora, podés cargar datos pegando SQL en **Supabase → SQL Editor**. El repo incluye dos opciones:

```text
supabase/seeds/001_sample_accessions.sql
supabase/seeds/002_import_google_sheet_accessions.sql
```

`001_sample_accessions.sql` crea accesiones demo para probar el frontend. `002_import_google_sheet_accessions.sql` intenta importar directamente la Google Sheet compartida usando la extensión `http` de Supabase, sin ejecutar nada localmente. Primero ejecutá las migraciones y después este seed real desde el SQL Editor.

## Importación de datos

El script `scripts/import_excel.py` **se ejecuta localmente**, no dentro de Supabase. Lee una planilla Excel/CSV y carga datos en Supabase usando la API REST con la `service_role key`.

Pasos rápidos:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
python scripts/import_excel.py data/accessions.xlsx
```

Reemplazá `https://your-project.supabase.co` y `your-service-role-key` por los valores reales de **Supabase → Project Settings → API**. Si `pip install` se cancela o falla, el script no va a encontrar el paquete `supabase`; volvé a ejecutar `pip install -r scripts/requirements.txt` dentro del entorno virtual.

La guía completa está en [`docs/import-data.md`](docs/import-data.md), incluyendo columnas esperadas, cómo obtener credenciales, cómo importar desde CSV/Excel, errores comunes y cómo verificar la carga en Supabase.
