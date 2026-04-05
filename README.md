# inVision U — Two-sided admissions pre-screen (hackathon MVP)

Decision-support platform for **applicants** and the **admissions committee**. It is **not** an autonomous admissions system: **final decisions stay with the committee.**

## Product overview

| Area | Route | Purpose |
|------|--------|---------|
| Applicant portal | `/apply` | **Demo** or **manual** application; documents (device upload or demo file); video link/file; **transcript-first** qualitative input; pipeline result. |
| Committee dashboard | `/dashboard` | **Routing summary** up front; full package, hard rules, merit breakdown, explanation tags, authenticity **risk signals**, rationale, committee notes. |

Personal identity fields (name, contact, location, passport metadata) are **identification / review context only** — they **do not** feed scoring heuristics.

## Applicant UX (MVP)

- **Autofill sample personal info** — one click for synthetic contact data (judges; not scored).
- **Dual-path documents** — each required slot supports **Upload file** (stores filename only) or **Use demo file**.
- **Portfolio** — **Add from device** (multi-file) or **Add demo document**; rows use the same dual-path control.
- **Program block** — shows subject→program eligibility mapping inline.
- **Behavioral & working-style note** — optional committee context; **not** a personality test and **not** a primary admission basis.

## Scoring pipeline (explainable, multi-stage)

1. **Completeness** — personal fields, program, subject combination, ENT, English, required documents (≥1 portfolio attached), **video link OR video file OR transcript/summary (≥~50 chars)**, behavioral note summary. Missing items → **Incomplete** (no merit score).
2. **Eligibility** — Kazakhstan-linked applicants: **ENT ≥ 80**; English thresholds (IELTS ≥ 6, TOEFL ≥ 80, Duolingo ≥ 105, other ≥ 65 demo scale); **subject combination matches program**. Fail → **Ineligible**.
3. **Merit (eligible only)** — Heuristic scoring on **transcript/summary** (aligned to the six official video questions) plus optional behavioral note text and **attached** portfolio count. Dimensions include: why inVision U, program fit, challenge overcome, goals/purpose, leadership, support/encouragement, communication clarity, portfolio evidence. **Overall score** → **Priority**, **Standard**, or **Manual** review (with small adjustments for medium/high authenticity risk).

## Explainability

- **Hard-rule summary** — completeness and eligibility in plain language.
- **Committee rationale** — factor-level explanations tied to video prompts where relevant.
- **Explanation tags** — quick highlights (including authenticity risk **signals**).

## Authenticity risk signals

- **Not** verified AI detection; **not** auto-reject.
- **`text_authenticity_risk`** / **`video_authenticity_risk`** — low/medium/high heuristics (generic phrasing, specificity, first-person detail, concrete anchors, program wording overlap, video declared).

## Programs & subject mapping

Logic in `src/data/programs.ts`; applicant copy in `src/data/programGuide.ts`.

## Demo mode & synthetic data

- Presets: `src/demo/presets/` (registry in `index.ts`).
- Asset placeholders: `src/demo/assets/`.
- **Stub** `stub_v1` — full synthetic package for one-click judge demos.

## Quick run

```bash
npm install
npm run dev
```

## Quick demo (judges)

1. **`/apply`** → **Demo application** → **Submit demo now (1-click)**.
2. Read **Submission result** (routing headline, detail, tags).
3. **`/dashboard`** → open the candidate; **Routing & recommendation** is at the top of the detail panel.

## Stack

React 18, TypeScript, Vite, Tailwind, React Router. Persistence: **`localStorage`** key `invision-u-applications-v3` (filenames + form JSON only).
