import type {
  ApplicationFormData,
  EligibilityFailureReason,
  EnglishExamType,
  ProgramId,
} from '@/types/application'
import { programMatchesSubjectCombo } from '@/data/programs'

function isKazakhstanApplicant(f: ApplicationFormData): boolean {
  const c = `${f.personal.citizenship} ${f.personal.country}`.toLowerCase()
  return (
    c.includes('kazakh') ||
    c.includes('казах') ||
    c.includes('kz') ||
    c.includes('qazaq')
  )
}

export function englishMeetsThreshold(
  type: EnglishExamType,
  score: number
): boolean {
  switch (type) {
    case 'IELTS':
      return score >= 6
    case 'TOEFL':
      return score >= 80
    case 'Duolingo':
      return score >= 105
    case 'other':
    default:
      return score >= 65
  }
}

export function evaluateEligibility(
  f: ApplicationFormData
): { ok: true } | { ok: false; reasons: EligibilityFailureReason[] } {
  const reasons: EligibilityFailureReason[] = []

  if (!f.programId || !f.subjectCombination) {
    reasons.push('invalid_program_selection')
    return { ok: false, reasons }
  }

  const programId = f.programId as ProgramId
  if (!programMatchesSubjectCombo(programId, f.subjectCombination)) {
    reasons.push('subject_program_mismatch')
  }

  const ent = Number(f.entScore)
  if (isKazakhstanApplicant(f) && ent < 80) {
    reasons.push('ent_below_threshold_kz')
  }

  if (
    !f.englishExamType ||
    f.englishScore === '' ||
    !englishMeetsThreshold(
      f.englishExamType as EnglishExamType,
      Number(f.englishScore)
    )
  ) {
    reasons.push('english_below_threshold')
  }

  if (reasons.length) return { ok: false, reasons }
  return { ok: true }
}
