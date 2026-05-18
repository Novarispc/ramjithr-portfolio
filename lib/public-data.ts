import 'server-only'
import { getPublicContent } from './storage'
import type {
  ContentSnapshot, AchievementGroup, Language, Timeline, JourneyEntry, GlobeSettings,
} from './content-schema'
import {
  IMPACT_METRICS,
  PERSONAL_INTERESTS,
  ROTATING_CHIPS,
  FUN_FACTS,
} from './static-data'

export interface PageData {
  personal: ContentSnapshot['personal']
  stats: ContentSnapshot['stats']
  career: ContentSnapshot['career']
  timeline: Timeline[]
  projects: ContentSnapshot['projects']
  skillCategories: ContentSnapshot['skillCategories']
  education: ContentSnapshot['education']
  certifications: ContentSnapshot['certifications']
  languages: Language[]
  achievements: AchievementGroup[]
  journey: JourneyEntry[]
  globeSettings: GlobeSettings
  // static (not yet admin-managed)
  rotatingChips: string[]
  impactMetrics: typeof IMPACT_METRICS
  interests: typeof PERSONAL_INTERESTS
  funFacts: string[]
}

export async function getPageData(): Promise<PageData> {
  const snap = await getPublicContent()
  return {
    personal: snap.personal,
    stats: snap.stats,
    career: snap.career,
    timeline: snap.timeline,
    projects: snap.projects,
    skillCategories: snap.skillCategories,
    education: snap.education,
    certifications: snap.certifications,
    languages: snap.languages,
    achievements: snap.achievements,
    journey: snap.journey ?? [],
    globeSettings: snap.globeSettings,
    rotatingChips: ROTATING_CHIPS,
    impactMetrics: IMPACT_METRICS,
    interests: PERSONAL_INTERESTS,
    funFacts: FUN_FACTS,
  }
}
