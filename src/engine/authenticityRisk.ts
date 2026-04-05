import type { ApplicationFormData, ProgramId, RiskLevel } from '@/types/application'
import { PROGRAM_LABELS } from '@/data/programs'

const GENERIC = [
  'furthermore',
  'it is important to note',
  'in conclusion',
  'leverage',
  'synerg',
  'cutting-edge',
  'delve into',
  'landscape of',
]

function levelFromScore(score: number): RiskLevel {
  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

/**
 * Authenticity risk signals for manual review — not proof of AI use or fraud.
 */
export function assessAuthenticityRisks(f: ApplicationFormData): {
  textAuthenticityRisk: RiskLevel
  videoAuthenticityRisk: RiskLevel
  notes: string[]
} {
  const notes: string[] = []
  const t = f.videoTranscript.trim()
  const lower = t.toLowerCase()
  let textScore = 0

  if (t.length > 0 && t.length < 80) {
    textScore += 2
    notes.push(
      'Risk signal: transcript is very short — low specificity; confirm in interview.'
    )
  }

  const genericHits = GENERIC.filter((g) => lower.includes(g)).length
  if (genericHits >= 2) {
    textScore += 3
    notes.push(
      'Risk signal: repeated generic / template-like phrasing (not proof of AI).'
    )
  }

  const iCount = (lower.match(/\bi\b/g) ?? []).length
  if (t.length > 200 && iCount < 3) {
    textScore += 2
    notes.push('Risk signal: weak first-person detail vs length — probe lived experience.')
  }

  const hasNumbers = /\d/.test(t)
  const hasConcrete = /project|school|club|city|year|month|teacher|team|event/i.test(t)
  if (t.length > 200 && !hasNumbers && !hasConcrete) {
    textScore += 1
    notes.push(
      'Risk signal: few concrete anchors (dates, places, named activities) vs claimed experience.'
    )
  }

  if (f.programId) {
    const label = PROGRAM_LABELS[f.programId as ProgramId].toLowerCase()
    const tokens = label.split(/\s+/).filter((w) => w.length > 4)
    const mentionsProgram = tokens.some((w) => lower.includes(w))
    if (!mentionsProgram && t.length > 120) {
      textScore += 2
      notes.push(
        'Risk signal: little overlap with selected program wording — check alignment.'
      )
    }
  }

  const textAuthenticityRisk = levelFromScore(textScore)

  let videoScore = textScore
  if (!f.videoUrl.trim() && !f.videoFile.attached && t.length > 0) {
    videoScore += 1
    notes.push(
      'Risk signal: transcript without declared video — verify recording exists.'
    )
  }

  const videoAuthenticityRisk = levelFromScore(videoScore)

  if (notes.length === 0) {
    notes.push('No elevated text- or video-authenticity risk signals from heuristics.')
  }

  return { textAuthenticityRisk, videoAuthenticityRisk, notes }
}
