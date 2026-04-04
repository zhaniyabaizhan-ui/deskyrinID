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
 * Risk indicators only — not proof of misconduct.
 * Uses transcript + declared program name overlap.
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
    notes.push('Transcript is very short — low specificity for review.')
  }

  const genericHits = GENERIC.filter((g) => lower.includes(g)).length
  if (genericHits >= 2) {
    textScore += 3
    notes.push('Several generic / template-like phrases in transcript.')
  }

  const iCount = (lower.match(/\bi\b/g) ?? []).length
  if (t.length > 200 && iCount < 3) {
    textScore += 2
    notes.push('Limited first-person detail relative to length.')
  }

  if (f.programId) {
    const label = PROGRAM_LABELS[f.programId as ProgramId].toLowerCase()
    const tokens = label.split(/\s+/).filter((w) => w.length > 4)
    const mentionsProgram = tokens.some((w) => lower.includes(w))
    if (!mentionsProgram && t.length > 120) {
      textScore += 2
      notes.push('Transcript mentions little that aligns with the selected program name.')
    }
  }

  const textAuthenticityRisk = levelFromScore(textScore)

  let videoScore = textScore
  if (!f.videoUrl.trim() && !f.videoFile.attached && t.length > 0) {
    videoScore += 1
    notes.push('Transcript present but no video link/file declared — verify asset.')
  }

  const videoAuthenticityRisk = levelFromScore(videoScore)

  if (notes.length === 0) {
    notes.push('No elevated authenticity risk flags from heuristics.')
  }

  return { textAuthenticityRisk, videoAuthenticityRisk, notes }
}
