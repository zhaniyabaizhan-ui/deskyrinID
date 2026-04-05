/** Five inVision U tracks (canonical ids). */
export type ProgramId =
  | 'sociology_innovation_leadership'
  | 'strategies_public_admin'
  | 'innovative_digital_products'
  | 'creative_engineering'
  | 'digital_media_marketing'

export type SubjectCombination =
  | 'math_geography'
  | 'math_informatics'
  | 'math_physics'
  | 'history_kz_reading_creative'

export type EnglishExamType = 'IELTS' | 'TOEFL' | 'Duolingo' | 'other'

/** Document slot — real “upload” stores filename only in MVP; demo path for judges. */
export type DocumentAttachment = {
  attached: boolean
  fileName?: string
  source?: 'uploaded' | 'demo'
}

/** @deprecated Use DocumentAttachment — kept as alias for presets / older code. */
export type SimulatedUpload = DocumentAttachment

export type PersonalitySummary = {
  /** Short prose for committee + scoring hints */
  summary: string
  /** Optional quick dimensions for demo (not scored demographically). */
  openness?: number
  conscientiousness?: number
  collaboration?: number
}

/**
 * Personal & contact data — identification / ops only.
 * Must never feed numeric scoring heuristics.
 */
export type PersonalSection = {
  fullName: string
  citizenship: string
  dateOfBirth: string
  email: string
  phone: string
  city: string
  country: string
}

export type ApplicationFormData = {
  personal: PersonalSection
  programId: ProgramId | ''
  subjectCombination: SubjectCombination | ''
  entScore: number | ''
  englishExamType: EnglishExamType | ''
  englishScore: number | ''
  uploads: {
    passportOrId: SimulatedUpload
    entCertificate: SimulatedUpload
    englishCertificate: SimulatedUpload
    portfolio: SimulatedUpload[]
  }
  videoUrl: string
  videoFile: SimulatedUpload
  /** Main qualitative text for MVP “video analysis” (transcript or summary). */
  videoTranscript: string
  personality: PersonalitySummary
}

export type CompletenessReason =
  | 'missing_personal_field'
  | 'missing_program'
  | 'missing_subject_combo'
  | 'missing_ent'
  | 'missing_english'
  | 'missing_passport_upload'
  | 'missing_ent_certificate'
  | 'missing_english_certificate'
  | 'missing_portfolio'
  | 'missing_video'
  | 'missing_personality_summary'

export type EligibilityFailureReason =
  | 'ent_below_threshold_kz'
  | 'english_below_threshold'
  | 'subject_program_mismatch'
  | 'invalid_program_selection'

export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * Subscores aligned to inVision U video prompts (+ communication + portfolio).
 * Derived from transcript/summary heuristics only — not demographics.
 */
export type MeritSubscores = {
  motivationInVisionU: number
  programFit: number
  resilienceChallenge: number
  goalsAndPurpose: number
  leadershipEvidence: number
  supportSystemEncouragement: number
  communicationClarity: number
  portfolioEvidence: number
}

export type ExplainFactor = {
  dimension: string
  impact: 'positive' | 'neutral' | 'negative'
  rationale: string
}

export type ReviewTier =
  | 'incomplete'
  | 'ineligible'
  | 'priority_review'
  | 'standard_review'
  | 'manual_review'

export type PipelineEvaluation = {
  completeness: { complete: boolean; reasons: CompletenessReason[] }
  eligibility:
    | { ok: true }
    | { ok: false; reasons: EligibilityFailureReason[] }
  /** 0–100; only when complete + eligible */
  overallScore: number | null
  subscores: MeritSubscores | null
  recommendation: ReviewTier
  explanationTags: string[]
  explainFactors: ExplainFactor[]
  hardRuleSummary: string[]
  textAuthenticityRisk: RiskLevel
  videoAuthenticityRisk: RiskLevel
  authenticityNotes: string[]
}

export type SubmittedApplication = {
  id: string
  submittedAt: string
  form: ApplicationFormData
  evaluation: PipelineEvaluation
  /** Committee demo state — not used in automated scoring. */
  committeeShortlisted: boolean
  committeeNote: string
}

export function createEmptyForm(): ApplicationFormData {
  return {
    personal: {
      fullName: '',
      citizenship: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      city: '',
      country: '',
    },
    programId: '',
    subjectCombination: '',
    entScore: '',
    englishExamType: '',
    englishScore: '',
    uploads: {
      passportOrId: { attached: false },
      entCertificate: { attached: false },
      englishCertificate: { attached: false },
      portfolio: [],
    },
    videoUrl: '',
    videoFile: { attached: false },
    videoTranscript: '',
    personality: { summary: '' },
  }
}
