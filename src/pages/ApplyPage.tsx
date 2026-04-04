import { useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  ApplicationFormData,
  EnglishExamType,
  ProgramId,
  SimulatedUpload,
  SubjectCombination,
  SubmittedApplication,
} from '@/types/application'
import { createEmptyForm } from '@/types/application'
import { submitApplication } from '@/engine/evaluateApplication'
import { useApplications } from '@/context/ApplicationsContext'
import { Card, CardHeader } from '@/components/ui/Card'
import { TierBadge, RiskBadge } from '@/components/ui/Badge'
import { VIDEO_PRESENTATION_PROMPTS } from '@/data/videoPrompts'
import {
  PROGRAM_IDS,
  PROGRAM_LABELS,
  SUBJECT_COMBO_LABELS,
} from '@/data/programs'
import { DEMO_PRESETS, defaultDemoPreset } from '@/demo/presets'

type ApplyMode = 'demo' | 'manual'

function SimulatedDrop({
  label,
  required,
  value,
  onChange,
}: {
  label: string
  required?: boolean
  value: SimulatedUpload
  onChange: (v: SimulatedUpload) => void
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        {value.attached ? (
          <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-900">
            Simulated
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not attached</span>
        )}
      </div>
      {value.attached && value.fileName ? (
        <p className="mt-2 font-mono text-xs text-slate-600">{value.fileName}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {!value.attached ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                attached: true,
                fileName: 'synthetic_placeholder.pdf',
              })
            }
            className="rounded-lg bg-lime-400 px-3 py-1.5 text-sm font-semibold text-lime-950 shadow-sm hover:bg-lime-300"
          >
            Simulate upload
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ attached: false })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export default function ApplyPage() {
  const { addApplication } = useApplications()
  const [mode, setMode] = useState<ApplyMode>('demo')
  const [form, setForm] = useState<ApplicationFormData>(createEmptyForm())
  const [presetId, setPresetId] = useState<string>(defaultDemoPreset().id)
  const [lastSubmitted, setLastSubmitted] = useState<SubmittedApplication | null>(
    null
  )

  const update = (patch: Partial<ApplicationFormData>) =>
    setForm((f) => ({ ...f, ...patch }))

  const loadDemoForm = () => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId) ?? defaultDemoPreset()
    setForm(preset.build())
  }

  const submitOneClickDemo = () => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId) ?? defaultDemoPreset()
    const f = preset.build()
    const app = submitApplication(f)
    addApplication(app)
    setLastSubmitted(app)
    setForm(f)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const app = submitApplication(form)
    addApplication(app)
    setLastSubmitted(app)
  }

  const subjectKeys = Object.keys(SUBJECT_COMBO_LABELS) as SubjectCombination[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Application portal
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Submit your materials for inVision U. Use <strong>Demo mode</strong> for a
          one-click judge path, or <strong>Manual mode</strong> to walk the form
          realistically.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Application mode"
          subtitle="Demo mode is optimized for hackathon judges — prefilled synthetic data and simulated files."
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode('demo')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              mode === 'demo'
                ? 'bg-lime-400 text-lime-950 ring-lime-500'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Demo application
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              mode === 'manual'
                ? 'bg-lime-400 text-lime-950 ring-lime-500'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Manual application
          </button>
        </div>

        {mode === 'demo' ? (
          <div className="mt-6 space-y-4 rounded-xl bg-lime-50/60 p-4 ring-1 ring-lime-200">
            <p className="text-sm text-lime-950">
              <strong>Fast path:</strong> choose a preset package (add more in{' '}
              <code className="rounded bg-white/80 px-1">src/demo/presets/</code>
              ), then either load the form to edit, or submit immediately.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-slate-700">
                Demo preset
                <select
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="mt-1 block w-full min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {DEMO_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadDemoForm}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Load demo into form
              </button>
              <button
                type="button"
                onClick={submitOneClickDemo}
                className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-lime-950 shadow-sm hover:bg-lime-400"
              >
                Submit demo now (1-click)
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Fill each section. Simulated uploads stand in for real PDFs until you
            connect storage.
          </p>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader
            title="A. Personal information"
            subtitle="Used for identification and contact — not for automated scoring."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['fullName', 'Full name'],
                ['citizenship', 'Citizenship'],
                ['dateOfBirth', 'Date of birth'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['city', 'City'],
                ['country', 'Country / region'],
              ] as const
            ).map(([key, lab]) => (
              <label key={key} className="text-sm text-slate-700">
                {lab}
                <input
                  value={form.personal[key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      personal: { ...f.personal, [key]: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required={mode === 'manual'}
                />
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Upload a passport or ID document below instead of entering national ID
            numbers.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="B. Program & academics"
            subtitle="Subject combination must align with your selected program."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700 sm:col-span-2">
              Program track
              <select
                value={form.programId}
                onChange={(e) =>
                  update({ programId: e.target.value as ProgramId | '' })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="">Select program</option>
                {PROGRAM_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PROGRAM_LABELS[id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700 sm:col-span-2">
              Subject combination (ENT / national specs)
              <select
                value={form.subjectCombination}
                onChange={(e) =>
                  update({
                    subjectCombination: e.target.value as SubjectCombination | '',
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="">Select combination</option>
                {subjectKeys.map((k) => (
                  <option key={k} value={k}>
                    {SUBJECT_COMBO_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              ENT score
              <input
                type="number"
                value={form.entScore === '' ? '' : form.entScore}
                onChange={(e) =>
                  update({
                    entScore: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                min={0}
                max={140}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                English exam
                <select
                  value={form.englishExamType}
                  onChange={(e) =>
                    update({
                      englishExamType: e.target.value as EnglishExamType | '',
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Type</option>
                  {(['IELTS', 'TOEFL', 'Duolingo', 'other'] as const).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-700">
                Score
                <input
                  type="number"
                  step="0.5"
                  value={form.englishScore === '' ? '' : form.englishScore}
                  onChange={(e) =>
                    update({
                      englishScore:
                        e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. 6.5 IELTS"
                />
              </label>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Kazakhstan citizens: ENT ≥ 80 required when eligible. English: IELTS ≥
            6, TOEFL ≥ 80, Duolingo ≥ 105, other ≥ 65 (demo scale).
          </p>
        </Card>

        <Card>
          <CardHeader
            title="C. Required uploads (simulated)"
            subtitle="MVP uses placeholders — swap in real storage later."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <SimulatedDrop
              label="Passport / ID (PDF or image)"
              required
              value={form.uploads.passportOrId}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, passportOrId: v },
                }))
              }
            />
            <SimulatedDrop
              label="ENT certificate"
              required
              value={form.uploads.entCertificate}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, entCertificate: v },
                }))
              }
            />
            <SimulatedDrop
              label="English certificate"
              required
              value={form.uploads.englishCertificate}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, englishCertificate: v },
                }))
              }
            />
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                Portfolio / additional documents
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    uploads: {
                      ...f.uploads,
                      portfolio: [
                        ...f.uploads.portfolio,
                        {
                          attached: true,
                          fileName: `portfolio_${f.uploads.portfolio.length + 1}.pdf`,
                        },
                      ],
                    },
                  }))
                }
                className="text-sm font-semibold text-lime-800 hover:text-lime-900"
              >
                + Add simulated file
              </button>
            </div>
            {form.uploads.portfolio.length === 0 ? (
              <p className="rounded-lg bg-slate-50 py-8 text-center text-sm text-slate-500">
                No portfolio files yet — add at least one for a complete application.
              </p>
            ) : (
              <ul className="space-y-2">
                {form.uploads.portfolio.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs">{p.fileName}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          uploads: {
                            ...f.uploads,
                            portfolio: f.uploads.portfolio.filter(
                              (_, j) => j !== i
                            ),
                          },
                        }))
                      }
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="D. Video presentation"
            subtitle="Primary qualitative input is your video story — transcript stands in for ASR in this MVP."
          />
          <div className="mb-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">
              Address these prompts in your recording:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              {VIDEO_PRESENTATION_PROMPTS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>
          <label className="text-sm text-slate-700">
            Video link (YouTube, Drive, etc.)
            <input
              value={form.videoUrl}
              onChange={(e) => update({ videoUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>
          <div className="mt-4">
            <SimulatedDrop
              label="Or: video file (simulated)"
              value={form.videoFile}
              onChange={(v) => update({ videoFile: v })}
            />
          </div>
          <label className="mt-6 block text-sm text-slate-700">
            Video transcript or summary (used for explainable text analysis)
            <textarea
              value={form.videoTranscript}
              onChange={(e) => update({ videoTranscript: e.target.value })}
              rows={10}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Paste transcript or a detailed summary of what you said on video."
            />
          </label>
        </Card>

        <Card>
          <CardHeader
            title="E. Personality snapshot (MVP)"
            subtitle="Short placeholder for a full assessment — replace with your instrument export later."
          />
          <label className="text-sm text-slate-700">
            Summary for committee
            <textarea
              value={form.personality.summary}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  personality: { ...f.personality, summary: e.target.value },
                }))
              }
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(
              [
                ['openness', 'Openness (0–100)'],
                ['conscientiousness', 'Conscientiousness (0–100)'],
                ['collaboration', 'Collaboration (0–100)'],
              ] as const
            ).map(([key, lab]) => (
              <label key={key} className="text-sm text-slate-700">
                {lab}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.personality[key] ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      personality: {
                        ...f.personality,
                        [key]: e.target.value === '' ? undefined : Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-lime-500 px-6 py-3 text-sm font-bold text-lime-950 shadow-md hover:bg-lime-400"
          >
            Submit application
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(createEmptyForm())
              setLastSubmitted(null)
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear form
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-lime-800 hover:underline"
          >
            Open committee dashboard →
          </Link>
        </div>
      </form>

      {lastSubmitted ? (
        <Card className="border-lime-300 bg-lime-50/40">
          <CardHeader title="Submission result" />
          <div className="flex flex-wrap items-center gap-3">
            <TierBadge tier={lastSubmitted.evaluation.recommendation} />
            {lastSubmitted.evaluation.overallScore !== null ? (
              <span className="text-sm font-medium text-slate-800">
                Overall score:{' '}
                <strong>{lastSubmitted.evaluation.overallScore}</strong>/100
              </span>
            ) : null}
            <RiskBadge
              label="Transcript"
              level={lastSubmitted.evaluation.textAuthenticityRisk}
            />
            <RiskBadge
              label="Video"
              level={lastSubmitted.evaluation.videoAuthenticityRisk}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-slate-600">
            ID {lastSubmitted.id}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-slate-700">
            {lastSubmitted.evaluation.hardRuleSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {lastSubmitted.evaluation.explanationTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {lastSubmitted.evaluation.explanationTags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <Link
            to="/dashboard"
            className="mt-6 inline-block text-sm font-bold text-lime-800 hover:underline"
          >
            Review in dashboard →
          </Link>
        </Card>
      ) : null}
    </div>
  )
}
