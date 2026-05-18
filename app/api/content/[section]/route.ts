import { NextRequest } from 'next/server'
import { z } from 'zod'
import { updateContent } from '@/lib/storage'
import {
  SECTION_KEYS,
  type SectionKey,
  PersonalSchema,
  StatSchema,
  CareerSchema,
  TimelineSchema,
  ProjectSchema,
  SkillCategorySchema,
  EducationSchema,
  CertificationSchema,
  LanguageSchema,
  AchievementGroupSchema,
  JourneyEntrySchema,
  GlobeSettingsSchema,
} from '@/lib/content-schema'
import { badRequest, handleZod, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

const SectionParam = z.enum(SECTION_KEYS as [SectionKey, ...SectionKey[]])

const ModeParam = z.enum(['draft', 'publish']).default('publish')

const schemaFor: Record<SectionKey, z.ZodTypeAny> = {
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
  journey: z.array(JourneyEntrySchema),
  globeSettings: GlobeSettingsSchema,
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ section: string }> },
) {
  try {
    const { section: rawSection } = await ctx.params
    const section = SectionParam.parse(rawSection)
    const url = new URL(req.url)
    const mode = ModeParam.parse(url.searchParams.get('mode') ?? 'publish')
    const body = await req.json().catch(() => null)
    if (body === null) return badRequest('invalid_json')

    const validated = schemaFor[section].parse(body)
    const doc = await updateContent(snap => ({ ...snap, [section]: validated }), mode)
    return ok({ ok: true, version: doc.version, updatedAt: doc.updatedAt })
  } catch (err) {
    const z = handleZod(err)
    if (z) return z
    return serverError()
  }
}
