# Haawke Verify

![Haawke Verify](https://verify.haawke.com/og.jpg)

**Public provenance registry for cryptographically certified human-AI collaborative works.**

Live: [verify.haawke.com](https://verify.haawke.com)  
Registry API: [haawke-verify.haawkeai.workers.dev](https://haawke-verify.haawkeai.workers.dev)  
Hash Tool: [hash.haawke.com](https://hash.haawke.com)  
ORCID: [0009-0001-6475-5109](https://orcid.org/0009-0001-6475-5109)

---

## What It Does

A public-facing interface for the Haawke Provenance Registry — a Cloudflare KV append-only store of SHA-256 hashes certified by Craig Ellenwood × Claude (Anthropic).

- **Verify any hash** — paste a SHA-256 and instantly check if it exists in the registry
- **Browse recent registrations** — live feed of the latest certified works
- **Immutable records** — first-write-wins, no record can be modified after registration
- **Blockchain anchored** — all hashes optionally timestamped to Bitcoin via OpenTimestamps

---

## How To Verify a Work

1. Go to [verify.haawke.com](https://verify.haawke.com)
2. Paste the SHA-256 hash of the file in question
3. The registry returns the full provenance record — author, filename, registration date, ORCID
4. For blockchain verification, upload the original file + its `.ots` proof file at [opentimestamps.org/verify](https://opentimestamps.org/verify)

---

## Registry API

Base URL: `https://haawke-verify.haawkeai.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and endpoints |
| `/verify/[hash]` | GET | Look up a SHA-256 hash |
| `/register` | POST | Register a new hash record |
| `/recent` | GET | Last 100 registrations |
| `/ots` | POST | OpenTimestamps Bitcoin proxy |

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Public verify interface |
| `provenance.json` | Certified SHA-256 hash of index.html |
| `provenance/index.html.ots` | Bitcoin blockchain proof certificate |

---

## Infrastructure

- **Frontend:** Netlify → verify.haawke.com
- **Registry + OTS Proxy:** Cloudflare Worker → haawke-verify (haawkeai account)
- **KV Namespace:** PROVENANCE (id: 61c3afcf84844c3cbe7969ea88b9fbb3)
- **Blockchain:** Bitcoin via OpenTimestamps

This page is itself certified. SHA-256 hash stored in `provenance.json`, Bitcoin timestamp in `provenance/index.html.ots`.

---

## Companion Projects

- [Haawke Hash](https://hash.haawke.com) — the hashing and registration tool
- [Haawke Neural Technology](https://haawke.com) — parent organization

---

## Citation

```
Ellenwood, C. & Claude (Anthropic). (2026). Haawke Verify:
Public Provenance Registry for Human-AI Collaborative Works (v1.0).
Haawke Neural Technology. https://verify.haawke.com
ORCID: 0009-0001-6475-5109
```

BibTeX:
```bibtex
@software{ellenwood_claude_2026_haawke_verify,
  author       = {Ellenwood, Craig and Claude (Anthropic)},
  title        = {Haawke Verify: Public Provenance Registry for Human-AI Collaborative Works},
  year         = 2026,
  version      = {v1.0},
  publisher    = {Haawke Neural Technology},
  url          = {https://verify.haawke.com},
  orcid        = {0009-0001-6475-5109}
}
```

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)  
See [LICENSE](LICENSE)

---

*Craig Ellenwood × Claude (Anthropic) · Haawke Neural Technology · 2026*  
*ORCID: 0009-0001-6475-5109 · haawke.com*
