import type { ApplicationFormData } from '@/types/application'

/** Register new synthetic packages here; swap in real demo data later. */
export type DemoPresetId = string

export type DemoPresetDefinition = {
  id: DemoPresetId
  label: string
  description: string
  /** Builds a full form — attachments are simulated (no binary storage). */
  build: () => ApplicationFormData
}

/** Placeholder assets for UI copy / future file hooks. */
export type DemoAssetSlot =
  | 'passport_pdf'
  | 'ent_certificate_pdf'
  | 'english_certificate_pdf'
  | 'portfolio_pdf'
  | 'video_metadata'
  | 'transcript_txt'
  | 'personality_json'

export const DEMO_ASSET_SLOTS: DemoAssetSlot[] = [
  'passport_pdf',
  'ent_certificate_pdf',
  'english_certificate_pdf',
  'portfolio_pdf',
  'video_metadata',
  'transcript_txt',
  'personality_json',
]
