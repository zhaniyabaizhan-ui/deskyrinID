import type { ReviewTier } from '@/types/application'

export function routingHeadline(tier: ReviewTier): string {
  switch (tier) {
    case 'incomplete':
      return 'Incomplete — finish required items before review'
    case 'ineligible':
      return 'Ineligible — did not pass hard eligibility rules'
    case 'priority_review':
      return 'Priority review — strong package for early committee attention'
    case 'standard_review':
      return 'Standard review — proceed in the normal queue'
    case 'manual_review':
      return 'Manual review — committee should validate context'
    default:
      return tier
  }
}

export function routingDetail(tier: ReviewTier): string {
  switch (tier) {
    case 'incomplete':
      return 'Completeness check failed. Eligibility and merit scores are not applied until the application is complete.'
    case 'ineligible':
      return 'One or more hard rules failed (e.g. ENT for Kazakhstan citizens, English threshold, or subject–program match). No merit ranking is shown.'
    case 'priority_review':
      return 'Eligible candidate with a high overall score (after advisory authenticity adjustments). Not an admission offer.'
    case 'standard_review':
      return 'Eligible candidate in the mid score band — routine committee workflow.'
    case 'manual_review':
      return 'Lower band and/or elevated authenticity risk signals — human judgment especially important.'
    default:
      return ''
  }
}
