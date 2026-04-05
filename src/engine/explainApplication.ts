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
  missing_video:
    'Provide a video link, attach a video file, or paste a transcript/summary (at least ~50 characters).',
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
  if (sub.motivationInVisionU >= 64) tags.push('Why inVision U (transcript)')
  if (sub.programFit >= 64) tags.push('Program fit')
  if (sub.resilienceChallenge >= 62) tags.push('Challenge / resilience')
  if (sub.goalsAndPurpose >= 62) tags.push('Goals & motivation')
  if (sub.leadershipEvidence >= 62) tags.push('Leadership example')
  if (sub.supportSystemEncouragement >= 60) tags.push('Support / encouragement')
  if (sub.communicationClarity >= 62) tags.push('Communication clarity')
  if (sub.portfolioEvidence >= 70) tags.push('Portfolio evidence')
  if (textRisk === 'high') tags.push('Text authenticity risk signal')
  if (videoRisk === 'high') tags.push('Video authenticity risk signal')
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
      dimension: 'Why inVision U (video Q1)',
      impact: sub.motivationInVisionU >= 58 ? 'positive' : 'neutral',
      rationale:
        'Signals from transcript/summary about motivation to join inVision U (prompt-aligned keywords).',
    })
    factors.push({
      dimension: 'Program interest & fit (video Q2)',
      impact: sub.programFit >= 58 ? 'positive' : 'neutral',
      rationale:
        'Language about program choice plus overlap with the selected track name.',
    })
    factors.push({
      dimension: 'Challenge overcome (video Q3)',
      impact: sub.resilienceChallenge >= 56 ? 'positive' : 'neutral',
      rationale: 'References to difficulty, support, and what helped the applicant persist.',
    })
    factors.push({
      dimension: 'Long-term goals & purpose (video Q4)',
      impact: sub.goalsAndPurpose >= 56 ? 'positive' : 'neutral',
      rationale: 'Future orientation, motivation, and intended impact.',
    })
    factors.push({
      dimension: 'Leadership (video Q5)',
      impact: sub.leadershipEvidence >= 56 ? 'positive' : 'neutral',
      rationale: 'Examples or language about responsibility, initiative, or leading others.',
    })
    factors.push({
      dimension: 'Support system (video Q6)',
      impact: sub.supportSystemEncouragement >= 54 ? 'positive' : 'neutral',
      rationale: 'Family/support and encouragement (non-scoring for admission by itself).',
    })
    factors.push({
      dimension: 'Communication clarity',
      impact: sub.communicationClarity >= 56 ? 'positive' : 'neutral',
      rationale:
        'First-person usage, length, and simple structure proxies — transparent, not “black box”.',
    })
    factors.push({
      dimension: 'Portfolio / additional evidence',
      impact: sub.portfolioEvidence >= 65 ? 'positive' : 'neutral',
      rationale: 'Declared portfolio attachments strengthen evidence in this MVP.',
    })
  }

  factors.push({
    dimension: 'Authenticity risk signals',
    impact:
      textRisk === 'high' || videoRisk === 'high' ? 'negative' : 'neutral',
    rationale:
      'Heuristic risk flags to aid manual review — not verified AI detection and not auto-rejection.',
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
