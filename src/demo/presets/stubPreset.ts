import type { ApplicationFormData } from '@/types/application'
import type { DemoPresetDefinition } from '@/demo/presets/types'

/**
 * Single stub preset — replace with polished synthetic candidates later.
 * File names are placeholders only (no real files bundled).
 */
function buildStubForm(): ApplicationFormData {
  return {
    personal: {
      fullName: 'Demo Applicant (Stub)',
      citizenship: 'Kazakhstan',
      dateOfBirth: '2007-03-15',
      email: 'demo.applicant@example.com',
      phone: '+7 700 000 0000',
      city: 'Almaty',
      country: 'Kazakhstan',
    },
    programId: 'innovative_digital_products',
    subjectCombination: 'math_informatics',
    entScore: 112,
    englishExamType: 'IELTS',
    englishScore: 6.5,
    uploads: {
      passportOrId: {
        attached: true,
        fileName: 'placeholder_passport.pdf',
        source: 'demo',
      },
      entCertificate: {
        attached: true,
        fileName: 'placeholder_ent_certificate.pdf',
        source: 'demo',
      },
      englishCertificate: {
        attached: true,
        fileName: 'placeholder_ielts.pdf',
        source: 'demo',
      },
      portfolio: [
        {
          attached: true,
          fileName: 'placeholder_portfolio_project_1.pdf',
          source: 'demo',
        },
        {
          attached: true,
          fileName: 'placeholder_portfolio_project_2.pdf',
          source: 'demo',
        },
      ],
    },
    videoUrl: 'https://example.com/placeholder-video',
    videoFile: { attached: false },
    videoTranscript: `I'm applying to inVision U because I want to build products that matter. I'm interested in Innovative Digital Products and Services — I have been coding small tools for my school and I love turning messy problems into simple interfaces.

A major challenge was leading our robotics club when funding disappeared. What helped me was being honest with the team, splitting work clearly, and asking teachers for space instead of money. I learned that leadership means making it easy for others to contribute.

Long term I want to launch an ed-tech product for rural students. This program would give me structure, mentors, and peers who push me. What motivates me is seeing someone understand something for the first time.

To me, leadership is taking responsibility when it's uncomfortable. Last year I organized a weekend workshop for younger students even though I was nervous about public speaking.

My family supports my decision; my mother is my biggest encouragement — she reminds me that growth takes time.

I value integrity and curiosity. I know I still have a lot to learn, but I'm ready to work hard and listen.`,
    personality: {
      summary:
        'Behavioral note (demo): works well in structured teams; open to feedback; steady under deadlines. Supportive signal for committee context only.',
      openness: 72,
      conscientiousness: 68,
      collaboration: 74,
    },
  }
}

export const STUB_PRESET: DemoPresetDefinition = {
  id: 'stub_v1',
  label: 'Stub demo package v1',
  description:
    'Synthetic placeholder for judge demos. Swap file names and transcript in code or add new presets in registry.',
  build: buildStubForm,
}
