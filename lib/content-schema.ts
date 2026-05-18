import { z } from 'zod'

export const PersonalSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  tagline: z.string().max(240).optional().default(''),
  bio: z.string().max(2000).optional().default(''),
  location: z.string().max(120),
  email: z.string().email(),
  linkedin: z.string().url().or(z.literal('')),
  github: z.string().url().or(z.literal('')).optional().default(''),
  currentCompany: z.string().max(160).optional().default(''),
  image: z.string().max(500).optional().default(''),
})

export const StatSchema = z.object({
  id: z.string(),
  value: z.coerce.number(),
  suffix: z.string().max(8).default(''),
  label: z.string().min(1).max(80),
})

export const CareerSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(160),
  short: z.string().max(40).optional().default(''),
  role: z.string().min(1).max(160),
  period: z.string().min(1).max(80),
  location: z.string().max(120).optional().default(''),
  focus: z.string().max(200).optional().default(''),
  color: z.string().max(20).optional().default('#00ff87'),
  achievements: z.array(z.string().min(1).max(500)),
  tools: z.array(z.string().min(1).max(80)),
})

export const TimelineCategoryEnum = z.enum([
  'life', 'education', 'career', 'milestone', 'personal', 'current',
])

export const TimelineSchema = z.object({
  id: z.string(),
  year: z.string().min(1).max(20),
  title: z.string().min(1).max(160),
  description: z.string().max(800),
  category: TimelineCategoryEnum,
  pinned: z.boolean().default(false),
})

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(160),
  description: z.string().max(1200),
  tech: z.array(z.string().min(1).max(60)),
  image: z.string().max(500).optional().default(''),
  url: z.string().url().or(z.literal('')).optional().default(''),
  repo: z.string().url().or(z.literal('')).optional().default(''),
  featured: z.boolean().default(false),
})

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  proficiency: z.number().int().min(1).max(5),
})

export const SkillCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().default(''),
  color: z.string().max(20).optional().default('#00ff87'),
  skills: z.array(SkillSchema),
})

export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string().min(1).max(200),
  institution: z.string().min(1).max(200),
  period: z.string().min(1).max(80),
  location: z.string().max(120).optional().default(''),
  grade: z.string().max(80).optional().default(''),
})

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  year: z.string().min(1).max(20),
})

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().max(60),
  completed: z.boolean().default(false),
})

export const AchievementItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(300),
  completed: z.boolean().default(false),
})

export const JourneyImageSchema = z.object({
  id: z.string(),
  url: z.string().min(1).max(500),
  caption: z.string().max(200).optional().default(''),
})

export const JourneyEntrySchema = z.object({
  id: z.string(),
  place: z.string().min(1).max(160),
  country: z.string().min(1).max(120),
  region: z.string().max(80).optional().default(''),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  startDate: z.string().min(1).max(20),
  endDate: z.string().max(20).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  images: z.array(JourneyImageSchema).default([]),
  // Optional origin — when present, the globe draws an arc from here to the destination.
  fromPlace: z.string().max(160).optional().default(''),
  fromCountry: z.string().max(120).optional().default(''),
  fromLat: z.number().min(-90).max(90).optional(),
  fromLng: z.number().min(-180).max(180).optional(),
})

export const AchievementGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().default(''),
  color: z.string().max(20).optional().default('#00ff87'),
  items: z.array(AchievementItemSchema),
})

export const GlobeTextureEnum = z.enum(['night', 'day', 'blue-marble', 'dark'])

export const GlobeSettingsSchema = z.object({
  globeTexture: GlobeTextureEnum.default('night'),
  pinColor: z.string().max(20).default('#00d4aa'),
  pinSelectedColor: z.string().max(20).default('#00ff87'),
  atmosphereColor: z.string().max(20).default('#00ff87'),
  strokeColor: z.string().max(20).default('#00ff87'),
  arcColor: z.string().max(20).default('#00ff87'),
})

const ContentSectionSchema = z.object({
  personal: PersonalSchema,
  stats: z.array(StatSchema),
  career: z.array(CareerSchema),
  timeline: z.array(TimelineSchema),
  projects: z.array(ProjectSchema),
  skillCategories: z.array(SkillCategorySchema),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema),
  languages: z.array(LanguageSchema),
  achievements: z.array(AchievementGroupSchema),
  journey: z.array(JourneyEntrySchema).default([]),
  globeSettings: GlobeSettingsSchema.default({}),
})

export const ContentSchema = z.object({
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
  published: ContentSectionSchema,
  draft: ContentSectionSchema.optional(),
})

export type Personal = z.infer<typeof PersonalSchema>
export type Stat = z.infer<typeof StatSchema>
export type Career = z.infer<typeof CareerSchema>
export type Timeline = z.infer<typeof TimelineSchema>
export type TimelineCategoryType = z.infer<typeof TimelineCategoryEnum>
export type Project = z.infer<typeof ProjectSchema>
export type Skill = z.infer<typeof SkillSchema>
export type SkillCategory = z.infer<typeof SkillCategorySchema>
export type EducationItem = z.infer<typeof EducationSchema>
export type Certification = z.infer<typeof CertificationSchema>
export type Language = z.infer<typeof LanguageSchema>
export type AchievementItem = z.infer<typeof AchievementItemSchema>
export type AchievementGroup = z.infer<typeof AchievementGroupSchema>
export type JourneyImage = z.infer<typeof JourneyImageSchema>
export type JourneyEntry = z.infer<typeof JourneyEntrySchema>
export type GlobeSettings = z.infer<typeof GlobeSettingsSchema>
export type GlobeTexture = z.infer<typeof GlobeTextureEnum>
export type ContentDoc = z.infer<typeof ContentSchema>
export type ContentSnapshot = ContentDoc['published']

export type SectionKey =
  | 'personal'
  | 'stats'
  | 'career'
  | 'timeline'
  | 'projects'
  | 'skillCategories'
  | 'education'
  | 'certifications'
  | 'languages'
  | 'achievements'
  | 'journey'
  | 'globeSettings'

export const SECTION_KEYS: SectionKey[] = [
  'personal',
  'stats',
  'career',
  'timeline',
  'projects',
  'skillCategories',
  'education',
  'certifications',
  'languages',
  'achievements',
  'journey',
  'globeSettings',
]
