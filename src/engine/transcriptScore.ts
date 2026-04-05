import type { ApplicationFormData, MeritSubscores, ProgramId } from '@/types/application'
import { PROGRAM_LABELS } from '@/data/programs'

/**
 * Keyword families mapped to the official video presentation prompts.
 * Transparent heuristics — not ML; committee can override.
 */
const Q1_WHY_INVISION = [
  'invision',
  'in vision',
  'apply',
  'applying',
  'university',
  'why ',
  'want to join',
  'opportunity',
  'believe',
  'drawn',
]

const Q2_PROGRAM_WHY = [
  'program',
  'track',
  'interested',
  'interest',
  'because',
  'choose',
  'chose',
  'sociology',
  'administration',
  'public admin',
  'digital',
  'engineering',
  'creative',
  'media',
  'marketing',
  'products',
  'services',
]

const Q3_CHALLENGE = [
  'challenge',
  'overcome',
  'difficult',
  'struggl',
  'failed',
  'failure',
  'obstacle',
  'helped',
  'through',
  'learned',
  'mistake',
]

const Q4_GOALS = [
  'goal',
  'goals',
  'future',
  'long-term',
  'long term',
  'motivat',
  'life',
  'career',
  'purpose',
  'contribute',
  'impact',
  'dream',
]

const Q5_LEADERSHIP = [
  'lead',
  'leader',
  'leadership',
  'initiat',
  'responsib',
  'example',
  'organiz',
  'team',
  'mentor',
]

const Q6_SUPPORT = [
  'family',
  'support',
  'mother',
  'father',
  'parent',
  'parents',
  'encourag',
  'believes',
  'decision',
  'biggest',
]

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function countHits(text: string, terms: string[]): number {
  const lower = text.toLowerCase()
  return terms.reduce((n, term) => (lower.includes(term.trim()) ? n + 1 : n), 0)
}

function programTokens(programId: ProgramId): string[] {
  const label = PROGRAM_LABELS[programId].toLowerCase()
  return label.split(/[^a-z0-9]+/).filter((w) => w.length > 3)
}

function firstPersonDensity(text: string): number {
  const lower = text.toLowerCase()
  const iCount = (lower.match(/\bi\b/g) ?? []).length
  const words = text.split(/\s+/).filter(Boolean).length
  if (words === 0) return 0
  return iCount / words
}

/** Explainable heuristic scoring from transcript + optional behavioral summary. */
export function scoreFromTranscript(
  f: ApplicationFormData
): MeritSubscores {
  const text = `${f.videoTranscript}\n${f.personality.summary}`.trim()
  const base = 36
  const wc = text.split(/\s+/).filter(Boolean).length
  const lower = text.toLowerCase()

  const motivationInVisionU = clamp(
    base +
      countHits(text, Q1_WHY_INVISION) * 7 +
      (lower.includes('invision') || lower.includes('in vision') ? 12 : 0) +
      (wc > 100 ? 8 : 0),
    0,
    100
  )

  let programFit = base + countHits(text, Q2_PROGRAM_WHY) * 5 + (wc > 90 ? 6 : 0)
  if (f.programId) {
    const tok = programTokens(f.programId as ProgramId)
    const hits = tok.filter((t) => lower.includes(t)).length
    programFit += hits * 10
  }
  programFit = clamp(programFit, 0, 100)

  const resilienceChallenge = clamp(
    base + countHits(text, Q3_CHALLENGE) * 8 + (wc > 80 ? 6 : 0),
    0,
    100
  )

  const goalsAndPurpose = clamp(
    base + countHits(text, Q4_GOALS) * 7 + (wc > 100 ? 8 : 0),
    0,
    100
  )

  const leadershipEvidence = clamp(
    base + countHits(text, Q5_LEADERSHIP) * 7 + (wc > 85 ? 6 : 0),
    0,
    100
  )

  const supportSystemEncouragement = clamp(
    base + countHits(text, Q6_SUPPORT) * 9 + (wc > 70 ? 4 : 0),
    0,
    100
  )

  const fp = firstPersonDensity(text)
  const communicationClarity = clamp(
    base +
      Math.round(fp * 420) +
      (wc > 140 ? 14 : wc > 90 ? 6 : 0) +
      (text.split(/[.!?]+/).filter((s) => s.trim().length > 8).length > 4 ? 6 : 0),
    0,
    100
  )

  const portfolioN = f.uploads.portfolio.filter((p) => p.attached).length
  const portfolioEvidence =
    portfolioN > 0
      ? clamp(52 + portfolioN * 9 + (wc > 100 ? 10 : 0), 0, 100)
      : clamp(30 + (wc > 90 ? 10 : 0), 0, 100)

  return {
    motivationInVisionU,
    programFit,
    resilienceChallenge,
    goalsAndPurpose,
    leadershipEvidence,
    supportSystemEncouragement,
    communicationClarity,
    portfolioEvidence,
  }
}

export function aggregateOverall(s: MeritSubscores): number {
  return Math.round(
    s.motivationInVisionU * 0.15 +
      s.programFit * 0.15 +
      s.resilienceChallenge * 0.13 +
      s.goalsAndPurpose * 0.13 +
      s.leadershipEvidence * 0.12 +
      s.supportSystemEncouragement * 0.08 +
      s.communicationClarity * 0.12 +
      s.portfolioEvidence * 0.12
  )
}
