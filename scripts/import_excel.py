#!/usr/bin/env python3
"""Import accession data from Excel/CSV into Supabase.

Expected columns can be provided in Spanish or English. The importer normalizes
common labels such as "codigo", "accession_code", "especie", "scientific_name",
"colector", "pais", "provincia", "cantidad_semillas" and "disponible".
"""

from __future__ import annotations

import argparse
import importlib.util
import os
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path
from typing import Any

REQUIRED_PACKAGES = {
    "pandas": "pandas",
    "openpyxl": "openpyxl",
    "supabase": "supabase",
}


def ensure_dependencies() -> None:
    missing = [
        package
        for module, package in REQUIRED_PACKAGES.items()
        if importlib.util.find_spec(module) is None
    ]
    if missing:
        packages = ", ".join(missing)
        raise SystemExit(
            "Missing Python dependencies: "
            f"{packages}. Activate your virtual environment and run: "
            "pip install -r scripts/requirements.txt"
        )


ensure_dependencies()

import pandas as pd
from supabase import Client, create_client

PLACEHOLDER_VALUES = {
    "https://tu-proyecto.supabase.co",
    "https://your-project.supabase.co",
    "tu-service-role-key",
    "your-service-role-key",
}

COLUMN_ALIASES = {
    "accession_code": {
        "accession_code",
        "codigo",
        "codigo_accesion",
        "código",
        "código_accesión",
        "code",
        "id",
        "id_accesion",
    },
    "scientific_name": {"scientific_name", "especie", "species", "nombre_cientifico", "nombre_científico"},
    "collector": {"collector", "colector", "recolector"},
    "collection_date": {
        "collection_date",
        "fecha_colecta",
        "fecha_de_colecta",
        "fecha_cosecha",
        "fecha_de_cosecha",
        "fecha",
    },
    "country": {"country", "pais", "país"},
    "province": {"province", "provincia", "estado"},
    "locality": {"locality", "localidad", "sitio"},
    "latitude": {"latitude", "latitud", "lat"},
    "longitude": {"longitude", "longitud", "lon", "lng"},
    "seed_quantity": {
        "seed_quantity",
        "cantidad_semillas",
        "semillas",
        "cantidad",
        "n_germ",
        "nro_germ",
        "numero_germenes",
        "número_gérmenes",
        "germenes",
        "gérmenes",
    },
    "available": {"available", "disponible", "disponibilidad"},
    "storage_location": {"storage_location", "ubicacion_almacenamiento", "ubicación_almacenamiento", "caja"},
    "observations": {"observations", "observaciones", "notas", "notes", "obs", "observaciones_conservacion"},
}

TRUE_VALUES = {"true", "1", "si", "sí", "yes", "y", "disponible"}
FALSE_VALUES = {"false", "0", "no", "n", "no disponible", "nodisponible"}


def normalize_header(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.strip().lower())
    value = "".join(character for character in value if not unicodedata.combining(character))
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def canonical_columns(frame: pd.DataFrame) -> pd.DataFrame:
    alias_lookup = {
        normalize_header(alias): canonical
        for canonical, aliases in COLUMN_ALIASES.items()
        for alias in aliases
    }
    return frame.rename(
        columns={column: alias_lookup.get(normalize_header(str(column)), column) for column in frame.columns}
    )


def clean_text(value: Any) -> str | None:
    if pd.isna(value):
        return None
    if isinstance(value, float) and value.is_integer():
        text = str(int(value))
    else:
        text = str(value).strip()
    return text or None


def clean_int(value: Any, default: int = 0) -> int:
    if pd.isna(value) or value == "":
        return default
    return int(float(value))


def clean_float(value: Any) -> float | None:
    if pd.isna(value) or value == "":
        return None
    return float(value)


def clean_bool(value: Any, default: bool = True) -> bool:
    if pd.isna(value) or value == "":
        return default
    normalized = normalize_header(str(value)).replace("_", " ")
    compact = normalized.replace(" ", "")
    if normalized in TRUE_VALUES or compact in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES or compact in FALSE_VALUES:
        return False
    return default


def clean_date(value: Any) -> str | None:
    if pd.isna(value) or value == "":
        return None
    if isinstance(value, datetime | date):
        return value.isoformat()[:10]
    parsed = pd.to_datetime(value, errors="coerce", dayfirst=True)
    if pd.isna(parsed):
        return None
    return parsed.date().isoformat()


def read_input(path: Path, sheet_name: str | int | None) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    return pd.read_excel(path, sheet_name=sheet_name or 0)


def require_columns(frame: pd.DataFrame) -> None:
    required = ("accession_code", "scientific_name")
    missing = [column for column in required if column not in frame.columns]
    if missing:
        detected_columns = ", ".join(str(column) for column in frame.columns)
        accepted_aliases = "; ".join(
            f"{column}: {', '.join(sorted(aliases))}"
            for column, aliases in COLUMN_ALIASES.items()
            if column in required
        )
        raise ValueError(
            "Missing required columns after normalizing headers: "
            f"{', '.join(missing)}. Detected columns: {detected_columns}. "
            f"Accepted aliases: {accepted_aliases}."
        )


def upsert_species(client: Client, scientific_name: str) -> str:
    response = (
        client.table("species")
        .upsert({"scientific_name": scientific_name}, on_conflict="scientific_name")
        .execute()
    )
    species = response.data[0]
    return species["id"]


def upsert_accession(client: Client, row: pd.Series, species_id: str) -> str:
    payload = {
        "accession_code": clean_text(row.get("accession_code")),
        "species_id": species_id,
        "collector": clean_text(row.get("collector")),
        "collection_date": clean_date(row.get("collection_date")),
        "country": clean_text(row.get("country")),
        "province": clean_text(row.get("province")),
        "locality": clean_text(row.get("locality")),
        "latitude": clean_float(row.get("latitude")),
        "longitude": clean_float(row.get("longitude")),
        "observations": clean_text(row.get("observations")),
    }
    response = (
        client.table("accessions")
        .upsert(payload, on_conflict="accession_code")
        .execute()
    )
    accession = response.data[0]
    return accession["id"]


def upsert_inventory(client: Client, row: pd.Series, accession_id: str) -> None:
    payload = {
        "accession_id": accession_id,
        "seed_quantity": clean_int(row.get("seed_quantity")),
        "available": clean_bool(row.get("available")),
        "storage_location": clean_text(row.get("storage_location")),
    }
    client.table("inventory").upsert(payload, on_conflict="accession_id").execute()


def import_accessions(client: Client, frame: pd.DataFrame) -> int:
    imported = 0
    for _, row in frame.iterrows():
        accession_code = clean_text(row.get("accession_code"))
        scientific_name = clean_text(row.get("scientific_name"))
        if not accession_code or not scientific_name:
            continue

        species_id = upsert_species(client, scientific_name)
        accession_id = upsert_accession(client, row, species_id)
        upsert_inventory(client, row, accession_id)
        imported += 1

    return imported


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import Excel/CSV accession data into Supabase.")
    parser.add_argument("input_file", type=Path, help="Path to the Excel or CSV file.")
    parser.add_argument("--sheet-name", help="Excel sheet name or index. Defaults to the first sheet.")
    parser.add_argument("--supabase-url", default=os.getenv("SUPABASE_URL"), help="Supabase project URL.")
    parser.add_argument(
        "--service-role-key",
        default=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        help="Supabase service role key for server-side imports.",
    )
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if not args.supabase_url or not args.service_role_key:
        raise SystemExit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
    if args.supabase_url in PLACEHOLDER_VALUES or args.service_role_key in PLACEHOLDER_VALUES:
        raise SystemExit(
            "Replace the example Supabase URL/key with your real values from Supabase Project Settings > API."
        )
    if not args.input_file.exists():
        raise SystemExit(f"Input file not found: {args.input_file}")


def main() -> None:
    args = parse_args()
    validate_args(args)

    frame = canonical_columns(read_input(args.input_file, args.sheet_name))
    require_columns(frame)

    client = create_client(args.supabase_url, args.service_role_key)
    imported = import_accessions(client, frame)
    print(f"Imported {imported} accessions.")


if __name__ == "__main__":
    main()
