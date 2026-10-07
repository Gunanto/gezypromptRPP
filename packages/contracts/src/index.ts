import { z } from 'zod'

export const DOCUMENT_TYPES = [
  'rpp',
  'modul',
  'mendalam',
  'lkpd',
  'asesmen',
  'rubrik',
  'media',
  'paket',
] as const

export const OUTPUT_LEVELS = ['ringkas', 'rinci', 'sangat-rinci'] as const

export const documentTypeSchema = z.enum(DOCUMENT_TYPES)
export const outputLevelSchema = z.enum(OUTPUT_LEVELS)

export const promptPreferencesSchema = z.object({
  assumeMissing: z.boolean().default(true),
  differentiation: z.boolean().default(true),
  literacyNumeracy: z.boolean().default(true),
  socialEmotional: z.boolean().default(true),
  diagnostic: z.boolean().default(true),
  formative: z.boolean().default(true),
  asLearning: z.boolean().default(true),
  summative: z.boolean().default(false),
  stagedOutput: z.boolean().default(true),
})

export const promptInputSchema = z
  .object({
    documentType: documentTypeSchema,
    outputLevel: outputLevelSchema,
    curriculum: z.string().trim().min(1, 'Kurikulum wajib diisi.'),
    subject: z.string().trim().min(1, 'Mata pelajaran wajib diisi.'),
    level: z.string().trim().min(1, 'Jenjang wajib diisi.'),
    phase: z.string().trim().default(''),
    classroom: z.string().trim().min(1, 'Kelas wajib diisi.'),
    semester: z.string().trim().default(''),
    topic: z.string().trim().min(1, 'Materi pokok wajib diisi.'),
    locale: z.string().trim().default(''),
    meetings: z.number().int().positive('Jumlah pertemuan harus lebih dari nol.'),
    jpPerMeeting: z.number().int().positive('JP per pertemuan harus lebih dari nol.'),
    minutesPerJp: z.number().int().positive('Menit per JP harus lebih dari nol.'),
    cp: z.string().trim().default(''),
    tp: z.string().trim().default(''),
    initialCompetence: z.string().trim().default(''),
    studentCharacteristics: z.string().trim().default(''),
    dimensions: z.array(z.string().trim().min(1)).max(3, 'Pilih maksimal tiga dimensi.').default([]),
    pedagogicalPractice: z.string().trim().default(''),
    localContext: z.string().trim().default(''),
    partnership: z.string().trim().default(''),
    learningEnvironment: z.string().trim().default(''),
    digitalUse: z.string().trim().default(''),
    crossDiscipline: z.string().trim().default(''),
    resources: z.string().trim().default(''),
    assessmentFocus: z.string().trim().default(''),
    assessmentProduct: z.string().trim().default(''),
    mediaFormat: z.string().trim().default(''),
    preferences: promptPreferencesSchema,
  })
  .superRefine((input, context) => {
    if (input.documentType === 'mendalam' && input.dimensions.length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['dimensions'],
        message: 'Rencana Pembelajaran Mendalam memerlukan dua atau tiga Dimensi Profil Lulusan.',
      })
    }
  })

export type DocumentType = z.infer<typeof documentTypeSchema>
export type OutputLevel = z.infer<typeof outputLevelSchema>
export type PromptPreferences = z.infer<typeof promptPreferencesSchema>
export type PromptInput = z.infer<typeof promptInputSchema>

export type PromptValidation = {
  warnings: string[]
  assumptions: string[]
}

export type ComposePromptResult = {
  prompt: string
  engineVersion: string
  validation: PromptValidation
}

export type ProjectSummary = {
  id: string
  title: string
  documentType: DocumentType
  subject: string
  level: string
  classroom: string
  topic: string
  isFavorite: boolean
  updatedAt: string
}

export type PromptRevision = {
  id: string
  revisionNumber: number
  changeSource: 'generated' | 'manual-edit' | 'restored'
  createdAt: string
}

export type PromptDocument = {
  id: string
  projectId: string
  sourceGenerationId: string | null
  title: string
  documentType: DocumentType
  contentMarkdown: string
  currentRevision: number
  createdAt: string
  updatedAt: string
}
