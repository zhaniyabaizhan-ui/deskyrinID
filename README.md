# inVision U — Two-sided admissions pre-screen (hackathon MVP)

Decision-support platform for **applicants** and the **admissions committee**. It is **not** an autonomous admissions system: **final decisions stay with the committee.**

## Product overview

| Area | Route | Purpose |
|------|--------|---------|
| Applicant portal | `/apply` | Collect application data, simulated uploads, video transcript, personality snapshot; run pipeline; show routing result. |
| Committee dashboard | `/dashboard` | Search/filter candidates, inspect scores, explanations, authenticity **risk** flags, transcript, and committee notes / shortlist toggles. |

Personal identity fields (name, contact, location, passport upload metadata) are used for **identification and review context** only — they **do not** feed the scoring heuristics.

## Scoring pipeline (explainable, multi-stage)

1. **Completeness** — required personal fields, program, subject combination, ENT, English exam + score, simulated uploads (passport, ENT, English, ≥1 portfolio), video (URL or simulated file), personality summary. If anything is missing → **Incomplete** (no merit score).
2. **Eligibility** — Kazakhstan-linked applicants: **ENT ≥ 80**; English thresholds (IELTS ≥ 6, TOEFL ≥ 80, Duolingo ≥ 105, other ≥ 65 on demo scale); **subject combination must match** the selected program. If any fail → **Ineligible**.
3. **Merit (eligible only)** — Heuristic scoring on **video transcript + personality summary** and portfolio flags: motivation, leadership, resilience/growth, teamwork/problem-solving, communication, program alignment, portfolio evidence. **Overall score** is a weighted blend. Recommendation: **Priority review**, **Standard review**, or **Manual review** (with small adjustments for medium/high authenticity risk).

## Explainability

- **Hard-rule summary** lists completeness and eligibility outcomes in plain language.
- **Rationale panel** lists factor-level explanations (what was considered, fairness note).
- **Explanation tags** highlight notable dimensions (e.g. leadership signals, risk flags).

## AI / authenticity note

- **No real video ML or ASR** — transcript is pasted or prefilled text standing in for future multimodal pipelines.
- **`text_authenticity_risk`** and **`video_authenticity_risk`** are **low / medium / high** heuristic indicators only (generic phrasing, specificity, template cues, program mismatch). They are **not** proof of misconduct and **must not** auto-reject.

## Programs & subject mapping

Defined in `src/data/programs.ts`:

- **Math + Geography** → Sociology of Innovation and Leadership **or** Strategies of Public Administration and Development  
- **Math + Informatics** → Innovative Digital Products and Services  
- **Math + Physics** → Creative Engineering  
- **History of Kazakhstan + Reading Literacy + 2 creative exams** → Digital Media and Marketing  

## Demo mode & synthetic data

- Demo presets live in `src/demo/presets/`. Register new packages in `src/demo/presets/index.ts`.
- Place future synthetic file references under `src/demo/assets/` (placeholders only in this repo).
- **Stub preset** `stub_v1` provides a full synthetic application for judges.

## Quick run

```bash
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`).

## Quick demo (for judges)

1. Go to **`/apply`**.
2. Ensure **Demo application** is selected.
3. Click **Submit demo now (1-click)** — or **Load demo into form** then **Submit application**.
4. Read the **Submission result** card (tier, score, hard rules, tags).
5. Open **`/dashboard`** — the candidate appears in the list; select them for full detail, filters, and committee shortlist / note.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, React Router. Applications persist in **`localStorage`** (`invision-u-applications-v2`) for the MVP.
