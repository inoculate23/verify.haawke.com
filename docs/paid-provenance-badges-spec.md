# Paid provenance badges — product and implementation specification

Status: proposal; no production changes. Owner: Craig Ellenwood, Haawke Neural Technology, LLC.
Branch: spec/paid-provenance-badges.

## Product decision
Sell managed version registration, downloadable evidence, installation and monitoring. Public verification stays free. The badge links people to inspectable evidence; payment never purchases a favorable verification result.
Initial audience hypothesis: independent researchers and creators distributing documents and public websites. Interview five prospects and seek three paid pilots before building subscription infrastructure. No demand or willingness-to-pay has been established.

## Current implementation, inspected in this repository
The main-branch index.html badge fetches ./provenance.json, reads its hash/date, fetches ./index.html with a cache-busting query, decodes the response as text, re-encodes it with TextEncoder and compares SHA-256 locally. It does not call the Worker for this badge check. Author text is taken from the badge element, not provenance.json. The registry results elsewhere on the page call the Worker.
Consequently a local match alone is not independent certification: someone able to replace both page and sidecar can replace both hashes. It does not cover external CSS, scripts, images, linked documents or live APIs. Text decoding/re-encoding is not an exact-byte guarantee. Runtime behavior on the deployed site may differ from repository main and must be checked before implementation.
Leave the existing sidecar, historical attribution, hashes and proofs untouched. Do not replace historical attribution with current identity merely for consistency. Add a new version when certifying a changed artifact.

## Claims and evidence
Display separate dimensions:
- Registered: a matching record is present.
- File integrity: supplied/downloaded bytes match the registered digest.
- Certificate: signature verified against a pinned/versioned trusted public key.
- Bitcoin timestamp: pending, confirmed, failed or unavailable; show verified block/time only when proof supports it.
- Identity: self-declared, ORCID account control verified, or organization control verified, with method/date.
A Haawke Ed25519 signature authenticates Haawke's signed statement. It does not prove the named creator made the artifact. ORCID text alone is self-declared; OAuth control is not proof of copyright. Bitcoin anchoring supports existence of a cryptographic commitment no later than its confirmed block, not the claimed creation date, truth, originality, ownership or legal admissibility.
Avoid blanket "authentic", "copyright verified", "secure site" and "AI-free" claims.

## MVP customer journeys
Document: select a final original locally; hash original bytes in browser; preview public metadata and privacy consequences; explicit registration authorization; purchase; register once; issue signed manifest and pending OTS proof; upgrade proof asynchronously; provide ZIP with original-independent manifest, signature, public-key identifier, .ots, instructions and PNG/SVG/QR badge.
Do not upload originals by default. Exported badge is separate from the original file. Embedding a badge inside a PDF changes its hash: distinguish the original digest from a newly finalized badged derivative, or use an associated detached certificate.
Website: verify control with DNS TXT or a well-known challenge; select exact static artifact or declared multi-file manifest; install badge before capturing final bytes; register finalized version; deploy matching detached manifest; independently verify hosted bytes. Every content change creates a new version.
Websites with dynamic/personalized HTML need a clearly labeled snapshot. Never silently strip CSS, redact, normalize or reserialize originals. A snapshot claim is not a claim about the whole live site.

## Badge design
Compact cream-and-gold seal with Haawke mark and text "Provenance record"; accessible high contrast and clear focus state; no generated artwork or imitation third-party trust marks.
Two lines: "HAAWKE / PROVENANCE" and "View version & proof". Expanded verification page reports actual states separately. Gold indicates brand, not all-green evidence.
SVG/image plus ordinary external verification link is the default; optional script only for live checks. Static exported image must say "View proof" rather than promise live verification.
Pending timestamp uses "Bitcoin timestamp pending"; errors use "Verification unavailable"; mismatch says "Version differs" and identifies measured scope. Never call every mismatch malicious tampering.
Screen-reader label, keyboard access, reduced motion, mobile fit, dark/light variants, no content obstruction. No tracking pixels or hidden analytics. Third-party embeds disclose request metadata and caching limitations.

## Proposed pricing experiments (USD; unvalidated, not launched)
- Public verification: free without an account.
- Single final document evidence pack: $5 one time.
- Creator: $9/month, 25 new artifact versions/month, reusable badge downloads and exports.
- Website: $15/month/domain, 50 new versions/month and daily monitoring.
- Assisted installation: $49 one time after scope confirmation.
No automatic overages. Canceling ends monitoring/new issuance, not access to previously issued proofs. Do not promise perpetual hosted availability; make independent offline verification possible. Revisit limits after measuring costs and support time.
Keep identity verification out of paid MVP until an actual verification method and revocation policy exist.

## Architecture and state
Existing registry is an integration dependency, not assumed safe for multi-tenant commercialization.
Proposed server APIs: checkout; payment webhook; registration intent; authorize registration; version issuance; domain challenge; badge metadata; signed-manifest/proof download; monitoring status. Names and schemas must be finalized after Worker audit.
Authenticate registration, authorize per tenant, use idempotency per payment and registration, validate all metadata, keep secrets server-side, handle duplicate artifact hashes across different claimants without transferring ownership or overwriting prior claims.
Separate artifact digest from claim IDs: several people may make different claims concerning identical bytes. Registry sequence is receipt order, not proof of chronology or ownership.
Store immutable signed claims plus append-only corrections/revocations and version relations. Timestamp proof upgrades are append-only proof revisions with their own integrity, not rewrites of signed history.
Monitor results: version_match, version_differs, unreachable, unsupported_dynamic. Registration: draft, authorized, payment_confirmed, registered, timestamp_pending, timestamp_confirmed, failed. Payment is not a verification state.
Webhooks must be signature-validated, replay-safe, and resilient to retries and out-of-order events. Pin payment implementation to official provider documentation when implemented.
Domain fetcher must prevent SSRF to private/local/link-local/metadata targets, validate DNS/IP at connection and every redirect, cap bytes/time/redirects, require HTTPS and verify domain ownership. No customer URL fetches during this spec.
Render public metadata using text nodes and allowlisted URLs; current template innerHTML paths require review before accepting untrusted customer inputs.

## Privacy, trust and portability
Preview exactly what becomes public: hashes can be correlatable, filenames and metadata can expose confidential information. No default thumbnails, source text, session IDs, email or private archive paths.
Public artifact listing requires explicit opt-in; possession of a digest does not authorize publishing private source information. Define retention and removal handling before accepting customers; external Bitcoin commitments cannot be erased by Haawke.
Publish verification algorithm, supported byte scope, canonical signed claim encoding, key history, rotation/revocation process, offline verification instructions, and failure behavior. Do not assert storage-level immutability from first-write-wins application logic alone.
Keep the submitted ChatGPT connector verification-only: no registration, payment, account or original-file access added to it. Any future write-enabled product requires separate design, authorization and review.

## Douglas and Rachel public-archive pilot
Use only the specifically approved public archive deployment. The larger private preservation collection is not input to the badge, manifest, registration, build or deployment.
Identify repository, deployment and approved public artifact boundary before editing. Add one tasteful badge linking to evidence for an explicitly scoped public version. Preserve original artwork and original source bytes; badge belongs to the public application shell, not preserved originals. Do not expose restricted manuscripts, private source paths or new materials.
Use no unproven status claims. If version evidence is not ready, label the link as provenance information rather than verified. Obtain Craig's approval for the concrete final diff before production deployment.

## Delivery milestones
1. Audit deployed badge and Worker; map actual schemas, keys, proof handling and authorization; resolve main/deployment differences.
2. Public-archive badge pilot on isolated branch; visual review at desktop/mobile; verify target record and accessible link.
3. Local document issuance prototype with portable proofs, privacy preview and explicit authorization.
4. Three manually assisted paid pilots; log issuance cost, support time, completion rate, proof success and willingness to repurchase.
5. Only after validation: billing, tenant isolation, domain control and monitoring.

## Acceptance checks
Modified original byte fails comparison; external dependency change has explicit covered/uncovered status; changing page plus sidecar cannot impersonate an independently signed registered claim.
Pending is never confirmed; unavailable never means invalid; self-declared attribution never becomes verified identity.
Copied badge leads to the original scope and does not validate unrelated content. Cancellation does not invalidate old cryptographic evidence.
Duplicate payment events issue no duplicate charges/credits/claims. Cross-tenant writes fail. Malicious filenames/URLs do not execute HTML/script. SSRF redirect tests fail closed.
Document original remains byte-identical. PDF badging exports a separately identified derivative. Offline proof verifies without Haawke.
Public-archive diff contains no private preservation material. Mobile badge does not cover controls and is keyboard-accessible.

## Approval boundary
This branch contains planning only. No billing, registration, identity changes, recertification, main-branch modification or production deployment is authorized by this specification.
