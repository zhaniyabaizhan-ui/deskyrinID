import type { ApplicationFormData, MeritSubscores, ProgramId } from '@/types/application'
import { PROGRAM_LABELS } from '@/data/programs'

const MOTIVATION = [
  'motivat',
  'passion',
  'goal',
  'future',
  'mission',
  'impact',
  'why',
  'invision',
  'program',
  'learn',
]

const LEADERSHIP = [
  'lead',
  'led',
  'team',
  'initiat',
  'organiz',
  'responsib',
  'mentor',
  'community',
]

const RESILIENCE = [
  'challenge',
  'fail',
  'mistake',
  'overcome',
  'difficult',
  'support',
  'family',
  'encourag',
  'grow',
]

const TEAMWORK = [
  'team',
  'collabor',
  'together',
  'listen',
  'solve',
  'problem',
  'conflict',
]

const COMMUNICATION = ['i ', "i'm", 'my ', 'we ', 'our ', 'feel', 'share', 'tell']

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function countHits(text: string, terms: string[]): number {
  const lower = text.toLowerCase()
  return terms.reduce((n, term) => (lower.includes(term.trim()) ? n + 1 : n), 0)
}

function programKeywords(programId: ProgramId): string[] {
  const label = PROGRAM_LABELS[programId].toLowerCase()
  return label.split(/[^a-z0-9]+/).filter((w) => w.length > 3)
}

/** Explainable heuristic scoring from transcript (+ portfolio flag). Not ML. */
export function scoreFromTranscript(
  f: ApplicationFormData
): MeritSubscores {
  const text = `${f.videoTranscript}\n${f.personality.summary}`.trim()
  const base = 38
  const wc = text.split(/\s+/).filter(Boolean).length

  const motivation = clamp(
    base + countHits(text, MOTIVATION) * 6 + (wc > 120 ? 10 : 0),
    0,
    100
  )
  const leadership = clamp(
    base + countHits(text, LEADERSHIP) * 7 + (wc > 100 ? 8 : 0),
    0,
    100
  )
  const resilienceGrowth = clamp(
    base + countHits(text, RESILIENCE) * 7 + (wc > 80 ? 6 : 0),
    0,
    100
  )
  const teamworkProblemSolving = clamp(
    base + countHits(text, TEAMWORK) * 6 + (wc > 90 ? 6 : 0),
    0,
    100
  )

  const firstPersonHits = COMMUNICATION.reduce(
    (n, term) => n + (text.toLowerCase().split(term).length - 1),
    0
  )
  const communication = clamp(
    base + Math.min(28, firstPersonHits * 2) + (wc > 150 ? 12 : wc > 60 ? 4 : 0),
    0,
    100
  )

  let programAlignment = 40
  if (f.programId) {
    const kw = programKeywords(f.programId as ProgramId)
    const hits = kw.filter((k) => text.toLowerCase().includes(k)).length
    programAlignment = clamp(35 + hits * 12, 0, 100)
  }

  const portfolioEvidence =
    f.uploads.portfolio.length > 0
      ? clamp(55 + f.uploads.portfolio.length * 8 + (wc > 100 ? 10 : 0), 0, 100)
      : clamp(32 + (wc > 80 ? 8 : 0), 0, 100)

  return {
    motivation,
    leadership,
    resilienceGrowth,
    teamworkProblemSolving,
    communication,
    programAlignment,
    portfolioEvidence,
  }
}

export function aggregateOverall(s: MeritSubscores): number {
  return Math.round(
    s.motivation * 0.2 +
      s.leadership * 0.18 +
      s.resilienceGrowth * 0.16 +
      s.teamworkProblemSolving * 0.14 +
      s.communication * 0.14 +
      s.programAlignment * 0.1 +
      s.portfolioEvidence * 0.08
  )
}
