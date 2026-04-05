import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  ApplicationFormData,
  DocumentAttachment,
  EnglishExamType,
  ProgramId,
  SubjectCombination,
  SubmittedApplication,
} from '@/types/application'
import { createEmptyForm } from '@/types/application'
import { submitApplication } from '@/engine/evaluateApplication'
import { useApplications } from '@/context/ApplicationsContext'
import { DualPathDocumentSlot } from '@/components/apply/DualPathDocumentSlot'
import { Card, CardHeader } from '@/components/ui/Card'
import { TierBadge, RiskBadge } from '@/components/ui/Badge'
import { VIDEO_PRESENTATION_PROMPTS } from '@/data/videoPrompts'
import {
  PROGRAM_IDS,
  PROGRAM_LABELS,
  SUBJECT_COMBO_LABELS,
} from '@/data/programs'
import { DEMO_PRESETS, defaultDemoPreset } from '@/demo/presets'
import { SAMPLE_PERSONAL } from '@/data/samplePersonal'
import { PROGRAM_SUBJECT_GUIDE } from '@/data/programGuide'
import { routingDetail, routingHeadline } from '@/data/routingCopy'

type ApplyMode = 'demo' | 'manual'

export default function ApplyPage() {
  const { addApplication } = useApplications()
  const portfolioInputRef = useRef<HTMLInputElement>(null)
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

  const setPortfolioItem = (index: number, v: DocumentAttachment) => {
    setForm((f) => ({
      ...f,
      uploads: {
        ...f.uploads,
        portfolio: f.uploads.portfolio.map((p, i) => (i === index ? v : p)),
      },
    }))
  }

  const addPortfolioFromDevice = (files: FileList | null) => {
    if (!files?.length) return
    setForm((f) => ({
      ...f,
      uploads: {
        ...f.uploads,
        portfolio: [
          ...f.uploads.portfolio,
          ...Array.from(files).map((file) => ({
            attached: true as const,
            fileName: file.name,
            source: 'uploaded' as const,
          })),
        ],
      },
    }))
  }

  const addPortfolioDemo = () => {
    setForm((f) => ({
      ...f,
      uploads: {
        ...f.uploads,
        portfolio: [
          ...f.uploads.portfolio,
          {
            attached: true,
            fileName: `demo_portfolio_${f.uploads.portfolio.length + 1}.pdf`,
            source: 'demo' as const,
          },
        ],
      },
    }))
  }

  const removePortfolio = (index: number) => {
    setForm((f) => ({
      ...f,
      uploads: {
        ...f.uploads,
        portfolio: f.uploads.portfolio.filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Application portal
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Submit your materials for inVision U. Use <strong>Demo application</strong> for a
          one-click judge path, or <strong>Manual application</strong> for a realistic walkthrough.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Application mode"
          subtitle="Demo mode autofills synthetic data and demo files. Manual mode is for end-to-end testing as a candidate."
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
              <strong>Fast path (&lt;30s):</strong> add presets in{' '}
              <code className="rounded bg-white/80 px-1">src/demo/presets/</code>
              — then load the form or submit in one click.
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
            Use real file picks where you want; the MVP still only stores file names for display
            (no server upload).
          </p>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader
            title="A. Personal information"
            subtitle="Identification and contact only — not used in automated scoring."
            action={
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, personal: { ...SAMPLE_PERSONAL } }))
                }
                className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
              >
                Autofill sample personal info
              </button>
            }
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
            We do not collect national ID numbers here — upload passport or ID in the documents
            section below.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="B. Program & academics"
            subtitle="Your subject combination must be valid for the program you select."
          />
          <div className="mb-5 rounded-xl border border-lime-200 bg-lime-50/50 p-4 text-sm text-slate-800">
            <p className="font-semibold text-lime-950">Eligibility mapping</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">
              {PROGRAM_SUBJECT_GUIDE}
            </p>
          </div>
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
            Kazakhstan applicants: ENT ≥ 80 when eligible. English: IELTS ≥ 6, TOEFL ≥ 80,
            Duolingo ≥ 105, other ≥ 65 (demo scale).
          </p>
        </Card>

        <Card>
          <CardHeader
            title="C. Required documents"
            subtitle="Upload from your device or attach a demo placeholder — both paths count for completeness in this MVP."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <DualPathDocumentSlot
              label="Passport / ID (PDF or image)"
              required
              value={form.uploads.passportOrId}
              demoFileName="demo_passport.pdf"
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, passportOrId: v },
                }))
              }
            />
            <DualPathDocumentSlot
              label="ENT certificate"
              required
              value={form.uploads.entCertificate}
              demoFileName="demo_ent_certificate.pdf"
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, entCertificate: v },
                }))
              }
            />
            <DualPathDocumentSlot
              label="English certificate"
              required
              value={form.uploads.englishCertificate}
              demoFileName="demo_english_certificate.pdf"
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  uploads: { ...f.uploads, englishCertificate: v },
                }))
              }
            />
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Portfolio / additional documents
              </span>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={portfolioInputRef}
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,image/*,application/pdf"
                  onChange={(e) => {
                    addPortfolioFromDevice(e.target.files)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => portfolioInputRef.current?.click()}
                  className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Add from device
                </button>
                <button
                  type="button"
                  onClick={addPortfolioDemo}
                  className="rounded-lg bg-lime-400 px-3 py-1.5 text-sm font-semibold text-lime-950 hover:bg-lime-300"
                >
                  Add demo document
                </button>
              </div>
            </div>
            {form.uploads.portfolio.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                Add at least one portfolio or supporting PDF for a complete application.
              </p>
            ) : (
              <ul className="space-y-4">
                {form.uploads.portfolio.map((p, i) => (
                  <li key={`${i}-${p.fileName ?? ''}`}>
                    <DualPathDocumentSlot
                      label={`Portfolio file ${i + 1}`}
                      value={p}
                      demoFileName={`demo_portfolio_${i + 1}.pdf`}
                      onChange={(v) => {
                        if (!v.attached) removePortfolio(i)
                        else setPortfolioItem(i, v)
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="D. Video presentation"
            subtitle="There is no separate motivation essay. Your story lives in the video and in the transcript or detailed summary below (MVP substitute for speech-to-text)."
          />
          <div className="mb-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">
              Cover these questions in your recording (scoring looks for related themes in your
              transcript):
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
            <DualPathDocumentSlot
              label="Video file (optional if link or transcript is provided)"
              value={form.videoFile}
              accept="video/*"
              demoFileName="preview-poster.svg"
              onChange={(v) => update({ videoFile: v })}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Completeness requires a video link, a video file, or a transcript/summary of at least
            ~50 characters.
          </p>
          <label className="mt-6 block text-sm text-slate-700">
            Video transcript or detailed summary
            <textarea
              value={form.videoTranscript}
              onChange={(e) => update({ videoTranscript: e.target.value })}
              rows={10}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Paste a transcript or write what you said, aligned to the prompts above."
            />
          </label>
        </Card>

        <Card>
          <CardHeader
            title="E. Behavioral & working-style note"
            subtitle="Optional context for the committee — not a personality test and not a primary admission criterion."
          />
          <p className="mb-4 text-sm text-slate-600">
            Use this space for a short note (e.g. from a counselor, referee, or self-reflection on
            how you work with others). It supports human review alongside your video story; it{' '}
            <strong>does not</strong> replace transcript scoring and does not decide outcomes on its
            own.
          </p>
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
              placeholder="e.g. collaborative, responds well to structured feedback, steady under deadlines…"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Optional numeric sliders — informal self- or third-party estimates for discussion only.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(
              [
                ['openness', 'Openness to new ideas (0–100)'],
                ['conscientiousness', 'Follow-through / reliability (0–100)'],
                ['collaboration', 'Collaboration style (0–100)'],
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
          <div className="rounded-xl border border-lime-200 bg-white/90 p-4">
            <p className="text-lg font-bold text-slate-900">
              {routingHeadline(lastSubmitted.evaluation.recommendation)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {routingDetail(lastSubmitted.evaluation.recommendation)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
          </div>
          <p className="mt-3 font-mono text-xs text-slate-600">
            ID {lastSubmitted.id}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hard rules
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {lastSubmitted.evaluation.hardRuleSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {lastSubmitted.evaluation.explanationTags.length > 0 ? (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Explanation tags
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lastSubmitted.evaluation.explanationTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          ) : null}
          <Link
            to="/dashboard"
            className="mt-6 inline-block text-sm font-bold text-lime-800 hover:underline"
          >
            Open full review in dashboard →
          </Link>
        </Card>
      ) : null}
    </div>
  )
}
