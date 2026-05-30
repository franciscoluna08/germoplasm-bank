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

La migración inicial está en:

```text
supabase/migrations/001_initial_schema.sql
```

Aplicala en Supabase antes de usar el catálogo.

## Importación de datos

El script `scripts/import_excel.py` importa una planilla Excel o CSV y pobla las tablas `species`, `accessions` e `inventory`.

Ejemplo:

```bash
python scripts/import_excel.py data/accessions.xlsx \
  --supabase-url https://your-project.supabase.co \
  --service-role-key your-service-role-key
```

También puede leer las credenciales desde variables de entorno:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
python scripts/import_excel.py data/accessions.xlsx
```
