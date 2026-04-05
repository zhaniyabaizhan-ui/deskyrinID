import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProgramId, ReviewTier, SubmittedApplication } from '@/types/application'
import { useApplications } from '@/context/ApplicationsContext'
import { Card, CardHeader } from '@/components/ui/Card'
import { TierBadge, RiskBadge } from '@/components/ui/Badge'
import {
  PROGRAM_LABELS,
  PROGRAM_IDS,
  SUBJECT_COMBO_LABELS,
} from '@/data/programs'
import { MERIT_BREAKDOWN_ROWS, normalizeMeritSubscores } from '@/data/meritBreakdown'
import { routingDetail, routingHeadline } from '@/data/routingCopy'

const tierOptions: (ReviewTier | '')[] = [
  '',
  'incomplete',
  'ineligible',
  'priority_review',
  'standard_review',
  'manual_review',
]

export default function DashboardPage() {
  const { applications, updateApplication } = useApplications()
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState<ProgramId | ''>('')
  const [tierFilter, setTierFilter] = useState<ReviewTier | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications.filter((a) => {
      if (q) {
        const name = a.form.personal.fullName.toLowerCase()
        const id = a.id.toLowerCase()
        if (!name.includes(q) && !id.includes(q)) return false
      }
      if (programFilter && a.form.programId !== programFilter) return false
      if (tierFilter && a.evaluation.recommendation !== tierFilter) return false
      return true
    })
  }, [applications, search, programFilter, tierFilter])

  const selected = useMemo(() => {
    if (filtered.length === 0) return null
    const byId = selectedId
      ? filtered.find((a) => a.id === selectedId)
      : null
    return byId ?? filtered[0]
  }, [filtered, selectedId])

  const priorityCount = applications.filter(
    (a) => a.evaluation.recommendation === 'priority_review'
  ).length
  const shortlistCount = applications.filter((a) => a.committeeShortlisted).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Committee dashboard
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Filter, search, and open candidate packages. Scores support review —
            they do not finalize admission.
          </p>
        </div>
        <Link
          to="/apply"
          className="inline-flex items-center justify-center rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-bold text-lime-950 shadow-sm hover:bg-lime-400"
        >
          New application
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            In system
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {applications.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Auto priority queue
          </p>
          <p className="mt-1 text-3xl font-bold text-lime-700">{priorityCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Committee shortlist
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{shortlistCount}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1 text-sm text-slate-700">
            Search name or ID
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. Demo or IVU-..."
            />
          </label>
          <label className="text-sm text-slate-700">
            Program
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value as ProgramId | '')}
              className="mt-1 block w-full min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm lg:w-56"
            >
              <option value="">All programs</option>
              {PROGRAM_IDS.map((id) => (
                <option key={id} value={id}>
                  {PROGRAM_LABELS[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Recommendation
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as ReviewTier | '')}
              className="mt-1 block w-full min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm lg:w-48"
            >
              <option value="">All statuses</option>
              {tierOptions.slice(1).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {applications.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-lg font-medium text-slate-800">No applications yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Use the applicant portal to submit a demo or manual package.
          </p>
          <Link
            to="/apply"
            className="mt-6 inline-block rounded-xl bg-lime-500 px-5 py-2.5 text-sm font-bold text-lime-950"
          >
            Go to /apply
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Candidates ({filtered.length})
              </div>
              <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                {filtered.map((a) => {
                  const active = selected !== null && a.id === selected.id
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 ${
                          active ? 'bg-lime-50/80' : ''
                        }`}
                      >
                        <span className="font-medium text-slate-900">
                          {a.form.personal.fullName}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {a.id}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <TierBadge tier={a.evaluation.recommendation} />
                          {a.form.programId ? (
                            <span className="truncate text-xs text-slate-500">
                              {PROGRAM_LABELS[a.form.programId]}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3">
            {selected ? (
              <CandidateDetail
                app={selected}
                onUpdate={updateApplication}
              />
            ) : (
              <Card className="py-12 text-center text-slate-500">
                No candidates match filters.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateDetail({
  app,
  onUpdate,
}: {
  app: SubmittedApplication
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<SubmittedApplication, 'committeeShortlisted' | 'committeeNote'>
    >
  ) => void
}) {
  const f = app.form
  const ev = app.evaluation

  const files: { label: string; name?: string; source?: string }[] = [
    {
      label: 'Passport / ID',
      name: f.uploads.passportOrId.fileName,
      source: f.uploads.passportOrId.source,
    },
    {
      label: 'ENT certificate',
      name: f.uploads.entCertificate.fileName,
      source: f.uploads.entCertificate.source,
    },
    {
      label: 'English certificate',
      name: f.uploads.englishCertificate.fileName,
      source: f.uploads.englishCertificate.source,
    },
    ...f.uploads.portfolio.map((p, i) => ({
      label: `Portfolio ${i + 1}`,
      name: p.fileName,
      source: p.source,
    })),
  ]

  const merit = ev.subscores ? normalizeMeritSubscores(ev.subscores) : null

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-5 shadow-sm ring-1 ring-lime-200/80">
        <p className="text-xs font-bold uppercase tracking-widest text-lime-800">
          Routing & recommendation
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <TierBadge tier={ev.recommendation} />
          {ev.overallScore !== null ? (
            <span className="text-2xl font-bold text-slate-900">
              {ev.overallScore}
              <span className="text-base font-semibold text-slate-500">/100</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-600">No merit score (incomplete or ineligible)</span>
          )}
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          {routingHeadline(ev.recommendation)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {routingDetail(ev.recommendation)}
        </p>
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
        <CardHeader
          title={f.personal.fullName}
          subtitle="Identification & contact — not used in automated scoring."
        />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Application ID</dt>
            <dd className="font-mono text-slate-900">{app.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Submitted</dt>
            <dd className="text-slate-900">
              {new Date(app.submittedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Email / phone</dt>
            <dd className="text-slate-900">
              {f.personal.email} · {f.personal.phone}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="text-slate-900">
              {f.personal.city}, {f.personal.country}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Program & academics" />
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Program</dt>
            <dd className="font-medium text-slate-900">
              {f.programId ? PROGRAM_LABELS[f.programId] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Subject combination</dt>
            <dd className="text-slate-900">
              {f.subjectCombination
                ? SUBJECT_COMBO_LABELS[f.subjectCombination]
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">ENT / English</dt>
            <dd className="text-slate-900">
              ENT {f.entScore === '' ? '—' : f.entScore} · {f.englishExamType}{' '}
              {f.englishScore === '' ? '' : f.englishScore}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Candidate package — files"
          subtitle="Names only in MVP; source shows device upload vs demo placeholder."
        />
        <ul className="space-y-2 text-sm">
          {files.map((x) => (
            <li
              key={x.label + (x.name ?? '')}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span className="text-slate-600">{x.label}</span>
              <span className="flex flex-wrap items-center gap-2">
                {x.source === 'uploaded' ? (
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-900">
                    Device
                  </span>
                ) : x.source === 'demo' ? (
                  <span className="rounded bg-lime-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-lime-900">
                    Demo
                  </span>
                ) : null}
                <span className="font-mono text-xs text-slate-800">
                  {x.name ?? '—'}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Video link: </span>
          {f.videoUrl ? (
            <a
              href={f.videoUrl}
              className="text-lime-800 underline"
              target="_blank"
              rel="noreferrer"
            >
              {f.videoUrl}
            </a>
          ) : (
            '—'
          )}
        </div>
        <div className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Video file: </span>
          {f.videoFile.attached ? (
            <>
              {f.videoFile.fileName}{' '}
              {f.videoFile.source === 'demo' ? (
                <span className="text-xs text-lime-800">(demo)</span>
              ) : f.videoFile.source === 'uploaded' ? (
                <span className="text-xs text-sky-800">(device)</span>
              ) : null}
            </>
          ) : (
            '—'
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Hard rules & pipeline" />
        <ul className="space-y-1 text-sm text-slate-700">
          {ev.hardRuleSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Video transcript / summary"
          subtitle="MVP text stand-in for multimodal review."
        />
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
          {f.videoTranscript || '—'}
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Authenticity risk signals"
          subtitle="Heuristic aids for manual review — not verified AI detection and not grounds for auto-decisions."
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
          <CardHeader
            title="Merit breakdown (transcript-aligned)"
            subtitle="Dimensions map to the official video prompts + communication + portfolio. Heuristic MVP only."
            action={
              ev.overallScore !== null ? (
                <span className="text-2xl font-bold text-lime-800">
                  {ev.overallScore}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </span>
              ) : null
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {MERIT_BREAKDOWN_ROWS.map(({ key, label }) => {
              const v = merit[key]
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{label}</span>
                    <span>{v}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-lime-400"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Committee rationale (explainability)"
          subtitle="Transparent factors behind the score and routing — for human judgment, not auto-admission."
        />
        <ul className="space-y-3">
          {ev.explainFactors.map((x, i) => (
            <li key={`${x.dimension}-${i}`} className="flex gap-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  x.impact === 'positive'
                    ? 'bg-lime-500'
                    : x.impact === 'negative'
                      ? 'bg-red-400'
                      : 'bg-slate-300'
                }`}
              />
              <div>
                <p className="font-medium text-slate-900">{x.dimension}</p>
                <p className="text-slate-600">{x.rationale}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Committee workspace (demo)" />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={app.committeeShortlisted}
            onChange={(e) =>
              onUpdate(app.id, { committeeShortlisted: e.target.checked })
            }
          />
          Shortlist for next committee round
        </label>
        <label className="mt-4 block text-sm text-slate-700">
          Internal note
          <textarea
            value={app.committeeNote}
            onChange={(e) => onUpdate(app.id, { committeeNote: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Private note — not shown to applicant."
          />
        </label>
      </Card>
    </div>
  )
}
