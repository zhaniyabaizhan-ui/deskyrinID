import type { MeritSubscores } from '@/types/application'

export const MERIT_BREAKDOWN_ROWS: {
  key: keyof MeritSubscores
  label: string
}[] = [
  { key: 'motivationInVisionU', label: 'Why inVision U (video Q1)' },
  { key: 'programFit', label: 'Program interest & fit (video Q2)' },
  { key: 'resilienceChallenge', label: 'Challenge overcome (video Q3)' },
  { key: 'goalsAndPurpose', label: 'Goals & purpose (video Q4)' },
  { key: 'leadershipEvidence', label: 'Leadership (video Q5)' },
  { key: 'supportSystemEncouragement', label: 'Support & encouragement (video Q6)' },
  { key: 'communicationClarity', label: 'Communication clarity' },
  { key: 'portfolioEvidence', label: 'Portfolio / evidence' },
]

/** Older localStorage payloads used previous field names — map for display only. */
export function normalizeMeritSubscores(raw: unknown): MeritSubscores | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.motivationInVisionU === 'number') {
    return raw as MeritSubscores
  }
  if (typeof o.motivation === 'number') {
    const mot = Number(o.motivation) || 0
    const res = Number(o.resilienceGrowth) || 0
    return {
      motivationInVisionU: mot,
      programFit: Number(o.programAlignment) || 0,
      resilienceChallenge: res,
      goalsAndPurpose: Math.round((res + mot) / 2) || 40,
      leadershipEvidence: Number(o.leadership) || 0,
      supportSystemEncouragement: Number(o.teamworkProblemSolving) || 0,
      communicationClarity: Number(o.communication) || 0,
      portfolioEvidence: Number(o.portfolioEvidence) || 0,
    }
  }
  return null
}
