# APIverse Importer System

Robust, fault-tolerant system to import 1000+ APIs into the PostgreSQL database.

## Usage

### 1. Basic Import (Safe)
Defaults to local JSON files in `data/`.
```bash
npx tsx scripts/import-apis.ts
```

### 2. Dry Run
Test the process without writing to DB.
```bash
npx tsx scripts/import-apis.ts --dry
```

### 3. Production Import
Requires specific flag to allow writing to non-local DB.
```bash
npx tsx scripts/import-apis.ts --allow-prod
```

### 4. Options
- `--force`: Ignore non-fatal errors.
- `--batch=100`: Set batch size (default 50).

## Architecture
- **Adapter**: Reads `prisma/schema.prisma` to dynamically determine valid fields.
- **Normalizer**: Cleans raw JSON (trims strings, maps enums).
- **Fallback**: Tries transaction batch -> falls back to row-by-row on failure.
- **Logging**: `logs/` directory contains detailed run logs.

## Troubleshooting
- **Error: Unknown arg**: The schema adapter failed to strip a field. Check `scripts/helpers/schema-adapter.ts`.
- **Database Connection**: Ensure `DATABASE_URL` is correct.
