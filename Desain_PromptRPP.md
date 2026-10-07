# Desain PromptRPP

## Tujuan

PromptRPP menghasilkan prompt lintas-AI untuk menyusun RPP, modul ajar, atau rencana pembelajaran berbasis Pembelajaran Mendalam. Hasil yang diprioritaskan adalah langkah pembelajaran yang operasional: guru dapat mengikuti urutan kegiatan, mengetahui tindakan siswa, bukti belajar, dan pembagian waktu pada setiap pertemuan.

Dokumen ini menjadi acuan untuk generator prompt pada aplikasi. Pengguna mengisi form; aplikasi mengganti setiap teks di dalam tanda kurung siku (`[ ... ]`) dengan data pengguna.

## Prinsip desain

1. **Data pengguna adalah sumber utama.** CP, TP, konteks sekolah, dan kebutuhan siswa yang diberikan pengguna tidak boleh ditimpa oleh AI.
2. **Kegiatan harus dapat dilakukan.** Hindari keluaran umum seperti “siswa berdiskusi” atau “guru menjelaskan” tanpa tujuan, instruksi, hasil kerja, dan bukti belajar yang jelas.
3. **Waktu harus tervalidasi.** Jumlah menit setiap kegiatan harus tepat sama dengan alokasi pertemuan.
4. **Pembelajaran Mendalam harus tampak dalam kegiatan.** Istilah lengkap pengalaman belajar dan prinsip pembelajaran ditampilkan dalam blok informasi yang mudah dibaca. Istilah tersebut hanya dipakai ketika ada tindakan nyata yang mendukungnya.
5. **Keluaran dibagi bertahap.** Untuk banyak pertemuan, AI membuat peta keseluruhan lalu rincian satu pertemuan per respons agar kualitas tidak menurun atau terpotong.
6. **Asumsi harus terlihat.** Informasi yang belum diisi dapat diasumsikan secara wajar, tetapi wajib ditandai `[ASUMSI]`.

## Data yang dikumpulkan aplikasi

### Identitas

- Jenis dokumen: `RPP`, `Modul Ajar`, atau `Rencana Pembelajaran berbasis Pembelajaran Mendalam`
- Kurikulum
- Mata pelajaran
- Jenjang, fase, kelas, semester
- Materi pokok
- Jumlah pertemuan
- Alokasi setiap pertemuan, misalnya `2 JP × 40 menit = 80 menit`
- Total alokasi seluruh rangkaian
- Daerah atau lingkungan siswa

### Tujuan dan karakteristik peserta didik

- Capaian Pembelajaran (CP)
- Tujuan Pembelajaran (TP)
- Kompetensi awal
- Karakteristik peserta didik: minat, kesiapan belajar, preferensi belajar, kebutuhan aksesibilitas, kebutuhan khusus, kemampuan literasi/numerasi, bahasa yang dikuasai, dan jumlah siswa

### Kerangka Pembelajaran Mendalam

- Dimensi Profil Lulusan yang dituju — pilih dua atau tiga saja
- Praktik pedagogis: inkuiri, PBL, PjBL, diskusi, demonstrasi, atau lainnya
- Isu atau konteks lokal
- Kemitraan pembelajaran
- Lingkungan pembelajaran: ruang fisik, budaya kelas, dan ruang virtual
- Pemanfaatan digital: alat, batasan, dan etika penggunaannya
- Lintas disiplin
- Media dan sumber belajar

### Preferensi

- Diferensiasi
- Literasi dan numerasi
- Pembelajaran sosial-emosional dan kebiasaan baik
- Asesmen diagnostik
- Asesmen formatif (*for learning*)
- Asesmen sebagai pembelajaran (*as learning*)
- Asesmen sumatif (*of learning*)
- Tingkat keluaran: `Ringkas`, `Rinci`, atau `Skenario Mengajar Sangat Rinci`

## Sistem blok Pembelajaran Mendalam

Jangan memakai singkatan seperti `M`, `A`, `R`, `Bks`, `Bmk`, atau `Mgb` pada keluaran guru. Gunakan istilah lengkap agar dokumen tetap mudah dibaca tanpa legenda.

| Kelompok | Label lengkap | Warna pratinjau aplikasi | Penanda portabel pada Markdown |
|---|---|---|---|
| Pengalaman belajar | Memahami | Biru | 🟦 |
| Pengalaman belajar | Mengaplikasi | Jingga | 🟧 |
| Pengalaman belajar | Merefleksi | Ungu | 🟪 |
| Prinsip pembelajaran | Berkesadaran | Toska | 🔷 |
| Prinsip pembelajaran | Bermakna | Hijau | 🟩 |
| Prinsip pembelajaran | Menggembirakan | Kuning | 🟨 |

Warna tidak boleh menjadi satu-satunya penanda; nama lengkap selalu ditulis. Saat hasil dibuka pada aplikasi PromptRPP, setiap baris dapat dirender sebagai blok atau *badge* berwarna. Saat disalin ke ChatGPT, Claude, DeepSeek, Codex, Muse, atau dokumen Markdown biasa, gunakan emoji warna dan teks lengkap agar format tetap terbaca.

Format portabel yang wajib digunakan AI:

```markdown
> 🟦 **Pengalaman belajar:** Memahami
> 🟩 **Prinsip pembelajaran:** Bermakna · 🟨 Menggembirakan
```

## Prompt master

```text
PERAN
Anda adalah perancang pembelajaran berpengalaman untuk jenjang [JENJANG]
di Indonesia.

Gunakan kerangka Pembelajaran Mendalam, Panduan Pembelajaran dan Asesmen
edisi revisi 2025, panduan mata pelajaran yang relevan, serta standar proses
sebagai acuan konseptual.

Jadikan Capaian Pembelajaran dan Tujuan Pembelajaran yang diberikan pengguna
sebagai sumber utama. Jangan mengklaim suatu dokumen telah sesuai regulasi
secara resmi. Jangan mengarang kutipan, nomor regulasi, atau rumusan CP resmi.

KONTEKS PEMBELAJARAN
Jenis dokumen: [JENIS DOKUMEN]
Kurikulum: [KURIKULUM]
Mata pelajaran: [MAPEL]
Fase / Kelas / Semester: [FASE] / [KELAS] / [SEMESTER]
Materi pokok: [MATERI]
Jumlah pertemuan: [JUMLAH PERTEMUAN]
Alokasi setiap pertemuan: [ALOKASI PER PERTEMUAN]
Total alokasi: [TOTAL ALOKASI]
Daerah/lingkungan siswa: [DAERAH/LINGKUNGAN]

Capaian Pembelajaran:
[CP]

Tujuan Pembelajaran:
[TP]

Kompetensi awal peserta didik:
[KOMPETENSI AWAL]

Karakteristik peserta didik:
[KARAKTERISTIK]

KERANGKA PEMBELAJARAN MENDALAM
- Dimensi Profil Lulusan yang dituju: [DIMENSI PROFIL LULUSAN]
- Prinsip pembelajaran: berkesadaran, bermakna, menggembirakan
- Pengalaman belajar: memahami, mengaplikasi, merefleksi
- Praktik pedagogis: [PRAKTIK PEDAGOGIS]
- Isu atau konteks lokal: [KONTEKS LOKAL]
- Kemitraan pembelajaran: [KEMITRAAN]
- Lingkungan pembelajaran: [LINGKUNGAN]
- Pemanfaatan digital: [DIGITAL]
- Lintas disiplin: [LINTAS DISIPLIN]
- Media dan sumber belajar: [SUMBER]

PREFERENSI
- Diferensiasi: [DIFERENSIASI]
- Literasi dan numerasi: [LITERASI NUMERASI]
- Pembelajaran sosial-emosional dan kebiasaan baik: [PSE]
- Asesmen diagnostik: [DIAGNOSTIK]
- Asesmen formatif (for learning): [FORMATIF]
- Asesmen sebagai pembelajaran (as learning): [AS LEARNING]
- Asesmen sumatif (of learning): [SUMATIF]
- Tingkat keluaran: [TINGKAT KELUARAN]

TUGAS
Susun [JENIS DOKUMEN] yang realistis dan siap disunting guru berdasarkan
konteks di atas.

Pastikan kegiatan pembelajaran:
1. selaras dengan tujuan pembelajaran dan menunjukkan kontribusi nyata pada pemahaman konseptual;
2. berkesadaran: siswa memahami tujuan dan proses belajarnya, serta mendapat kesempatan melakukan regulasi diri dan refleksi;
3. bermakna: terhubung dengan pengalaman siswa, konteks lokal, atau masalah nyata bila relevan;
4. menggembirakan: membangun suasana aman, pilihan yang wajar, tantangan sesuai kesiapan, dan apresiasi;
5. mengalirkan pengalaman memahami, mengaplikasi, dan merefleksi secara eksplisit;
6. mengutamakan pemahaman konseptual serta transfer ke situasi baru, bukan hafalan semata;
7. memiliki pendahuluan, inti, dan penutup yang jelas;
8. menggunakan waktu yang tepat sesuai alokasi;
9. menyebutkan bukti belajar pada setiap tahap penting;
10. memuat diferensiasi konten, proses, dan/atau produk bila diaktifkan;
11. menghubungkan tujuan, aktivitas, bukti belajar, dan asesmen secara konsisten.

ATURAN KUALITAS
- Hindari aktivitas generik seperti “siswa berdiskusi”. Tulis pertanyaan konkret, contoh, langkah kerja, dan produk belajar yang jelas.
- Gunakan contoh yang dekat dengan kehidupan siswa di [DAERAH/LINGKUNGAN].
- Jangan mengarang kutipan regulasi, nomor dokumen, atau data. Jika tidak yakin, tulis “perlu diverifikasi”.
- Jika ada data konteks yang kosong, buat asumsi wajar dan tandai dengan `[ASUMSI]`.
- Gunakan bahasa Indonesia baku yang mudah dipahami guru.
- Pilih hanya dua atau tiga Dimensi Profil Lulusan yang benar-benar dikembangkan dan dapat diamati. Jangan memaksakan semua dimensi dalam satu rangkaian pembelajaran.
- Jangan memaksakan doa, kegiatan keagamaan, teknologi, kemitraan, atau konteks lokal bila pengguna tidak menyediakannya atau hal tersebut tidak relevan.
- Sebelum menjawab, periksa diam-diam bahwa setiap Tujuan Pembelajaran memiliki aktivitas belajar dan bukti asesmen yang sesuai.

FORMAT OUTPUT
Gunakan Markdown.

1. Identitas Pembelajaran
   - Termasuk Dimensi Profil Lulusan, topik/isu kontekstual, dan lintas disiplin.
2. Capaian dan Tujuan Pembelajaran
3. Matriks Keterkaitan Pembelajaran
   - Sajikan tabel: Tujuan Pembelajaran | Aktivitas Kunci | Bukti Belajar | Asesmen | Dimensi Profil Lulusan yang Dikembangkan.
4. Kompetensi Awal
5. Sarana, Media, dan Sumber Belajar
6. Praktik Pedagogis, Kemitraan, Lingkungan, dan Pemanfaatan Digital
7. Pemahaman Bermakna
   - Rumuskan sebagai gagasan besar atau konsep kunci yang dapat ditransfer.
8. Pertanyaan Pemantik
9. Peta Alur Antarpertemuan dan Langkah Pembelajaran Rinci
10. Diferensiasi Pembelajaran
11. Asesmen
12. Remedial dan Pengayaan
13. Refleksi Guru dan Peserta Didik
14. Lampiran jika relevan: LKPD, soal, rubrik, atau bahan ajar ringkas
15. Daftar Asumsi dan Hal yang Perlu Diverifikasi
```

## Kontrak keluaran langkah pembelajaran rinci

Bagian `9. Peta Alur Antarpertemuan dan Langkah Pembelajaran Rinci` dalam prompt master harus diikuti dengan blok berikut.

```text
LANGKAH PEMBELAJARAN RINCI

Jangan sajikan langkah pembelajaran utama dalam tabel ringkas.

Tulis kegiatan sebagai urutan aktivitas bernomor dan operasional, seperti
skenario mengajar yang dapat langsung dipakai guru. Setiap pertemuan harus
memiliki format berikut:

## Pertemuan [NOMOR]: [FOKUS MATERI]
**Alokasi:** [JP × MENIT] = [TOTAL MENIT]
**Praktik pedagogis:** [PRAKTIK PEDAGOGIS]

### A. Kegiatan Pendahuluan ([TOTAL MENIT])

1. **[Nama aktivitas yang spesifik] ([MENIT] menit)**
   > [🟦/🟧/🟪] **Pengalaman belajar:** [Memahami/Mengaplikasi/Merefleksi]
   > [🔷/🟩/🟨] **Prinsip pembelajaran:** [Berkesadaran/Bermakna/Menggembirakan; pilih yang relevan]
   - Guru: [tindakan konkret guru, instruksi, pertanyaan, atau media yang digunakan].
   - Siswa: [tindakan konkret siswa dan hasil yang diharapkan].
   - **Bukti belajar:** [jika ada].

2. Lanjutkan dengan format yang sama.

### B. Kegiatan Inti ([TOTAL MENIT])

Bagi kegiatan inti ke dalam tahap yang jelas sesuai praktik pedagogis.
Contoh: mengamati masalah, menyusun dugaan, menyelidiki, menerapkan konsep,
menganalisis kesalahan, mempresentasikan, atau merefleksi.

#### Tahap 1: [Nama tahap] ([TOTAL MENIT])

3. **[Nama aktivitas yang spesifik] ([MENIT] menit)**
   > [🟦/🟧/🟪] **Pengalaman belajar:** [Memahami/Mengaplikasi/Merefleksi]
   > [🔷/🟩/🟨] **Prinsip pembelajaran:** [Berkesadaran/Bermakna/Menggembirakan; pilih yang relevan]
   - Guru: [...]
   - Siswa: [...]
   - **Bukti belajar:** [...]

4. Lanjutkan penomoran secara berurutan dan ulangi dua blok informasi pada setiap aktivitas.

#### Tahap 2: [Nama tahap] ([TOTAL MENIT])

5. Lanjutkan penomoran secara berurutan.

### C. Kegiatan Penutup ([TOTAL MENIT])

[NOMOR]. **Tiket keluar / unjuk kerja singkat ([MENIT] menit)**
> 🟧 **Pengalaman belajar:** Mengaplikasi
> 🟩 **Prinsip pembelajaran:** Bermakna
- Guru: [...]
- Siswa: [...]
- **Bukti belajar:** [...]

[NOMOR]. **Refleksi terstruktur ([MENIT] menit)**
> 🟪 **Pengalaman belajar:** Merefleksi
> 🟦 **Prinsip pembelajaran:** Berkesadaran
- Guru: [...]
- Siswa menjawab pertanyaan refleksi yang spesifik.
- **Bukti belajar:** [...]

[NOMOR]. **Penguatan dan tindak lanjut ([MENIT] menit)**
- Guru: [...]
- Siswa: [...]

**Rekap waktu:** pendahuluan [...] + inti [...] + penutup [...] = [...] menit.

ATURAN MUTU LANGKAH PEMBELAJARAN

1. Setiap aktivitas harus berupa tindakan yang dapat diamati, bukan label umum.
   Hindari kalimat seperti “siswa berdiskusi”, “guru menjelaskan”, atau
   “siswa mengerjakan LKPD” tanpa menjelaskan topik, pertanyaan, langkah kerja,
   hasil kerja, dan alasan pedagogisnya.
2. Untuk setiap aktivitas inti, jelaskan tindakan guru, tindakan siswa,
   pertanyaan atau instruksi konkret, serta produk atau bukti belajar.
3. Tuliskan pertanyaan pemantik, contoh masalah, data, soal, atau kasus secara
   konkret dan sesuai materi [MATERI] serta konteks [DAERAH/LINGKUNGAN].
4. Gunakan blok `Pengalaman belajar` hanya jika kegiatan benar-benar menunjukkan
   memahami, mengaplikasi, atau merefleksi. Gunakan blok `Prinsip pembelajaran`
   hanya bila ada tindakan nyata yang membuktikan berkesadaran, bermakna, atau
   menggembirakan. Jangan gunakan singkatan.
5. Setiap pertemuan memuat orientasi tujuan belajar, kegiatan memahami konsep,
   penerapan atau pengolahan konsep, bukti belajar formatif, refleksi, dan
   tindak lanjut yang relevan.
6. Jika diferensiasi aktif, masukkan langsung ke langkah kegiatan: siapa yang
   membutuhkan dukungan, bentuk dukungan, dan aktivitas tantangan bagi siswa
   yang siap melanjutkan.
7. Jumlah waktu seluruh aktivitas harus tepat sama dengan alokasi pertemuan.
8. Urutan aktivitas harus bernomor secara berkelanjutan dari pendahuluan,
   inti, hingga penutup.
```

## Strategi keluaran bertahap

Detail kegiatan seperti ini membutuhkan banyak token. Jangan meminta AI menulis seluruh skenario rinci tujuh pertemuan sekaligus.

```text
CARA KELUARAN — WAJIB

Tahap 1:
1. Buat bagian 1 sampai 8 dari format output.
2. Buat peta alur seluruh pertemuan.
3. Buat langkah pembelajaran rinci hanya untuk Pertemuan 1.
4. Berhenti dan tanyakan: “Apakah saya lanjutkan ke Pertemuan 2?”

Tahap lanjutan:
1. Saat pengguna meminta lanjut, buat langkah pembelajaran rinci untuk satu
   pertemuan berikutnya saja.
2. Setelah semua pertemuan selesai, tanyakan apakah pengguna ingin membuat
   asesmen, rubrik, remedial, pengayaan, refleksi, dan lampiran.
3. Buat bagian 10 sampai 15 hanya setelah pengguna menyatakan lanjut.
```

## Validasi yang dilakukan aplikasi

Aplikasi sebaiknya memeriksa hal-hal berikut sebelum prompt disalin.

- Materi pokok wajib diisi.
- Jenjang, kelas, jumlah pertemuan, dan alokasi per pertemuan wajib diisi.
- Total alokasi dihitung otomatis dari jumlah pertemuan dan alokasi per pertemuan.
- Jika jenis dokumen adalah `Rencana Pembelajaran berbasis Pembelajaran Mendalam`, pengguna memilih dua atau tiga Dimensi Profil Lulusan.
- Jika diferensiasi diaktifkan, karakteristik peserta didik wajib diisi minimal satu informasi.
- Jika pemanfaatan digital aktif, alat, batasan, dan etika penggunaan wajib diisi.

## Catatan implementasi antarmuka

- Gunakan keluaran `Skenario Mengajar Sangat Rinci` sebagai pilihan yang menghasilkan kontrak langkah pembelajaran rinci di atas.
- Untuk keluaran `Ringkas`, tampilkan tabel rangkuman kegiatan tanpa menghapus keterkaitan tujuan, aktivitas, bukti belajar, dan asesmen.
- Sediakan tombol `Lanjut Pertemuan Berikutnya` yang membentuk prompt lanjutan berdasarkan konteks dan hasil pertemuan sebelumnya.
- Sediakan tombol `Salin & Buka` untuk ChatGPT, Claude, DeepSeek, Codex, Muse, atau layanan AI lain. Pengguna menempelkan prompt pada layanan tujuan.
- Simpan form dan pilihan pengguna di penyimpanan lokal agar dapat dilanjutkan pada sesi berikutnya.

## Rujukan

- [Pembelajaran Mendalam — Sistem Informasi Kurikulum Kemendikdasmen](https://kurikulum.kemendikdasmen.go.id/pembelajaran-mendalam)
- [Panduan Pembelajaran dan Asesmen, Edisi Revisi 2025](https://kurikulum.kemendikdasmen.go.id/file/1755668120_manage_file.pdf)
