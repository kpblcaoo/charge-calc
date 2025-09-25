# Initial Migration Plan: Python -> TypeScript Web App

Date: 2025-09-25
Branch: `webapp/ts-migration`

## Goal
Deliver minimal usable web app that loads XLSX or EDF and shows cycle/step charges in a table with export options, matching Python logic.

## Phases
### Phase 0: Repository Prep
- [x] Create migration branch
- [x] ADR 001 drafted
- [ ] Add Node/Vite scaffold

### Phase 1: Scaffold
- Initialize `package.json`, Vite + TS template
- Add tooling: ESLint, Prettier, Vitest, Zod
- Create base folders: `src/domain`, `src/parsing`, `src/worker`, `src/ui`, `src/validation`, `src/utils`
- Add `index.html`, `main.tsx`, `App.tsx`

### Phase 2: Domain & Core Logic
- Implement `calculateCharge.ts` (port Python logic)
- Implement `assemble.ts` (token -> domain)
- Define types (`types.ts`)
- Unit tests for charge algorithm

### Phase 3: Parsing Layer
- Implement EDF token extractor `extractTokensFromEdf.ts`
- Implement XLSX token extractor `extractTokensFromXlsx.ts` (SheetJS lazy import)
- Implement MIME detection `detectMime.ts`
- Shared interface `Token { key:string; values:string[] }`
- Tests for tokenizers + detection

### Phase 4: Validation
- Zod schemas (`schema.ts`)
- `validateResult.ts` wrapper
- Add tests for schema enforcement (bad data rejection)

### Phase 5: Worker Integration
- `parser.worker.ts` with message protocol
- Message types in `messages.ts`
- Main thread wrapper `parseFileInWorker(file: File)` returning Promise<ParsedResult>
- Test worker (fallback to direct call in test env)

### Phase 6: UI
- `FileDropZone.tsx` (input + drag events + MIME pre-check)
- State handling in `App.tsx`
- Render table `ResultsTable.tsx`
- Loading / error display
- Export CSV/JSON buttons

### Phase 7: Polish & QA
- Basic CSS (no framework initially)
- Large EDF performance smoke test
- Bundle size check
- Update README

### Phase 8: Stretch (Optional / Later)
- XLSX export
- Persistent settings (localStorage)
- Theming / dark mode

## Acceptance Criteria
- Load EDF sample -> shows charges identical (within float tolerance) to Python output.
- Load XLSX sample -> same.
- Invalid file or wrong MIME -> clear error.
- No main-thread freeze when parsing EDF (checked via DevTools performance or responsiveness).

## Risks & Mitigations
- Large file memory spike: stream EDF line reading with incremental split.
- XLSX library size: dynamic import when first XLSX used.
- Worker bundling quirks: verify Vite worker syntax (`new Worker(new URL('./parser.worker.ts', import.meta.url), { type: 'module' })`).

## Task Breakdown (Granular)
1. Scaffold Vite + TS
2. Add dependencies: zod, xlsx, vitest, @types/node, eslint, prettier
3. Domain: types + calculateCharge + tests
4. assemble.ts + tests
5. EDF extractor + tests
6. MIME detector + tests
7. XLSX extractor (lazy) + tests
8. Validation schema + tests
9. Worker + message protocol
10. Worker wrapper + test
11. UI components
12. CSV/JSON export utils
13. Integration test (manual) with provided EDF
14. README update

## Done Definition
All acceptance criteria satisfied, tests pass, lint clean, ADR committed.
