import type {
  ComposePromptResult,
  DocumentType,
  OutputLevel,
  PromptInput,
} from '@promptrpp/contracts'

export const PROMPT_ENGINE_VERSION = '1.0.0'

const documentLabels: Record<DocumentType, string> = {
  rpp: 'RPP',
  modul: 'Modul Ajar',
  mendalam: 'Rencana Pembelajaran berbasis Pembelajaran Mendalam',
  lkpd: 'LKPD',
  asesmen: 'Asesmen',
  rubrik: 'Rubrik Penilaian',
  media: 'Media Pembelajaran',
  paket: 'Paket Perangkat Ajar Lengkap',
}

const outputLabels: Record<OutputLevel, string> = {
  ringkas: 'Ringkas',
  rinci: 'Rinci',
  'sangat-rinci': 'Skenario Mengajar Sangat Rinci',
}

const planningTypes = new Set<DocumentType>(['rpp', 'modul', 'mendalam', 'paket'])

type Context = {
  input: PromptInput
  assumptions: string[]
  warnings: string[]
}

function assumed(context: Context, value: string, replacement: string): string {
  if (value.trim()) return value.trim()
  if (!context.input.preferences.assumeMissing) {
    context.warnings.push(replacement)
    return '[BELUM DIISI]'
  }
  const result = `[ASUMSI] ${replacement}`
  context.assumptions.push(result)
  return result
}

function enabled(value: boolean, yes: string, no = 'Tidak diaktifkan.'): string {
  return value ? yes : no
}

function deepLearningBlocks(): string {
  return `SISTEM BLOK PEMBELAJARAN MENDALAM
Jangan memakai singkatan M, A, R, Bks, Bmk, atau Mgb.
Pada setiap langkah kegiatan, gunakan istilah lengkap dengan format Markdown:
> 🟦 **Pengalaman belajar:** Memahami
> 🟩 **Prinsip pembelajaran:** Bermakna · 🟨 Menggembirakan

Penanda yang dapat dipilih:
- Pengalaman belajar: 🟦 Memahami, 🟧 Mengaplikasi, atau 🟪 Merefleksi.
- Prinsip pembelajaran: 🔷 Berkesadaran, 🟩 Bermakna, atau 🟨 Menggembirakan.

Gunakan blok hanya ketika tindakan pada aktivitas benar-benar mendukung istilah tersebut. Selalu tulis istilah lengkap; warna bukan satu-satunya penanda.`
}

function sharedQualityRules(context: Context): string {
  const { input } = context
  const locale = assumed(
    context,
    input.locale,
    'Gunakan konteks kehidupan sehari-hari peserta didik yang wajar.',
  )
  return `ATURAN KUALITAS
1. Gunakan bahasa Indonesia baku yang mudah dipahami guru dan sesuai usia peserta didik.
2. Hindari aktivitas generik. Jangan berhenti pada “guru menjelaskan”, “siswa berdiskusi”, atau “siswa mengerjakan LKPD”. Tuliskan topik, pertanyaan, langkah kerja, hasil, dan bukti belajar.
3. Gunakan contoh yang dekat dengan kehidupan peserta didik di ${locale}.
4. Jangan mengarang kutipan regulasi, nomor dokumen, data, atau rumusan CP resmi. Jika tidak yakin, tulis “perlu diverifikasi”.
5. Pilih hanya dua atau tiga Dimensi Profil Lulusan yang benar-benar dikembangkan dan dapat diamati.
6. Jangan memaksakan doa, kegiatan keagamaan, teknologi, kemitraan, atau lintas disiplin bila tidak relevan.
7. Pastikan tujuan, aktivitas, bukti belajar, dan asesmen saling terhubung.
8. Sebelum menjawab, periksa diam-diam konsistensi isi dan ketepatan jumlah waktu.`
}

function detailedSteps(context: Context): string {
  const { input } = context
  const perMeeting = input.jpPerMeeting * input.minutesPerJp

  if (input.outputLevel === 'ringkas') {
    return `LANGKAH PEMBELAJARAN RINGKAS
Sajikan tabel setiap pertemuan dengan kolom:
Tahap | Aktivitas Guru | Aktivitas Siswa | Waktu | Bukti Belajar/Asesmen.

Pertanyaan atau instruksi inti harus konkret. Total waktu setiap pertemuan harus tepat ${perMeeting} menit.`
  }

  const label = input.outputLevel === 'sangat-rinci' ? 'SANGAT RINCI' : 'RINCI'
  const practice = assumed(
    context,
    input.pedagogicalPractice,
    'Pilih praktik pedagogis yang paling sesuai dengan materi.',
  )

  return `LANGKAH PEMBELAJARAN ${label}
Jangan sajikan langkah utama dalam tabel ringkas. Tulis sebagai urutan aktivitas bernomor dan operasional yang dapat langsung dipakai guru.

Gunakan struktur berikut untuk setiap pertemuan:

## Pertemuan [NOMOR]: [Fokus materi]
**Alokasi:** ${input.jpPerMeeting} JP × ${input.minutesPerJp} menit = ${perMeeting} menit
**Praktik pedagogis:** ${practice}

### A. Kegiatan Pendahuluan ([jumlah menit])

1. **[Nama aktivitas spesifik] ([menit] menit)**
   > [emoji] **Pengalaman belajar:** [Memahami/Mengaplikasi/Merefleksi]
   > [emoji] **Prinsip pembelajaran:** [Berkesadaran/Bermakna/Menggembirakan; pilih yang terbukti]
   - **Guru:** [tindakan konkret, instruksi, pertanyaan, atau media].
   - **Siswa:** [tindakan konkret dan hasil yang diharapkan].
   - **Bukti belajar:** [produk, respons, catatan, atau performa bila ada].

### B. Kegiatan Inti ([jumlah menit])

Bagi kegiatan inti menjadi tahap yang sesuai dengan praktik pedagogis. Lanjutkan nomor aktivitas secara berurutan. Ulangi blok pengalaman belajar dan prinsip pembelajaran pada setiap aktivitas.

### C. Kegiatan Penutup ([jumlah menit])

Sertakan tiket keluar atau unjuk kerja singkat, refleksi terstruktur, penguatan, serta tindak lanjut yang relevan.

**Rekap waktu:** pendahuluan [...] + inti [...] + penutup [...] = ${perMeeting} menit.

ATURAN MUTU LANGKAH
1. Setiap aktivitas harus dapat diamati dan mempunyai tujuan yang jelas.
2. Tuliskan pertanyaan, contoh masalah, data, soal, atau kasus secara konkret.
3. Jika diferensiasi aktif, tuliskan siapa yang mendapat dukungan, bentuk dukungan, dan tantangan untuk peserta didik yang siap melanjutkan.
4. Bukti belajar harus menunjukkan ketercapaian tujuan, bukan sekadar kehadiran atau penyelesaian tugas.
5. Jumlah seluruh durasi harus tepat ${perMeeting} menit.`
}

function planningOutput(context: Context): string {
  return `FORMAT OUTPUT WAJIB
Gunakan Markdown.

1. Identitas Pembelajaran
2. Capaian dan Tujuan Pembelajaran
3. Matriks Keterkaitan Pembelajaran
   - Tabel: Tujuan Pembelajaran | Aktivitas Kunci | Bukti Belajar | Asesmen | Dimensi Profil Lulusan.
4. Kompetensi Awal
5. Sarana, Media, dan Sumber Belajar
6. Praktik Pedagogis, Kemitraan, Lingkungan, dan Pemanfaatan Digital
7. Pemahaman Bermakna
8. Pertanyaan Pemantik
9. Peta Alur Antarpertemuan dan Langkah Pembelajaran
10. Diferensiasi Pembelajaran
11. Asesmen
12. Remedial dan Pengayaan
13. Refleksi Guru dan Peserta Didik
14. Lampiran yang relevan
15. Daftar Asumsi dan Hal yang Perlu Diverifikasi

${detailedSteps(context)}`
}

function typeContract(context: Context): string {
  const { input } = context
  switch (input.documentType) {
    case 'rpp':
      return `FOKUS DOKUMEN — RPP
Susun RPP yang operasional dan proporsional. Utamakan urutan kegiatan, alokasi waktu, bukti belajar, asesmen, dan tindak lanjut.`
    case 'modul':
      return `FOKUS DOKUMEN — MODUL AJAR
Selain rencana pembelajaran, sertakan bahan ajar ringkas, LKPD yang selaras, asesmen, rubrik bila diperlukan, remedial, dan pengayaan.`
    case 'mendalam':
      return `FOKUS DOKUMEN — RENCANA PEMBELAJARAN BERBASIS PEMBELAJARAN MENDALAM
Tunjukkan hubungan nyata antara aktivitas, Dimensi Profil Lulusan, pengalaman belajar, prinsip pembelajaran, dan bukti belajar. Jangan menggunakan istilah Pembelajaran Mendalam secara kosmetik.`
    case 'lkpd':
      return `FOKUS DOKUMEN — LKPD
Buat LKPD yang dapat langsung diberikan kepada peserta didik.

FORMAT OUTPUT
1. Identitas dan tujuan LKPD.
2. Pemahaman bermakna serta pertanyaan pemantik singkat.
3. Alat, bahan, atau sumber.
4. Petunjuk kerja bernomor.
5. Aktivitas konkret, data/kasus, dan ruang atau format jawaban.
6. Dukungan dan tantangan diferensiasi bila aktif.
7. Refleksi peserta didik.
8. Kunci atau pedoman jawaban dan rubrik singkat untuk guru.

LKPD harus mengarahkan peserta didik memahami, mengaplikasi, lalu merefleksi; jangan hanya berisi soal hafalan.`
    case 'asesmen':
      return `FOKUS DOKUMEN — ASESMEN
Fokus asesmen: ${assumed(context, input.assessmentFocus, 'Pilih jenis asesmen yang sesuai tujuan.')}
Produk/kinerja: ${assumed(context, input.assessmentProduct, 'Tentukan bukti kinerja atau produk yang relevan.')}

FORMAT OUTPUT
1. Tujuan dan indikator yang diukur.
2. Kisi-kisi: tujuan | materi/keterampilan | indikator | bentuk instrumen | nomor.
3. Instrumen lengkap dengan stimulus konkret.
4. Kunci jawaban atau pedoman penskoran.
5. Rubrik untuk kinerja/produk.
6. Interpretasi hasil dan tindak lanjut.

Bedakan fungsi diagnostik, formatif, as learning, dan sumatif. Jangan memaksakan semuanya bila tidak relevan.`
    case 'rubrik':
      return `FOKUS DOKUMEN — RUBRIK PENILAIAN
Produk/kinerja: ${assumed(context, input.assessmentProduct, 'Tentukan produk atau kinerja yang dinilai.')}

FORMAT OUTPUT
1. Tujuan penilaian dan bukti.
2. Kriteria yang terhubung dengan tujuan dan dimensi yang dipilih.
3. Rubrik analitik dengan 3–4 tingkat kinerja, deskriptor teramati, dan skor.
4. Cara menghitung dan menginterpretasikan skor.
5. Contoh umpan balik.

Hindari kriteria kabur seperti “bagus” atau “aktif”.`
    case 'media':
      return `FOKUS DOKUMEN — MEDIA PEMBELAJARAN
Jenis media: ${assumed(context, input.mediaFormat, 'Pilih media yang paling sesuai dan dapat diakses peserta didik.')}

FORMAT OUTPUT
1. Tujuan media dan pengguna.
2. Konsep serta alur pengalaman belajar.
3. Struktur halaman, slide, atau segmen bernomor.
4. Teks singkat, visual, interaksi, instruksi, dan umpan balik setiap bagian.
5. Desain aksesibel dan alternatif bila teknologi terbatas.
6. Cara guru menggunakan media sebelum, saat, dan setelah pembelajaran.
7. Bukti belajar dari penggunaan media.

Media harus mendorong aktivitas peserta didik, bukan presentasi pasif.`
    case 'paket':
      return `FOKUS DOKUMEN — PAKET PERANGKAT AJAR LENGKAP
Susun paket yang saling terhubung: rencana pembelajaran, LKPD, asesmen, rubrik, bahan ajar atau media ringkas, remedial, dan pengayaan. Jangan menduplikasi isi tanpa fungsi.`
  }
}

function stagedOutput(context: Context): string {
  const { input } = context
  if (!input.preferences.stagedOutput || !planningTypes.has(input.documentType)) return ''

  return `CARA KELUARAN BERTAHAP — WAJIB
Dokumen mencakup ${input.meetings} pertemuan. Jangan membuat seluruh skenario rinci sekaligus.

Tahap 1:
1. Buat bagian identitas sampai pertanyaan pemantik.
2. Buat peta alur seluruh ${input.meetings} pertemuan.
3. Buat langkah rinci hanya untuk Pertemuan 1.
4. Berhenti dan tanyakan: “Apakah saya lanjutkan ke Pertemuan 2?”

Tahap lanjutan:
1. Ketika pengguna menjawab lanjut, buat hanya satu pertemuan berikutnya.
2. Setelah semua pertemuan selesai, tawarkan asesmen, rubrik, remedial, pengayaan, refleksi, dan lampiran.
3. Buat bagian lanjutan hanya setelah pengguna menyatakan lanjut.`
}

export function composePrompt(rawInput: PromptInput): ComposePromptResult {
  const context: Context = {
    input: rawInput,
    assumptions: [],
    warnings: [],
  }
  const input = context.input
  const perMeeting = input.jpPerMeeting * input.minutesPerJp
  const totalJp = input.meetings * input.jpPerMeeting
  const totalMinutes = input.meetings * perMeeting
  const label = documentLabels[input.documentType]

  const phase = assumed(context, input.phase, 'Tentukan fase yang sesuai dengan jenjang dan kelas.')
  const locale = assumed(
    context,
    input.locale,
    'Gunakan konteks kehidupan sehari-hari peserta didik.',
  )
  const cp = assumed(context, input.cp, 'Gunakan CP yang sesuai tanpa mengarang rumusan resmi.')
  const tp = assumed(context, input.tp, 'Rumuskan dua atau tiga tujuan pembelajaran yang terukur.')
  const initialCompetence = assumed(
    context,
    input.initialCompetence,
    'Tentukan kompetensi awal yang wajar untuk materi.',
  )
  const students = assumed(
    context,
    input.studentCharacteristics,
    `Peserta didik ${input.level} kelas ${input.classroom} dengan kesiapan belajar beragam.`,
  )
  const dimensions =
    input.dimensions.length > 0
      ? input.dimensions.join('; ')
      : assumed(context, '', 'Pilih dua atau tiga Dimensi Profil Lulusan yang paling relevan.')
  const practice = assumed(
    context,
    input.pedagogicalPractice,
    'Pilih praktik pedagogis yang paling sesuai.',
  )
  const localContext = assumed(
    context,
    input.localContext,
    'Gunakan masalah atau pengalaman yang dekat dengan kehidupan peserta didik.',
  )
  const partnership = assumed(context, input.partnership, 'Tidak ada kemitraan khusus.')
  const environment = assumed(
    context,
    input.learningEnvironment,
    'Kelas yang aman untuk bertanya, berpendapat, dan mencoba.',
  )
  const digital = assumed(context, input.digitalUse, 'Tidak menggunakan alat digital khusus.')
  const crossDiscipline = assumed(context, input.crossDiscipline, 'Tidak ada lintas disiplin khusus.')
  const resources = assumed(
    context,
    input.resources,
    'Gunakan media sederhana dan sumber yang tersedia di sekolah.',
  )

  if (!input.cp && !input.tp) {
    context.warnings.push('CP dan TP belum diisi; hasil perlu diverifikasi guru.')
  }
  if (!input.studentCharacteristics) {
    context.warnings.push('Karakteristik peserta didik belum diisi.')
  }
  if (input.dimensions.length === 1) {
    context.warnings.push('Pilih dua atau tiga Dimensi Profil Lulusan agar rancangan lebih seimbang.')
  }

  const prompt = `# PROMPTRPP — ${label.toUpperCase()}

PERAN
Anda adalah perancang pembelajaran berpengalaman untuk jenjang ${input.level} di Indonesia.
Gunakan kerangka Pembelajaran Mendalam, Panduan Pembelajaran dan Asesmen edisi revisi 2025, panduan mata pelajaran yang relevan, serta standar proses sebagai acuan konseptual.
Jadikan CP dan TP pengguna sebagai sumber utama. Jangan mengklaim dokumen telah sesuai regulasi secara resmi.

KONTEKS PEMBELAJARAN
- Jenis dokumen: ${label}
- Kurikulum: ${input.curriculum}
- Mata pelajaran: ${input.subject}
- Jenjang / Fase / Kelas / Semester: ${input.level} / ${phase} / ${input.classroom} / ${input.semester || '[BELUM DIISI]'}
- Materi pokok: ${input.topic}
- Jumlah pertemuan: ${input.meetings}
- Alokasi setiap pertemuan: ${input.jpPerMeeting} JP × ${input.minutesPerJp} menit = ${perMeeting} menit
- Total alokasi: ${totalJp} JP / ${totalMinutes} menit
- Daerah/lingkungan: ${locale}

CAPAIAN PEMBELAJARAN
${cp}

TUJUAN PEMBELAJARAN
${tp}

KOMPETENSI AWAL
${initialCompetence}

KARAKTERISTIK PESERTA DIDIK
${students}

KERANGKA PEMBELAJARAN MENDALAM
- Dimensi Profil Lulusan: ${dimensions}
- Prinsip: berkesadaran, bermakna, menggembirakan
- Pengalaman belajar: memahami, mengaplikasi, merefleksi
- Praktik pedagogis: ${practice}
- Isu atau konteks lokal: ${localContext}
- Kemitraan: ${partnership}
- Lingkungan pembelajaran: ${environment}
- Pemanfaatan digital: ${digital}
- Lintas disiplin: ${crossDiscipline}
- Media dan sumber belajar: ${resources}

PREFERENSI
- Diferensiasi: ${enabled(input.preferences.differentiation, 'Aktif; masukkan dukungan dan tantangan secara spesifik.')}
- Literasi dan numerasi: ${enabled(input.preferences.literacyNumeracy, 'Integrasikan secara alami jika relevan.')}
- Sosial-emosional dan kebiasaan baik: ${enabled(input.preferences.socialEmotional, 'Integrasikan melalui tindakan nyata jika relevan.')}
- Asesmen diagnostik: ${enabled(input.preferences.diagnostic, 'Aktif')}
- Asesmen formatif (for learning): ${enabled(input.preferences.formative, 'Aktif')}
- Asesmen sebagai pembelajaran (as learning): ${enabled(input.preferences.asLearning, 'Aktif')}
- Asesmen sumatif (of learning): ${enabled(input.preferences.summative, 'Aktif')}
- Tingkat keluaran: ${outputLabels[input.outputLevel]}

TUGAS
Susun ${label} yang realistis, kontekstual, dan siap disunting guru berdasarkan data di atas.

${sharedQualityRules(context)}

${deepLearningBlocks()}

${typeContract(context)}

${planningTypes.has(input.documentType) ? planningOutput(context) : ''}

${stagedOutput(context)}`
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return {
    prompt,
    engineVersion: PROMPT_ENGINE_VERSION,
    validation: {
      warnings: [...new Set(context.warnings)],
      assumptions: [...new Set(context.assumptions)],
    },
  }
}

export function documentTypeLabel(type: DocumentType): string {
  return documentLabels[type]
}
