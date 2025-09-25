# Threat Model (Initial)

## Assets
- User experiment files (EDF / XLSX) – potentially sensitive research data.
- Computed charge metrics (derived data).
- Application availability (front-end SPA + worker).

## Trust Boundaries
1. Browser boundary: Untrusted file input from user -> parsing worker.
2. Worker boundary: Raw bytes -> token extraction -> domain model.
3. Build/runtime boundary: Static hosting (nginx) – no server-side processing.

## Adversaries & Motivations
- Casual attacker uploading crafted file to trigger DoS (large / malformed file) or high CPU.
- Malicious researcher attempting to exfiltrate data from prior sessions (side‑channel / residual references) – low risk since single-page ephemeral state only.
- Supply chain attacker (malicious dependency / CDN tarball for `xlsx`).

## Entry Points
- File upload (drag/drop or selector).
- Application static assets (could be modified if host compromised).

## Key Risks
| Risk | Impact | Likelihood | Notes / Mitigation |
|------|--------|------------|--------------------|
| Memory/CPU exhaustion via huge file | DoS | Medium | Enforced `MAX_FILE_BYTES` (25MB) – tune & surface message. |
| Infinite / pathological parse loops | DoS | Low | Simple linear tokenization; add line cap safeguard. |
| Malicious XLSX payload exploiting parser | Code exec in worker | Low/Medium | SheetJS sandboxed in worker; keep dependency updated. Consider AV scanning server-side if added later. |
| Dependency supply chain compromise | Data theft / XSS | Medium | Pin exact versions; use integrity hashes if self-hosting packages. Review changelogs. |
| Tampering with served JS | User data exposure | Medium | Enable HTTPS + subresource integrity (future). CSP headers if adding external scripts. |
| Parsing result schema spoofing | Logic errors | Low | Zod validation now enforced in worker. |
| Leakage of prior file data | Privacy | Low | Reset in-memory state on each upload; avoid global caches. |
| Zip bomb disguised as XLSX | DoS | Low | Could add decompressed size limit guard (future). |

## Existing Controls
- Size limit (`MAX_FILE_BYTES`).
- Web Worker isolation for parsing & heavy libs.
- Zod schema validation before posting back to main thread.
- Exact version pinning in `package.json`.
- Docker multi-stage minimal runtime (nginx) – reduces attack surface.

## Gaps / TODO
- Add line count limit for EDF (e.g., 250k lines) with explicit error.
- Implement optional integrity hash check for the `xlsx` tarball (if not vendored).
- CSP & Subresource Integrity for future external assets.
- Fuzz tests for EDF parser (random tokens / large lines).
- Performance test harness to detect regression (avoid algorithmic complexity creep).
- Optional checksum logging for user-provided files (audit trail) – only if privacy compliant.
- Consider sandboxing via iframe / COOP/COEP if future WebAssembly or worker pooling added.

## Abuse Cases
1. Upload file slightly over limit repeatedly -> user frustration: Provide clear error & doc limit.
2. Upload 0-byte or binary garbage file -> ensure error surfaces fast (current detection throws quickly for unsupported format).
3. Attempt to create many workers by rapid uploads -> single shared worker instance prevents explosion (client side). Could queue / debounce UI events.

## Residual Risk
Acceptable for current MVP; primary exposure is client-side only. Reevaluate if backend or persistence features introduced.

## Review Cadence
Revisit threat model at every minor release or when adding: new file formats, export features (esp. server interaction), or remote fetching of data.
