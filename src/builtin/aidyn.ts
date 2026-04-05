import type { ApplicationFormData, SubmittedApplication } from '@/types/application'
import { submitApplication } from '@/engine/evaluateApplication'

/** Stable id for the embedded showcase candidate — keep in sync across app. */
export const BUILTIN_AIDYN_ID = 'IVU-BUILTIN-AIDYN'

/** Lightweight static poster for committee review (no large MP4 in repo). */
export const AIDYN_VIDEO_POSTER_PATH = '/demo-candidates/aidyn/preview-poster.svg'

/** Generic poster for other candidates on the review page. */
export const DEFAULT_VIDEO_POSTER_PATH = '/demo-candidates/preview-poster.svg'

/**
 * Full transcript from Aidyn’s video presentation (source of truth for qualitative scoring).
 */
export const AIDYN_VIDEO_TRANSCRIPT = `Hello, my name is Aidyn.

I wouldn't say that I'm the most naturally talented person — but I am someone who can take complex systems and turn them into real results.

My interest in IT didn't start with competitions. It started with curiosity — trying to understand how things actually work. How algorithms make decisions, and how data turns into action.

Over the past two years, I've participated in international hackathons and competitions. In one of them, my team and I built a system that analyzes user behavior and detects early signs of churn. We didn't win first place, but our solution was selected for a pilot implementation.

For me, that matters more.

I've also worked on my own projects — from Telegram bots to machine learning models. But the most important skill I've developed is the ability to see the full system: not just the code, but the problem, the user, and the impact of decisions.

I'm interested in building technology that actually changes how people behave, not just how things look.

inVision U, to me, is a place where thinking matters as much as results. I want to grow in an environment where people ask difficult questions and don't settle for simple answers.

I can't promise that I'll be the best student.
But I can promise that I'll be someone who turns complex ideas into working solutions.

Thank you.`

/**
 * Resume / CV text (from applicant package; extracted from provided DOCX for MVP display).
 */
export const AIDYN_RESUME_TEXT = `AIDYN ZHAMAL
aidyn.zhamal@gmail.com · +7 701 234 56 78 · Almaty, Kazakhstan

PERSONAL STATEMENT
I am a mathematics and informatics student with a deep passion for building digital products that solve real problems. Over the past two years I have independently developed two web applications and led a school startup project that reached 200+ users. I believe technology is the most powerful tool for positive change in Central Asia, and inVision U is where I want to grow as a builder and leader.

EDUCATION
NIS Almaty (Nazarbayev Intellectual School) | Grade 11 · Math & Informatics 2021 — Present
ENT score: 118 / 140
IELTS Academic: 7.0 (Listening 8.0, Reading 7.5, Writing 6.5, Speaking 6.5)
GPA equivalent: 4.8 / 5.0
Class representative and member of the Student Council for 2 consecutive years

PROJECTS
StudyBridge KZ | Founder & Full-Stack Developer — Sep 2023 — Present
· Web platform connecting NIS/BIL students with peer tutors — React, Node.js, PostgreSQL
· 230 registered users across 4 cities within 3 months without paid advertising
· Matching algorithm by subject, schedule, and learning style
· Best Digital Product — regional NIS student innovation fair

EcoTrack Almaty | Co-founder & Backend Developer — Jan 2023 — Aug 2023
· Civic tech for reporting neighborhood environmental issues; Express.js, PostgreSQL, city open data
· 1,200 issue reports in beta; letter of support from Almaty Akimat digital office

Kazakh NLP Dataset | Research Contributor — Jun 2023 — Oct 2023
· Annotated 3,000+ sentences; Python preprocessing; dataset on HuggingFace (180+ downloads)

SKILLS
Python, JavaScript/TypeScript, SQL · React, Node.js, Express, PostgreSQL, Git, Figma, REST APIs
Languages: Kazakh (native), Russian (native), English (IELTS 7.0)
Product thinking, user research, public speaking, team leadership

ACHIEVEMENTS
1st place — Regional Olympiad in Informatics, Almaty Oblast (2023)
Participant — MIT Emerging Talent online cohort (2024)
Volunteer mentor — digital literacy workshops for rural students
Co-organizer — school hackathon "HackNIS" (45 participants, 2023)`

export const AIDYN_CANDIDATE_SUMMARY = `Strong math–informatics profile (ENT 118, IELTS 7.0) with shipped products: StudyBridge (230 users), EcoTrack (civic tech with Akimat support), and NLP dataset contribution. Emphasizes systems thinking, pilot over podium, and impact beyond UI — aligned with Innovative Digital Products & Services.`

/** Committee-facing insight lines derived from the video story (not ML extraction). */
export const AIDYN_QUALITATIVE_INSIGHTS: { title: string; detail: string }[] = [
  {
    title: 'Why inVision U',
    detail:
      'Frames the university as a place for hard questions and thinking on par with results — not generic praise.',
  },
  {
    title: 'Program fit',
    detail:
      'Connects algorithms, data-to-action, churn analytics, and full-stack delivery to digital product building.',
  },
  {
    title: 'Resilience / learning',
    detail:
      'Hackathon outcome reframed: pilot selected over first place — values real-world traction.',
  },
  {
    title: 'Long-term direction',
    detail:
      'Wants technology that changes behavior and systems, not only appearance.',
  },
  {
    title: 'Leadership',
    detail:
      'Founder/co-founder roles, fair recognition of team vs solo work, structured delivery.',
  },
  {
    title: 'Support & voice',
    detail:
      'Honest closing: commits to turning complex ideas into working solutions rather than claiming “best student”.',
  },
]

export function buildAidynApplicationForm(): ApplicationFormData {
  return {
    personal: {
      fullName: 'Aidyn Zhamal',
      citizenship: 'Kazakhstan',
      dateOfBirth: '2007-05-12',
      email: 'aidyn.zhamal@gmail.com',
      phone: '+7 701 234 56 78',
      city: 'Almaty',
      country: 'Kazakhstan',
    },
    programId: 'innovative_digital_products',
    subjectCombination: 'math_informatics',
    entScore: 118,
    englishExamType: 'IELTS',
    englishScore: 7,
    uploads: {
      passportOrId: {
        attached: true,
        fileName: 'passport_aidyn.pdf',
        source: 'demo',
      },
      entCertificate: {
        attached: true,
        fileName: 'ENT_certificate_118.pdf',
        source: 'demo',
      },
      englishCertificate: {
        attached: true,
        fileName: 'IELTS_Academic_7.0.pdf',
        source: 'demo',
      },
      portfolio: [
        {
          attached: true,
          fileName: 'aidynCV.docx',
          source: 'demo',
        },
        {
          attached: true,
          fileName: 'StudyBridge_onepager.pdf',
          source: 'demo',
        },
        {
          attached: true,
          fileName: 'EcoTrack_akimat_support.pdf',
          source: 'demo',
        },
      ],
    },
    videoUrl: '',
    videoFile: {
      attached: true,
      fileName: 'preview-poster.svg (static MVP — full video hosted separately)',
      source: 'demo',
    },
    videoTranscript: AIDYN_VIDEO_TRANSCRIPT,
    personality: {
      summary:
        'Committee context: repeated signals of initiative (founder roles, council), comfort with ambiguity (pilot vs prize), and reflective communication. Use alongside transcript — not a separate admission test.',
      openness: 78,
      conscientiousness: 82,
      collaboration: 76,
    },
  }
}

export function getBuiltinAidynApplication(): SubmittedApplication {
  const form = buildAidynApplicationForm()
  const base = submitApplication(form)
  return {
    ...base,
    id: BUILTIN_AIDYN_ID,
    submittedAt: new Date('2026-04-05T12:00:00.000Z').toISOString(),
  }
}

/**
 * Refresh built-in record from code while preserving committee edits from storage.
 */
export function mergeBuiltinAidyn(
  stored: SubmittedApplication[]
): SubmittedApplication[] {
  const fresh = getBuiltinAidynApplication()
  const rest = stored.filter((a) => a.id !== BUILTIN_AIDYN_ID)
  const prev = stored.find((a) => a.id === BUILTIN_AIDYN_ID)
  const merged = prev
    ? {
        ...fresh,
        committeeNote: prev.committeeNote,
        committeeShortlisted: prev.committeeShortlisted,
      }
    : fresh
  return [merged, ...rest]
}
