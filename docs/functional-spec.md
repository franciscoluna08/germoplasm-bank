# Germoplasm Bank - Especificación funcional MVP

## Objetivo

Construir una plataforma web pública para consultar accesiones de un banco de germoplasma. La fuente actual de datos es una planilla de Google Sheets con accesiones de especies del género _Paspalum_ y datos asociados.

## Alcance del MVP

El MVP implementa solamente el **Módulo 1: Catálogo de Accesiones**.

Quedan fuera de alcance:

- Roles múltiples.
- Solicitudes de material.
- Administración de usuarios.
- Edición desde frontend.
- Auditoría.
- Estadísticas.
- Mapas.

## Usuario

Existe un único tipo de usuario conceptual: **Investigador**.

No se implementa autenticación en esta primera versión. El sistema es de consulta pública.

## Funcionalidades

### Home

Pantalla principal con buscador. Permite búsqueda por:

- Código de accesión.
- Especie.
- Colector.
- País.
- Provincia.

### Catálogo

Tabla de accesiones con columnas:

- Código.
- Especie.
- País.
- Provincia.
- Disponibilidad.

Filtros disponibles:

- Especie.
- País.
- Provincia.
- Disponible / No disponible.

### Detalle de Accesión

Muestra:

- Código.
- Especie.
- Colector.
- Fecha de colecta.
- País.
- Provincia.
- Localidad.
- Latitud.
- Longitud.
- Cantidad de semillas.
- Estado de disponibilidad.
- Observaciones.

## Stack tecnológico

- Frontend: Next.js, TypeScript y Tailwind CSS.
- Backend: Supabase con PostgreSQL y API REST automática.
- Autenticación: no incluida en el MVP.

## Modelo de datos

El modelo inicial se define en `supabase/migrations/001_initial_schema.sql` e incluye:

- `species`: especies con nombre científico único.
- `accessions`: datos de colecta y procedencia de cada accesión.
- `inventory`: cantidad de semillas, disponibilidad y ubicación de almacenamiento.
- `accession_catalog`: vista para consultas del catálogo.
