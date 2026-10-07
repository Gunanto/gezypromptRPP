import { describe, expect, test } from 'bun:test'
import type { DocumentType, PromptInput } from '@promptrpp/contracts'
import { composePrompt } from './index'

const baseInput: PromptInput = {
  documentType: 'rpp',
  outputLevel: 'sangat-rinci',
  curriculum: 'Kurikulum Merdeka',
  subject: 'Matematika',
  level: 'SMP/MTs',
  phase: 'D',
  classroom: '8',
  semester: '1',
  topic: 'Persamaan Linear Satu Variabel',
  locale: 'Kabupaten Sleman',
  meetings: 7,
  jpPerMeeting: 2,
  minutesPerJp: 40,
  cp: 'Peserta didik memahami persamaan linear.',
  tp: 'Peserta didik dapat menyelesaikan PLSV.',
  initialCompetence: 'Operasi bilangan dan bentuk aljabar.',
  studentCharacteristics: '32 siswa dengan kesiapan beragam.',
  dimensions: ['Penalaran Kritis', 'Kolaborasi'],
  pedagogicalPractice: 'Inkuiri terbimbing',
  localContext: 'Harga barang di pasar lokal.',
  partnership: 'Tidak ada',
  learningEnvironment: 'Kelas berkelompok yang aman untuk bertanya.',
  digitalUse: 'Proyektor bila tersedia.',
  crossDiscipline: 'Bahasa Indonesia',
  resources: 'LKPD dan kartu soal.',
  assessmentFocus: 'Formatif',
  assessmentProduct: 'Penyelesaian masalah',
  mediaFormat: 'Slide interaktif',
  preferences: {
    assumeMissing: true,
    differentiation: true,
    literacyNumeracy: true,
    socialEmotional: true,
    diagnostic: true,
    formative: true,
    asLearning: true,
    summative: true,
    stagedOutput: true,
  },
}

describe('composePrompt', () => {
  test('menghitung waktu dan menghasilkan langkah sangat rinci', () => {
    const result = composePrompt(baseInput)
    expect(result.prompt).toContain('2 JP × 40 menit = 80 menit')
    expect(result.prompt).toContain('14 JP / 560 menit')
    expect(result.prompt).toContain('LANGKAH PEMBELAJARAN SANGAT RINCI')
    expect(result.prompt).toContain('**Pengalaman belajar:**')
  })

  test('menghasilkan kontrak untuk delapan jenis dokumen', () => {
    const types: DocumentType[] = [
      'rpp',
      'modul',
      'mendalam',
      'lkpd',
      'asesmen',
      'rubrik',
      'media',
      'paket',
    ]
    for (const documentType of types) {
      const result = composePrompt({ ...baseInput, documentType })
      expect(result.prompt).toContain('FOKUS DOKUMEN')
      expect(result.prompt.length).toBeGreaterThan(1500)
    }
  })

  test('menandai asumsi dan warning ketika input pendukung kosong', () => {
    const result = composePrompt({
      ...baseInput,
      cp: '',
      tp: '',
      studentCharacteristics: '',
      locale: '',
    })
    expect(result.validation.assumptions.length).toBeGreaterThan(0)
    expect(result.validation.warnings).toContain('CP dan TP belum diisi; hasil perlu diverifikasi guru.')
    expect(result.prompt).toContain('[ASUMSI]')
  })
})
