import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { SubmittedApplication } from '@/types/application'
import { useApplications } from '@/context/ApplicationsContext'
import { TierBadge, RiskBadge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import {
  PROGRAM_LABELS,
  SUBJECT_COMBO_LABELS,
} from '@/data/programs'
import { MERIT_BREAKDOWN_ROWS, normalizeMeritSubscores } from '@/data/meritBreakdown'
import { routingDetail, routingHeadline } from '@/data/routingCopy'
import {
  AIDYN_CANDIDATE_SUMMARY,
  AIDYN_QUALITATIVE_INSIGHTS,
  AIDYN_RESUME_TEXT,
  AIDYN_VIDEO_POSTER_PATH,
  DEFAULT_VIDEO_POSTER_PATH,
  BUILTIN_AIDYN_ID,
} from '@/builtin/aidyn'

function posterPathForApp(app: SubmittedApplication): string {
  return app.id === BUILTIN_AIDYN_ID ? AIDYN_VIDEO_POSTER_PATH : DEFAULT_VIDEO_POSTER_PATH
}

function MetricChip({
  label,
  value,
  variant = 'neutral',
}: {
  label: string
  value: string
  variant?: 'neutral' | 'ok' | 'warn' | 'bad'
}) {
  const c =
    variant === 'ok'
      ? 'bg-emerald-50 text-emerald-900 ring-emerald-200'
      : variant === 'warn'
        ? 'bg-amber-50 text-amber-900 ring-amber-200'
        : variant === 'bad'
          ? 'bg-red-50 text-red-800 ring-red-200'
          : 'bg-slate-50 text-slate-800 ring-slate-200'
  return (
    <div
      className={`rounded-xl px-3 py-2 ring-1 ring-inset ${c}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}

export default function CandidateReviewPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()
  const { applications, updateApplication } = useApplications()
  const [transcriptOpen, setTranscriptOpen] = useState(true)

  const app = useMemo(
    () => applications.find((a) => a.id === candidateId),
    [applications, candidateId]
  )

  const merit = app?.evaluation.subscores
    ? normalizeMeritSubscores(app.evaluation.subscores)
    : null

  const resumeText =
    app?.id === BUILTIN_AIDYN_ID ? AIDYN_RESUME_TEXT : null
  const summaryText =
    app?.id === BUILTIN_AIDYN_ID
      ? AIDYN_CANDIDATE_SUMMARY
      : `Applicant materials on file. Full structured profile is strongest for built-in showcase candidate (Aidyn); others use submitted form data.`

  const insights =
    app?.id === BUILTIN_AIDYN_ID
      ? AIDYN_QUALITATIVE_INSIGHTS
      : (MERIT_BREAKDOWN_ROWS.map(({ key, label }) => {
          const v = merit?.[key]
          if (v === undefined || v < 58) return null
          return {
            title: label,
            detail: `Heuristic score ${v}/100 — see merit breakdown below.`,
          }
        }).filter(Boolean) as { title: string; detail: string }[])

  if (!app) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-lg font-semibold text-slate-900">Candidate not found</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm font-semibold text-lime-800 underline"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const f = app.form
  const ev = app.evaluation
  const eligOk = ev.eligibility.ok
  const completeOk = ev.completeness.complete
  const failReasons =
    !ev.eligibility.ok && 'reasons' in ev.eligibility ? ev.eligibility.reasons : []
  const subjectMismatch = failReasons.includes('subject_program_mismatch')
  const programMatchText = !completeOk
    ? '—'
    : eligOk
      ? 'Pass'
      : subjectMismatch
        ? 'Fail'
        : '—'
  const programMatchVariant =
    programMatchText === 'Pass' ? 'ok' : programMatchText === 'Fail' ? 'bad' : 'neutral'

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to list
          </button>
          <TierBadge tier={ev.recommendation} />
        </div>
        <p className="text-xs text-slate-500">
          Final admission decision remains with the committee — this workspace is decision
          support only.
        </p>
      </div>

      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {f.personal.fullName}
        </h1>
        <p className="mt-1 font-mono text-sm text-slate-500">{app.id}</p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          {f.programId ? PROGRAM_LABELS[f.programId] : '—'}
        </p>
      </header>

      {/* Main workspace: static presentation preview | snapshot */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Video presentation
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              MVP static preview; transcript and scores are the qualitative source for review.
            </p>
          </div>
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-3 sm:p-4">
            <div className="relative mx-auto aspect-video w-full max-h-[min(52vh,520px)] overflow-hidden rounded-xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
              <img
                src={posterPathForApp(app)}
                alt=""
                className="h-full w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg ring-2 ring-white/50 sm:h-16 sm:w-16"
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-0.5 h-7 w-7 sm:h-8 sm:w-8"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
                <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:text-[11px]">
                  {app.id === BUILTIN_AIDYN_ID
                    ? 'Demo video preview'
                    : 'Video presentation preview'}
                </span>
                {f.videoFile.fileName ? (
                  <span className="max-w-[min(100%,18rem)] truncate text-right text-[11px] font-medium text-white/90">
                    {f.videoFile.fileName}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-slate-400">
                No large media in-repo — open the applicant&apos;s link when a full recording is
                hosted externally.
              </p>
              {f.videoUrl.trim() ? (
                <a
                  href={f.videoUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-sm font-semibold text-lime-400 underline decoration-lime-400/50 underline-offset-2 hover:text-lime-300"
                >
                  Open applicant video link
                </a>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-5 shadow-sm ring-1 ring-lime-200/80">
            <p className="text-xs font-bold uppercase tracking-widest text-lime-800">
              Recommendation
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TierBadge tier={ev.recommendation} />
              {ev.overallScore !== null ? (
                <span className="text-xl font-bold text-slate-900">
                  {ev.overallScore}
                  <span className="text-sm font-semibold text-slate-500">/100</span>
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              {routingHeadline(ev.recommendation)}
            </h3>
            <p className="mt-2 text-sm text-slate-700">{routingDetail(ev.recommendation)}</p>
            {ev.explanationTags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {ev.explanationTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-800 ring-1 ring-lime-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <Card>
            <CardHeader title="Candidate snapshot" />
            <p className="text-sm leading-relaxed text-slate-700">{summaryText}</p>
          </Card>

          <Card>
            <CardHeader
              title="Qualitative review cues"
              subtitle="Mapped to video prompts and transcript — transparent heuristics, not ML labels."
            />
            {insights.length === 0 ? (
              <p className="text-sm text-slate-500">
                No high-confidence heuristic cues above threshold for this profile, or merit not
                computed (incomplete / ineligible).
              </p>
            ) : (
              <ul className="space-y-3">
                {insights.map((x) => (
                  <li
                    key={x.title}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-slate-900">{x.title}</p>
                    <p className="mt-1 text-slate-600">{x.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Transcript / summary</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Full text used for explainable scoring in this MVP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTranscriptOpen((o) => !o)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-lime-800 hover:bg-slate-50"
              >
                {transcriptOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {transcriptOpen ? (
              <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
                {f.videoTranscript || '—'}
              </p>
            ) : null}
          </Card>

          {resumeText ? (
            <Card>
              <CardHeader
                title="Resume & portfolio (package)"
                subtitle="Text extracted from submitted CV for committee reading in MVP."
              />
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-xs leading-relaxed text-slate-800">
                {resumeText}
              </pre>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Uploaded documents" />
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Passport / ID: {f.uploads.passportOrId.fileName ?? '—'}</li>
                <li>ENT: {f.uploads.entCertificate.fileName ?? '—'}</li>
                <li>English: {f.uploads.englishCertificate.fileName ?? '—'}</li>
                {f.uploads.portfolio.map((p, i) => (
                  <li key={i}>
                    Portfolio {i + 1}: {p.fileName ?? '—'}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader title="Behavioral note (applicant)" />
            <p className="text-sm text-slate-700">
              {f.personality.summary.trim() || '—'}
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Authenticity risk signals"
              subtitle="Advisory only — not proof of AI use or fraud."
            />
            <div className="flex flex-wrap gap-2">
              <RiskBadge label="Transcript" level={ev.textAuthenticityRisk} />
              <RiskBadge label="Video" level={ev.videoAuthenticityRisk} />
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {ev.authenticityNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Card>

          {merit ? (
            <Card>
              <CardHeader title="Merit dimensions (transcript-aligned)" />
              <div className="grid gap-2 sm:grid-cols-2">
                {MERIT_BREAKDOWN_ROWS.map(({ key, label }) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {merit[key]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Committee workspace" />
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={app.committeeShortlisted}
                onChange={(e) =>
                  updateApplication(app.id, { committeeShortlisted: e.target.checked })
                }
              />
              Shortlist for next round
            </label>
            <label className="mt-4 block text-sm text-slate-700">
              Committee note
              <textarea
                value={app.committeeNote}
                onChange={(e) =>
                  updateApplication(app.id, { committeeNote: e.target.value })
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Internal note — not visible to applicant."
              />
            </label>
          </Card>
        </div>
      </div>

      {/* Bottom metrics strip */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Formal metrics & routing
          </p>
          <div className="flex flex-wrap gap-2">
            <MetricChip label="ENT" value={f.entScore === '' ? '—' : String(f.entScore)} />
            <MetricChip
              label="English"
              value={
                f.englishExamType && f.englishScore !== ''
                  ? `${f.englishExamType} ${f.englishScore}`
                  : '—'
              }
            />
            <MetricChip
              label="Subject combination"
              value={
                f.subjectCombination
                  ? SUBJECT_COMBO_LABELS[f.subjectCombination]
                  : '—'
              }
            />
            <MetricChip
              label="Program"
              value={f.programId ? PROGRAM_LABELS[f.programId] : '—'}
            />
            <MetricChip
              label="Program match"
              value={programMatchText}
              variant={programMatchVariant}
            />
            <MetricChip
              label="Documents complete"
              value={completeOk ? 'Pass' : 'Incomplete'}
              variant={completeOk ? 'ok' : 'warn'}
            />
            <MetricChip
              label="Eligibility"
              value={!completeOk ? '—' : eligOk ? 'Pass' : 'Fail'}
              variant={
                !completeOk ? 'neutral' : eligOk ? 'ok' : 'bad'
              }
            />
            <MetricChip
              label="Overall score"
              value={ev.overallScore !== null ? String(ev.overallScore) : '—'}
            />
            <MetricChip
              label="Routing"
              value={ev.recommendation.replace(/_/g, ' ')}
              variant={
                ev.recommendation === 'priority_review'
                  ? 'ok'
                  : ev.recommendation === 'ineligible' || ev.recommendation === 'incomplete'
                    ? 'bad'
                    : 'neutral'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
