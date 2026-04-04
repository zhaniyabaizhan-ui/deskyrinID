import type { ProgramId, SubjectCombination } from '@/types/application'

export const PROGRAM_LABELS: Record<ProgramId, string> = {
  sociology_innovation_leadership:
    'Sociology of Innovation and Leadership',
  strategies_public_admin:
    'Strategies of Public Administration and Development',
  innovative_digital_products:
    'Innovative Digital Products and Services',
  creative_engineering: 'Creative Engineering',
  digital_media_marketing: 'Digital Media and Marketing',
}

/** Which subject profile each program requires. */
export const PROGRAM_ALLOWED_COMBOS: Record<ProgramId, SubjectCombination[]> = {
  sociology_innovation_leadership: ['math_geography'],
  strategies_public_admin: ['math_geography'],
  innovative_digital_products: ['math_informatics'],
  creative_engineering: ['math_physics'],
  digital_media_marketing: ['history_kz_reading_creative'],
}

export const SUBJECT_COMBO_LABELS: Record<SubjectCombination, string> = {
  math_geography: 'Math + Geography',
  math_informatics: 'Math + Informatics',
  math_physics: 'Math + Physics',
  history_kz_reading_creative:
    'History of Kazakhstan + Reading Literacy + 2 creative exams',
}

export const PROGRAM_IDS: ProgramId[] = [
  'sociology_innovation_leadership',
  'strategies_public_admin',
  'innovative_digital_products',
  'creative_engineering',
  'digital_media_marketing',
]

export function programMatchesSubjectCombo(
  programId: ProgramId,
  combo: SubjectCombination
): boolean {
  return PROGRAM_ALLOWED_COMBOS[programId].includes(combo)
}
