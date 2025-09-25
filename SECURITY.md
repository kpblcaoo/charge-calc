# Security Notes

## Current Known Advisories

| Dependency | Advisory IDs | Severity | Status |
|------------|-------------|----------|--------|
| xlsx 0.18.x | GHSA-4r6h-8v6p-xvw6 (Prototype Pollution), GHSA-5pgg-2g8v-p4x9 (ReDoS) | High | No upstream fix yet |
| esbuild (transitive via vite<5.4) | GHSA-67mh-4wv8-2f99 | Moderate | Mitigated by upgrading Vite |

## Mitigations
- `vite` upgraded to `^5.4.10` to pull a patched esbuild.
- XLSX usage restricted to user-provided local files (no remote ingestion); reduces exploit surface.
- Consider sandboxing parsing in a dedicated Worker (already planned – worker exists) and adding timeouts for large regex operations.

## Action Items
- Track SheetJS changelog for patched release addressing both advisories.
- Add size/time guard: reject XLSX > configurable threshold (e.g. 25MB) to minimize potential ReDoS.
- Validate object shapes post-parse (already done via assemble pipeline and upcoming Zod enforcement) to reduce prototype pollution impact.

## Reporting
Open an issue or contact maintainers if a new vulnerability is found.
