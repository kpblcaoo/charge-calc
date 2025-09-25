# Charge Calc

Web-based charge calculation tool with support for EDF (text token format) and XLSX experiment files. Migrated from an earlier monolithic Python script to a modular TypeScript + React + Web Worker architecture.

## Features
- Parse large EDF (≈130k lines) without freezing UI (Web Worker off‑thread parsing)
- Parse XLSX (SheetJS) with the same domain assembly pipeline
- MIME + magic bytes detection (ZIP signature for XLSX; heuristic token lines for EDF)
- Charge calculation identical to legacy Python logic:
  - Use last explicit charge value if present
  - Otherwise integrate current over time (constant current optimization / trapezoidal rule)
- Zod runtime validation (planned – schema present)
- Simple drag & drop UI + tabular results + per‑step and per‑cycle totals

## Repository Layout
```
├─ charge_calculator.py        # Legacy Python (will be deprecated)
├─ parser_core.py              # Shared Python token assembler (legacy ref)
├─ docs/
│  └─ adr/001.md               # Architecture Decision Record for migration
├─ plans/
│  └─ initial_migration_plan.md
├─ src/
│  ├─ domain/                  # Pure domain logic (types, assemble, charge)
│  ├─ parsing/                 # Format detection & token extraction
│  ├─ worker/                  # Web Worker + message protocol
│  ├─ ui/                      # React components
│  ├─ validation/              # Zod schemas & validation helper
│  └─ tests/                   # Vitest tests
├─ index.html                  # Vite entry
├─ package.json
├─ tsconfig.json
```

## Quick Start (Web App)
### Prerequisites
- Node.js 22.12+ (aligns with `engines` in package.json for Vite 7 / React 19)
- npm / pnpm / yarn (examples use npm)

### Install
```bash
npm install
```

### Dev Server
```bash
npm run dev
```
Open the printed local URL (default http://localhost:5173). Drag an `.edf` or `.xlsx` file into the drop zone.

### Tests
```bash
npm test
```
`vitest` runs unit tests (currently charge calculation). Add more for parsing & detection as the app evolves.

### Type Checking
```bash
npm run typecheck
```

### Production Build
```bash
npm run build
npm run preview   # Serve production build locally
```

## Usage Flow
1. User selects/drops file
2. File passed to Web Worker via `parseFileInWorker`
3. Worker detects format (magic bytes + heuristics)
4. Format-specific token extractor emits uniform tokens
5. `assemble` builds domain structure (Cycles → Steps → DataPoints)
6. Charge computed per step + totals (currently annotated ad-hoc; can be formalized)
7. UI renders results table

## EDF Format (Simplified)
Lines of key + values, e.g.
```
cy 1
st 1
dp  10.0000  3.8249  0.00199
dp  20.0000  3.8831  0.00199
```
Keys used: `cy` (cycle), `st` (step), `dp` (data point), optional `de` (step end). Unrecognized lines ignored.

## XLSX Format (Legacy)
Rows where first cell contains token (`cy`, `st`, `dp`, `de`). Remaining cells provide values analogous to EDF. Additional columns may contain an explicit `charge` value (if present, used directly).

## Design Rationale
See `docs/adr/001.md` for full ADR. Highlights:
- Single Responsibility: UI, parsing, domain, validation, and computation separated
- Extensibility: Adding a new format = new token extractor + detection rule only
- Performance: Worker isolates heavy parsing and prevents main-thread stalls
- Safety: Zod schema (enforcement hook ready; integrate after full test coverage)

## Adding a New Format
1. Implement `extractTokensFrom<Format>.ts` returning `Token[]`
2. Extend `detectMime` with magic/heuristics
3. (Optional) Add specific tests
4. No change needed in `assemble` or `calculateCharge`

## Exporting Results
(Not yet implemented) – Planned features: CSV/JSON export; possibly XLSX generation.

## Python Legacy Script
`charge_calculator.py` retained temporarily for regression parity while validating TypeScript port. It will be removed once web version reaches feature parity + test coverage.

## Roadmap
- [ ] Zod validation integrated in worker response
- [ ] Additional tests: EDF parsing, XLSX parsing, mime detection
- [ ] CSV/JSON export utilities
- [ ] Performance benchmark (EDF large file) + metrics doc
- [ ] ESLint + Prettier config
- [ ] Charge annotation normalization (store computed charge explicitly)

## Docker
Build production container:
```bash
docker build -t charge-calc:latest .
```
Run it (serves on port 8080 locally -> container 80):
```bash
docker run --rm -p 8080:80 charge-calc:latest
```
Open http://localhost:8080 and upload an `.edf` or `.xlsx` file.

Quick one-liner:
```bash
docker build -t charge-calc . && docker run --rm -p 8080:80 charge-calc
```

Health check endpoint (for k8s / compose):
```bash
curl http://localhost:8080/healthz
```

### Makefile Shortcuts
After adding the `Makefile`, you can use:
```
make build           # docker build
make run PORT=9090   # run on custom port
make logs            # follow logs
make stop            # stop container
make clean           # remove container & image
```

For iterative local development you usually still prefer the native dev server (`npm run dev`). The container image is optimized for production (static assets via nginx, long‑term caching for hashed files, SPA fallback, health probe).


## Contributing
1. Create branch from `webapp/ts-migration` (or future `main` once merged)
2. Run dev & tests before commit
3. For new format: include minimal test vectors
4. Update ADR or add a new one for architectural changes

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Worker not loading | Wrong path or bundler config | Check `new URL('./parser.worker.ts', import.meta.url)` syntax |
| XLSX parse fails | Corrupt file / unsupported sheet | Verify file opens in Excel; inspect console errors |
| EDF misdetected as XLSX | ZIP magic present | Ensure file truly plain text; adjust heuristic |
| UI freeze | Large file parsed on main thread | Confirm worker path & no import fallback executed |

## License
(Choose and add LICENSE file – placeholder)
