# inVision U Admissions Copilot

**Two-sided decision-support for inVision U intake** — structured applications, hard eligibility gates, explainable merit signals, and a committee workspace. **Not** an autonomous admissions system: the committee always decides admit, defer, or reject.

| | |
|:---:|:---|
| **Live Demo** | [Open demo](PASTE_LIVE_DEMO_LINK_HERE) |
| **Demo Video** | [Watch walkthrough](PASTE_DEMO_VIDEO_LINK_HERE) |
| **Pitch Deck** | [View deck](PASTE_PITCH_DECK_LINK_HERE) |
| **Repository** | [Source](PASTE_REPOSITORY_LINK_HERE) |

---

## Why this matters

inVision U needs to spot **leadership and trajectory**, not only formal scores. Today, heavy manual screening means:

- Strong candidates who present weakly on paper get lost early.
- Essays and static forms are noisy (including generative-AI drift).
- As volume grows, depth and consistency of first-pass review drop.

This prototype **compresses routine checks** and **surfaces explainable signals** so the committee spends time on judgment, not data hunting.

---

## What we built

| Layer | What it is |
|--------|-------------|
| **Applicant Portal** (`/apply`) | Full application path: identity & contact, academics, documents, video link/file, **transcript or detailed summary** (primary qualitative input), optional behavioral note for context. |
| **Committee Dashboard** (`/dashboard`) | Search, filters, candidate package view, **routing summary**, hard-rule trace, merit breakdown, explanation tags, authenticity **risk signals**, notes & shortlist toggles. |
| **Routing engine** | Deterministic pipeline: completeness → eligibility → merit (eligible only) → recommendation tier. |
| **Demo Mode + Manual Mode** | Judges: one-click synthetic submit. Evaluators: realistic manual flow with real file picks (filenames stored locally in MVP). |

Everything is **human-in-the-loop**: outputs are recommendations and review queues, not decisions.

---

## Product architecture

```
Applicant (/apply)          Committee (/dashboard)
       │                            ▲
       │ submit                     │ inspect package,
       ▼                            │ scores, rationale, flags
┌──────────────┐                    │
│   Pipeline   │ ─── persisted ───────┘
│ completeness │      (local)
│ eligibility  │
│ merit score  │
└──────────────┘
```

Submissions are stored in the browser (`localStorage`) for the hackathon MVP — no backend required to demo the full loop.

---

## How the scoring pipeline works

| Stage | Role | Outcome if failed |
|--------|------|-------------------|
| **1. Completeness** | Required fields, required documents (≥1 portfolio), and **video link OR video file OR transcript/summary** (~50+ chars), plus behavioral summary for completion rules. | **Incomplete** — no eligibility or merit scoring. |
| **2. Eligibility** | Kazakhstan-linked applicants: **ENT ≥ 80**; English thresholds (IELTS ≥ 6, TOEFL ≥ 80, Duolingo ≥ 105, other ≥ 65 on demo scale); **subject combination matches selected program**. | **Ineligible** — merit not computed. |
| **3. Merit** (eligible only) | Transparent heuristics on **transcript/summary** (aligned to official video prompts), optional behavioral text, and portfolio **attachment** count. Weighted **overall score**. | Drives **Priority / Standard / Manual** review; small nudges for medium/high authenticity risk. |

**Hard rules and merit are separate.** Failing eligibility never produces a merit rank. Incomplete applications never hit eligibility or merit.

---

## Recommendation categories

| Category | Meaning |
|----------|---------|
| **Incomplete** | Package missing required items; committee sees what’s missing. No merit score. |
| **Ineligible** | Failed a hard gate (ENT / English / subject–program fit). No merit score. |
| **Priority Review** | Eligible + strong overall score (after advisory risk adjustment). **Not** an offer. |
| **Standard Review** | Eligible, mid band — normal queue. |
| **Manual Review** | Lower band and/or elevated authenticity risk signals — extra human judgment encouraged. |

---

## Programs and eligibility mapping

| Subject combination (ENT profile) | Eligible programs |
|-------------------------------------|-------------------|
| **Math + Geography** | Sociology of Innovation and Leadership · Strategies of Public Administration and Development |
| **Math + Informatics** | Innovative Digital Products and Services |
| **Math + Physics** | Creative Engineering |
| **History of Kazakhstan + Reading Literacy + 2 creative exams** | Digital Media and Marketing |

The form enforces **consistency**: selected program must match the declared combination. Logic lives in `src/data/programs.ts`.

---

## Data and candidate representation

**Used for identification & operations (not scored):** name, citizenship, DOB, email, phone, city/country, application ID, document filenames.

**Used for hard rules:** ENT, English exam type & score, citizenship/country (for Kazakhstan ENT rule only), program + subject combination.

**Used for merit (eligible only):** video **transcript or detailed summary** (mapped to the six official presentation questions), optional **behavioral / working-style note**, **portfolio attachment** presence.

**Not used:** demographic or socioeconomic features as success predictors; national ID numbers (passport/ID is upload metadata only).

---

## Baseline vs our improvement

| | **Typical baseline** | **This prototype** |
|--|----------------------|---------------------|
| Intake | Ad-hoc email + attachments | Structured **Applicant Portal** + consistent fields |
| First pass | Mental checklist, inconsistent | **Completeness** + **Eligibility** codified |
| “Why this candidate?” | Tribal knowledge, hard to audit | **Hard-rule summary** + **rationale factors** + **tags** |
| Qualitative signal | Long essays / uneven quality | **Transcript-first** narrative aligned to **video prompts** |
| Risk of templated text | Often ignored until late | **Authenticity risk signals** (heuristic, advisory) |
| Committee work | Tab sprawl | **Dashboard** with routing hero, package, scores, flags, notes |

We do **not** claim to replace committee judgment — we **standardize the front of the funnel** and **make tradeoffs legible**.

---

## Validation and robustness approach

MVP scope is **heuristic**, not a trained model — we still test it like a product:

- **Scenario matrix:** complete vs incomplete; eligible vs each failure mode (ENT, English, subject mismatch); edge scores near thresholds.
- **Synthetic profiles:** demo presets (`src/demo/presets/`) + manual mutations to confirm routing stability.
- **Consistency:** same inputs → same tier and scores (deterministic engine in `src/engine/`).
- **Inspectability:** rules and keyword families are **readable in code** — no hidden score on identity fields.

Future work: labeled committee outcomes, held-out calibration, and optional ASR/video features — out of scope for this build.

---

## Fairness, explainability, and privacy

- **No autonomous admissions** — final decisions stay with the committee; UI states this explicitly.
- **No demographic or socioeconomic scoring** — merit uses transcript/summary, program alignment heuristics, portfolio evidence flags, and optional behavioral text — not name, contact, or location as score inputs.
- **Authenticity outputs are risk indicators only** — not proof of AI or fraud; framed for manual review.
- **Demo data is synthetic** — presets for speed; production would use real consent and retention policies.
- **Explainability by design** — stage-gated pipeline, factor list, tags, and hard-rule copy the committee can challenge or override.

---

## Limitations

- **Transcript/summary stand-in** — no real ASR or video understanding in this repo.
- **Authenticity** — lightweight text heuristics; **not** production AI-generated-text detection.
- **Documents** — filenames only locally; no OCR, virus scan, or secure vault.
- **Persistence** — browser `localStorage`; not multi-user or audit-logged like production.
- **English thresholds** — demo-scale cutoffs, configurable in code, not legally certified.

---

## Quick demo for judges

1. Open **[Live Demo](PASTE_LIVE_DEMO_LINK_HERE)** (or run locally — below).
2. Go to **`/apply`**.
3. Select **Demo application** → **Submit demo now (1-click)**.
4. Read **Submission result** (routing, hard rules, tags).
5. Open **`/dashboard`** → select the candidate.
6. Review **Routing & recommendation** (top), **files**, **transcript**, **merit breakdown**, **authenticity risk signals**, **rationale**.

**Under 60 seconds** end-to-end.

---

## Local run

```bash
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). Routes: **`/apply`**, **`/dashboard`**.

Data persists under **`localStorage`** key `invision-u-applications-v3`.

---

## Tech stack

**React 18 · TypeScript · Vite · Tailwind CSS · React Router** — client-only MVP with a small, explicit `src/engine/` evaluation layer (no opaque model API).

---

*Built for Decentrathon 5.0 / inVision U — admissions intelligence as copilot, not autopilot.*
