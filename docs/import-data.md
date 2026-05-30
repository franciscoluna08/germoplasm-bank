# Importar datos a Supabase

El script `scripts/import_excel.py` **no se ejecuta dentro de Supabase**. Se ejecuta desde tu computadora o desde un servidor/CI con Python, lee una planilla Excel/CSV local y escribe los registros en Supabase usando la API REST.

## 1. Verificar la base de datos

Antes de importar, aplicá las migraciones SQL en Supabase:

1. Abrí tu proyecto en Supabase.
2. Entrá a **SQL Editor**.
3. Ejecutá `supabase/migrations/001_initial_schema.sql`.
4. Si ya habías creado la base con una versión anterior, ejecutá también `supabase/migrations/002_refresh_catalog_view.sql`.

## 2. Conseguir las credenciales

En Supabase, entrá a **Project Settings → API** y copiá:

- **Project URL**: se usa como `SUPABASE_URL`.
- **service_role key**: se usa como `SUPABASE_SERVICE_ROLE_KEY`.

> Importante: la `service_role key` es secreta. No la subas al repositorio, no la pongas en el frontend y no la compartas públicamente.

## 3. Preparar Python

Desde la raíz del repositorio. En macOS normalmente el comando es `python3` y `pip3`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r scripts/requirements.txt
```

Si tu sistema sí tiene `python`, también funciona:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r scripts/requirements.txt
```

En Windows PowerShell, la activación del entorno suele ser:

```powershell
.venv\Scripts\Activate.ps1
```

## 4. Preparar la planilla

El archivo puede ser `.xlsx` o `.csv`. Como mínimo debe tener columnas equivalentes a:

| Columna requerida | Alias aceptados |
| --- | --- |
| `accession_code` | `ID`, `codigo`, `codigo_accesion`, `código`, `código_accesión`, `code`, `id_accesion` |
| `scientific_name` | `especie`, `species`, `nombre_cientifico`, `nombre_científico` |

Columnas opcionales:

| Campo | Alias aceptados |
| --- | --- |
| `collector` | `colector`, `recolector` |
| `collection_date` | `fecha_colecta`, `fecha_de_colecta`, `fecha_cosecha`, `fecha_de_cosecha`, `fecha` |
| `country` | `pais`, `país` |
| `province` | `provincia`, `estado` |
| `locality` | `localidad`, `sitio` |
| `latitude` | `latitud`, `lat` |
| `longitude` | `longitud`, `lon`, `lng` |
| `seed_quantity` | `cantidad_semillas`, `semillas`, `cantidad`, `N° Germ.`, `n_germ`, `nro_germ`, `numero_germenes` |
| `available` | `disponible`, `disponibilidad` |
| `storage_location` | `ubicacion_almacenamiento`, `ubicación_almacenamiento`, `caja` |
| `observations` | `observaciones`, `notas`, `notes`, `obs`, `observaciones_conservacion` |

Ejemplo CSV mínimo:

```csv
accession_code,scientific_name,collector,country,province,seed_quantity,available
PAS-001,Paspalum notatum,Juan Perez,Argentina,Corrientes,120,true
PAS-002,Paspalum dilatatum,Ana Gomez,Argentina,Entre Rios,0,false
```

## 5. Ejecutar la importación

Opción A: pasar credenciales por variables de entorno:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
python scripts/import_excel.py data/accessions.xlsx
```

> En macOS, después de activar `.venv`, `python` debería apuntar al Python del entorno virtual. Si no pasa, usá `.venv/bin/python scripts/import_excel.py ...`.

Opción B: pasar credenciales por argumentos:

```bash
python scripts/import_excel.py data/accessions.xlsx \
  --supabase-url "https://tu-proyecto.supabase.co" \
  --service-role-key "tu-service-role-key"
```

Si el Excel tiene varias hojas, indicá la hoja:

```bash
python scripts/import_excel.py data/accessions.xlsx \
  --sheet-name "Accesiones" \
  --supabase-url "https://tu-proyecto.supabase.co" \
  --service-role-key "tu-service-role-key"
```

Al finalizar deberías ver un mensaje similar a:

```text
Imported 125 accessions.
```

## 6. Verificar en Supabase

En **SQL Editor**, podés validar que se cargaron datos con:

```sql
select count(*) from species;
select count(*) from accessions;
select count(*) from inventory;
select * from accession_catalog limit 20;
```

Después, configurá el frontend con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` y abrí `/catalog`.


## Alternativa sin Python: cargar un SQL en Supabase

Si no podés correr Python localmente, usá el SQL Editor de Supabase:

1. Abrí **Supabase → SQL Editor**.
2. Ejecutá primero `supabase/migrations/001_initial_schema.sql`.
3. Ejecutá `supabase/migrations/002_refresh_catalog_view.sql` si tu vista no tiene `collector`.
4. Para datos demo, pegá y ejecutá `supabase/seeds/001_sample_accessions.sql`.
5. Para importar la Google Sheet compartida, pegá y ejecutá `supabase/seeds/002_import_google_sheet_accessions.sql`.

El seed `002_import_google_sheet_accessions.sql` usa la extensión `http` de Supabase para leer la Google Sheet con Google Visualization API y poblar `species`, `accessions` e `inventory`. Si Supabase devuelve un error de permisos o de HTTP, verificá que la hoja siga compartida como pública o que la extensión `http` esté habilitada en **Database → Extensions**.

## Errores comunes


### `zsh: command not found: python` o `zsh: command not found: pip` en macOS

macOS suele traer `python3` en lugar de `python`, y puede no traer `pip` como comando global. Usá:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r scripts/requirements.txt

SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
python scripts/import_excel.py accessions.xlsx
```

Si `python3` tampoco existe, instalá Python 3 desde <https://www.python.org/downloads/macos/> o con Homebrew:

```bash
brew install python
```

Después cerrá y abrí la terminal, volvé a la carpeta del repo y repetí los comandos con `python3`.

### `ModuleNotFoundError: No module named 'supabase'`

Significa que las dependencias no quedaron instaladas en el entorno virtual. En tu ejemplo aparece `^C` y `ERROR: Operation cancelled by user`, o sea que `pip install -r scripts/requirements.txt` fue cancelado antes de terminar.

Solución:

```bash
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

Cuando termine sin errores, recién ejecutá el importador.

### No usar los valores de ejemplo

Estos valores son placeholders y no sirven para importar:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

Tenés que reemplazarlos por los valores reales de **Supabase → Project Settings → API**.


### `Missing required columns: accession_code`

La planilla compartida usa `ID` como identificador de accesión. Las versiones anteriores del importador no lo reconocían como `accession_code`. Actualizá el script y volvé a ejecutar:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key" \
python scripts/import_excel.py accessions.xlsx
```

El importador ahora acepta `ID` e `id_accesion` como alias de `accession_code`. Si vuelve a fallar, el error muestra las columnas detectadas para ajustar el nombre de la columna.

### `Input file not found: data/accessions.xlsx`

El archivo debe existir en esa ruta. Si tu planilla está en otra ubicación, pasá esa ruta:

```bash
python scripts/import_excel.py /ruta/a/tu/planilla.xlsx
```
