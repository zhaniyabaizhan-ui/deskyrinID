import type { ApplicationFormData, CompletenessReason } from '@/types/application'

export function evaluateCompleteness(
  f: ApplicationFormData
): { complete: boolean; reasons: CompletenessReason[] } {
  const reasons: CompletenessReason[] = []
  const p = f.personal

  if (
    !p.fullName.trim() ||
    !p.citizenship.trim() ||
    !p.dateOfBirth.trim() ||
    !p.email.trim() ||
    !p.phone.trim() ||
    !p.city.trim() ||
    !p.country.trim()
  ) {
    reasons.push('missing_personal_field')
  }
  if (!f.programId) reasons.push('missing_program')
  if (!f.subjectCombination) reasons.push('missing_subject_combo')
  if (f.entScore === '' || Number(f.entScore) <= 0) reasons.push('missing_ent')
  if (!f.englishExamType || f.englishScore === '') {
    reasons.push('missing_english')
  }
  if (!f.uploads.passportOrId.attached) reasons.push('missing_passport_upload')
  if (!f.uploads.entCertificate.attached) {
    reasons.push('missing_ent_certificate')
  }
  if (!f.uploads.englishCertificate.attached) {
    reasons.push('missing_english_certificate')
  }
  if (f.uploads.portfolio.length === 0) reasons.push('missing_portfolio')
  const hasVideo =
    Boolean(f.videoUrl.trim()) || Boolean(f.videoFile.attached)
  if (!hasVideo) reasons.push('missing_video')
  if (!f.personality.summary.trim()) reasons.push('missing_personality_summary')

  return { complete: reasons.length === 0, reasons }
}
