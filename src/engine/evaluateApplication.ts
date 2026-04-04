import type {
  ApplicationFormData,
  PipelineEvaluation,
  ReviewTier,
  SubmittedApplication,
} from '@/types/application'
import { evaluateCompleteness } from '@/engine/completeness'
import { evaluateEligibility } from '@/engine/eligibilityRules'
import { aggregateOverall, scoreFromTranscript } from '@/engine/transcriptScore'
import { assessAuthenticityRisks } from '@/engine/authenticityRisk'
import {
  buildExplainFactors,
  buildExplanationTags,
  buildHardRuleSummary,
} from '@/engine/explainApplication'

function pickRecommendation(
  complete: boolean,
  eligible: boolean,
  overall: number | null,
  textRisk: 'low' | 'medium' | 'high',
  videoRisk: 'low' | 'medium' | 'high'
): ReviewTier {
  if (!complete) return 'incomplete'
  if (!eligible) return 'ineligible'

  let score = overall ?? 0
  if (textRisk === 'high' || videoRisk === 'high') {
    score = Math.max(0, score - 8)
  } else if (textRisk === 'medium' || videoRisk === 'medium') {
    score = Math.max(0, score - 4)
  }

  if (score >= 76) return 'priority_review'
  if (score >= 54) return 'standard_review'
  return 'manual_review'
}

export function evaluateApplication(form: ApplicationFormData): PipelineEvaluation {
  const completeness = evaluateCompleteness(form)
  const eligibility = completeness.complete
    ? evaluateEligibility(form)
    : ({ ok: true as const })

  const risks = assessAuthenticityRisks(form)

  let subscores = null
  let overallScore: number | null = null

  const eligible = completeness.complete && eligibility.ok

  if (eligible) {
    subscores = scoreFromTranscript(form)
    overallScore = aggregateOverall(subscores)
  }

  const recommendation = pickRecommendation(
    completeness.complete,
    eligible,
    overallScore,
    risks.textAuthenticityRisk,
    risks.videoAuthenticityRisk
  )

  return {
    completeness,
    eligibility: completeness.complete ? eligibility : { ok: true },
    overallScore,
    subscores,
    recommendation,
    explanationTags: buildExplanationTags(
      subscores,
      risks.textAuthenticityRisk,
      risks.videoAuthenticityRisk
    ),
    explainFactors: buildExplainFactors(
      form,
      completeness,
      eligibility,
      subscores,
      overallScore,
      risks.textAuthenticityRisk,
      risks.videoAuthenticityRisk
    ),
    hardRuleSummary: buildHardRuleSummary(completeness, eligibility),
    textAuthenticityRisk: risks.textAuthenticityRisk,
    videoAuthenticityRisk: risks.videoAuthenticityRisk,
    authenticityNotes: risks.notes,
  }
}

function randomId(): string {
  return `IVU-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function submitApplication(form: ApplicationFormData): SubmittedApplication {
  return {
    id: randomId(),
    submittedAt: new Date().toISOString(),
    form,
    evaluation: evaluateApplication(form),
    committeeShortlisted: false,
    committeeNote: '',
  }
}
