import type {
  ApplicationFormData,
  CompletenessReason,
  EligibilityFailureReason,
  ExplainFactor,
  MeritSubscores,
  PipelineEvaluation,
  RiskLevel,
} from '@/types/application'

const completenessCopy: Record<CompletenessReason, string> = {
  missing_personal_field: 'Complete all personal and contact fields.',
  missing_program: 'Select a program track.',
  missing_subject_combo: 'Select your subject combination.',
  missing_ent: 'Enter a valid ENT score.',
  missing_english: 'Provide English exam type and score.',
  missing_passport_upload: 'Attach passport / ID (simulated upload).',
  missing_ent_certificate: 'Attach ENT certificate (simulated upload).',
  missing_english_certificate: 'Attach English certificate (simulated upload).',
  missing_portfolio: 'Attach at least one portfolio / additional document.',
  missing_video: 'Provide a video link or mark video file attached.',
  missing_personality_summary: 'Complete the personality summary.',
}

const eligibilityCopy: Record<EligibilityFailureReason, string> = {
  ent_below_threshold_kz:
    'Kazakhstan applicants require ENT ≥ 80 (configurable rule).',
  english_below_threshold: 'English score is below the threshold for the selected exam type.',
  subject_program_mismatch:
    'Subject combination does not match the selected program track.',
  invalid_program_selection: 'Program or subject data is invalid.',
}

export function buildHardRuleSummary(
  completeness: PipelineEvaluation['completeness'],
  eligibility: PipelineEvaluation['eligibility']
): string[] {
  const lines: string[] = []
  if (!completeness.complete) {
    lines.push('Completeness: failed — application is Incomplete.')
    completeness.reasons.forEach((r) => {
      lines.push(`· ${completenessCopy[r]}`)
    })
    return lines
  }
  lines.push('Completeness: passed.')
  if (!eligibility.ok) {
    lines.push('Eligibility: failed — candidate is Ineligible.')
    eligibility.reasons.forEach((r) => {
      lines.push(`· ${eligibilityCopy[r]}`)
    })
  } else {
    lines.push('Eligibility: passed (ENT rule for Kazakhstan, English, subject-program match).')
  }
  return lines
}

export function buildExplanationTags(
  sub: MeritSubscores | null,
  textRisk: RiskLevel,
  videoRisk: RiskLevel
): string[] {
  const tags: string[] = []
  if (!sub) return tags
  if (sub.leadership >= 65) tags.push('Leadership signals')
  if (sub.motivation >= 65) tags.push('Strong motivation')
  if (sub.resilienceGrowth >= 62) tags.push('Growth / resilience')
  if (sub.teamworkProblemSolving >= 60) tags.push('Collaboration / problem-solving')
  if (sub.communication >= 62) tags.push('Communication clarity')
  if (sub.portfolioEvidence >= 70) tags.push('Portfolio evidence')
  if (sub.programAlignment >= 68) tags.push('Program alignment')
  if (textRisk === 'high') tags.push('Text authenticity risk (review)')
  if (videoRisk === 'high') tags.push('Video authenticity risk (review)')
  return tags
}

export function buildExplainFactors(
  _f: ApplicationFormData,
  completeness: PipelineEvaluation['completeness'],
  eligibility: PipelineEvaluation['eligibility'],
  sub: MeritSubscores | null,
  overall: number | null,
  textRisk: RiskLevel,
  videoRisk: RiskLevel
): ExplainFactor[] {
  const factors: ExplainFactor[] = []

  if (!completeness.complete) {
    factors.push({
      dimension: 'Completeness',
      impact: 'negative',
      rationale:
        'Required fields or uploads are missing; scoring is deferred until the applicant completes the package.',
    })
    return factors
  }

  if (!eligibility.ok) {
    factors.push({
      dimension: 'Eligibility gates',
      impact: 'negative',
      rationale:
        'Hard rules failed (ENT for Kazakhstan citizens, English threshold, or subject-program fit). No merit ranking applied.',
    })
    return factors
  }

  factors.push({
    dimension: 'Fairness',
    impact: 'positive',
    rationale:
      'Scores use transcript, portfolio flags, and program fit only — not name, city, citizenship, or contact details.',
  })

  if (sub) {
    factors.push({
      dimension: 'Motivation & values (transcript)',
      impact: sub.motivation >= 60 ? 'positive' : 'neutral',
      rationale: 'Keyword and structure heuristics on the declared transcript text.',
    })
    factors.push({
      dimension: 'Leadership',
      impact: sub.leadership >= 60 ? 'positive' : 'neutral',
      rationale: 'Based on leadership-related language in transcript / personality summary.',
    })
    factors.push({
      dimension: 'Resilience / growth',
      impact: sub.resilienceGrowth >= 58 ? 'positive' : 'neutral',
      rationale: 'Signals of challenges, support, and reflection.',
    })
    factors.push({
      dimension: 'Teamwork & problem-solving',
      impact: sub.teamworkProblemSolving >= 58 ? 'positive' : 'neutral',
      rationale: 'Collaboration and problem-solving cues in text.',
    })
    factors.push({
      dimension: 'Communication',
      impact: sub.communication >= 58 ? 'positive' : 'neutral',
      rationale: 'First-person detail and length used as transparent proxies — not NLP “black box”.',
    })
    factors.push({
      dimension: 'Program alignment',
      impact: sub.programAlignment >= 62 ? 'positive' : 'neutral',
      rationale: 'Overlap between transcript and selected program themes.',
    })
    factors.push({
      dimension: 'Portfolio / evidence',
      impact: sub.portfolioEvidence >= 65 ? 'positive' : 'neutral',
      rationale: 'Attachments present increase evidence score in this MVP.',
    })
  }

  factors.push({
    dimension: 'Authenticity risk (advisory)',
    impact:
      textRisk === 'high' || videoRisk === 'high' ? 'negative' : 'neutral',
    rationale:
      'Heuristic flags for committee review only — not automated rejection.',
  })

  if (overall !== null) {
    factors.push({
      dimension: 'Overall',
      impact: overall >= 72 ? 'positive' : overall >= 55 ? 'neutral' : 'negative',
      rationale: `Weighted composite: ${overall}/100. Human committee decides next steps.`,
    })
  }

  return factors
}
