# Product Requirements Document — PromptRPP

## 1. Informasi dokumen

| Atribut | Nilai |
|---|---|
| Produk | PromptRPP — Generator Prompt Perangkat Ajar |
| Status | Draft untuk implementasi |
| Platform awal | Web desktop dan mobile |
| Bahasa utama | Bahasa Indonesia |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Bun + Hono |
| Database | SQLite melalui `bun:sqlite` |
| Dokumen teknis | [Rencana_Pengembangan_Fullstack.md](./Rencana_Pengembangan_Fullstack.md) |
| Desain prompt | [Desain_PromptRPP.md](./Desain_PromptRPP.md) |
| Prototipe | [promptRPP.html](./promptRPP.html) |

## 2. Ringkasan produk

PromptRPP membantu guru menyusun prompt perangkat ajar yang terstruktur, kontekstual, dan dapat digunakan pada berbagai layanan AI. Guru mengisi konteks pembelajaran melalui form, memilih jenis dokumen, lalu memperoleh prompt Markdown yang siap disalin, disimpan, atau dibuka pada layanan AI.

Produk mendukung:

1. RPP.
2. Modul Ajar.
3. Rencana Pembelajaran berbasis Pembelajaran Mendalam.
4. LKPD.
5. Asesmen.
6. Rubrik penilaian.
7. Media pembelajaran.
8. Paket perangkat ajar lengkap.

Nilai utama PromptRPP terletak pada kontrak keluaran langkah kegiatan. Kegiatan pendahuluan, inti, dan penutup harus berupa urutan aktivitas bernomor yang konkret, memiliki alokasi waktu, tindakan guru dan siswa, bukti belajar, serta hubungan nyata dengan pengalaman dan prinsip Pembelajaran Mendalam.

## 3. Masalah pengguna

Guru menghadapi beberapa masalah ketika meminta AI menyusun perangkat ajar:

- prompt sering terlalu umum dan menghasilkan kegiatan seperti “guru menjelaskan” atau “siswa berdiskusi” tanpa langkah konkret;
- tujuan, aktivitas, dan asesmen tidak selalu selaras;
- keluaran panjang mudah terpotong;
- istilah Pembelajaran Mendalam sering digunakan sebagai label tanpa terlihat dalam aktivitas;
- konteks lokal, kesiapan siswa, alokasi JP, dan bukti belajar sering diabaikan;
- guru perlu menulis ulang konteks yang sama untuk RPP, LKPD, asesmen, rubrik, dan media;
- prompt dan hasil sebelumnya sulit ditemukan atau digunakan kembali.

## 4. Visi

Menjadi ruang kerja sederhana bagi guru untuk merancang konteks pembelajaran sekali, menghasilkan prompt perangkat ajar yang konsisten, dan menggunakannya pada layanan AI pilihan tanpa bergantung pada satu penyedia.

## 5. Tujuan

### Tujuan produk

- Mengurangi waktu yang dibutuhkan guru untuk menyusun prompt perangkat ajar.
- Meningkatkan kekonkretan langkah pembelajaran yang dihasilkan AI.
- Menjaga keterkaitan CP/TP, kegiatan, bukti belajar, dan asesmen.
- Menyediakan prompt portabel yang dapat digunakan pada beberapa layanan AI.
- Memungkinkan proyek, versi, template, dan riwayat digunakan kembali.

### Indikator keberhasilan awal

| Indikator | Target MVP |
|---|---|
| Keberhasilan menghasilkan prompt valid | ≥ 98% dari input yang lolos validasi |
| Waktu respons komposisi prompt lokal | p95 < 500 ms |
| Jenis dokumen yang didukung | 8 jenis |
| Kontrak prompt yang memiliki test | 100% |
| Proyek yang dapat dibuka kembali tanpa kehilangan input | 100% pada test E2E |
| Jumlah error kritis saat release | 0 |

Metrik perilaku pengguna baru dikumpulkan setelah ada persetujuan dan kebijakan privasi yang jelas. Versi awal tidak memerlukan pelacakan pihak ketiga.

## 6. Bukan tujuan MVP

Hal berikut tidak termasuk MVP:

- mengirim prompt langsung melalui API penyedia AI;
- menyimpan API key ChatGPT, Claude, DeepSeek, atau layanan lain;
- mengedit jawaban AI di dalam aplikasi;
- kolaborasi waktu nyata antar guru;
- aplikasi mobile native;
- marketplace template;
- sinkronisasi dengan LMS atau sistem sekolah;
- kepatuhan otomatis terhadap setiap regulasi tanpa verifikasi guru.

## 7. Pengguna utama

### Guru

Membutuhkan prompt RPP, modul, LKPD, asesmen, rubrik, atau media yang cepat dibuat dan mudah disunting.

### Koordinator kurikulum

Membutuhkan struktur yang konsisten, dapat ditinjau, dan dapat digunakan sebagai template oleh beberapa guru.

### Pengembang template

Membuat template input untuk mata pelajaran, jenjang, atau konteks sekolah tertentu.

## 8. Jobs to be done

- Ketika merencanakan pembelajaran, guru ingin mengisi konteks satu kali agar dapat menghasilkan beberapa perangkat yang saling selaras.
- Ketika AI menghasilkan kegiatan yang terlalu umum, guru ingin prompt memaksa AI menulis urutan aktivitas konkret.
- Ketika memiliki banyak pertemuan, guru ingin AI mengerjakan satu pertemuan per respons agar detail tidak terpotong.
- Ketika ingin berpindah layanan AI, guru ingin prompt tetap dapat digunakan tanpa perubahan besar.
- Ketika kembali ke pekerjaan lama, guru ingin membuka input dan prompt sebelumnya.

## 9. Ruang lingkup release

### Release 1 — Kesetaraan prototipe

- Generator React untuk delapan jenis dokumen.
- Validasi form dan perhitungan alokasi waktu.
- Pratinjau prompt.
- Salin, ekspor Markdown/DOC, cetak, dan buka layanan AI.
- Penyimpanan draft sementara di browser.

### Release 2 — API dan mesin prompt

- Hono API.
- Prompt engine TypeScript dengan versi.
- Validasi bersama frontend/backend.
- Test untuk seluruh kontrak prompt.

### Release 3 — Proyek tersimpan

- SQLite.
- Proyek, versi input, riwayat prompt, favorit, dan pengarsipan.
- Template sistem dan pribadi.

### Release 4 — Multi-pengguna

- Autentikasi.
- Isolasi data per pengguna.
- Pengaturan dan kebijakan penghapusan data.

## 10. Alur pengguna utama

~~~mermaid
flowchart LR
  A[Buat atau buka proyek] --> B[Pilih jenis dokumen]
  B --> C[Isi konteks pembelajaran]
  C --> D[Periksa checklist]
  D --> E[Generate prompt]
  E --> F{Simpan?}
  F -->|Ya| G[Simpan proyek dan versi]
  F -->|Tidak| H[Gunakan sementara]
  G --> I[Salin / Ekspor / Buka AI]
  H --> I
~~~

## 11. Arsitektur informasi

~~~text
PromptRPP
├── Generator
│   ├── Proyek aktif
│   ├── Form pembelajaran
│   ├── Checklist kualitas
│   └── Pratinjau prompt
├── Proyek
│   ├── Terbaru
│   ├── Favorit
│   └── Diarsipkan
├── Template
│   ├── Template sistem
│   └── Template pribadi
├── Riwayat
└── Pengaturan
~~~

## 12. Kebutuhan fungsional

### FR-01 — Pemilihan jenis dokumen

Sistem harus menampilkan delapan jenis dokumen sebagai chip/kartu yang mudah dipilih.

Kriteria:

- hanya satu jenis dokumen aktif pada satu waktu;
- pilihan aktif terlihat jelas;
- judul pratinjau dan kontrak prompt berubah sesuai pilihan;
- pilihan tersimpan pada proyek.

### FR-02 — Identitas pembelajaran

Form harus memuat kurikulum, mata pelajaran, jenjang, fase, kelas, semester, materi pokok, dan daerah/lingkungan siswa.

Kriteria:

- materi pokok, mapel, jenjang, dan kelas wajib;
- mapel “Lainnya” membuka input khusus;
- nilai tersimpan saat proyek disimpan.

### FR-03 — Alokasi waktu

Pengguna memasukkan jumlah pertemuan, JP per pertemuan, dan menit per JP.

Kriteria:

- semua nilai harus bilangan positif;
- sistem menghitung menit per pertemuan, total JP, dan total menit;
- prompt mewajibkan jumlah menit aktivitas sama dengan alokasi.

### FR-04 — Capaian dan karakteristik siswa

Form harus mendukung CP, TP, kompetensi awal, dan karakteristik peserta didik.

Kriteria:

- CP dan TP dapat berupa teks panjang;
- jika data kosong dan asumsi aktif, prompt memberi label `[ASUMSI]`;
- sistem tidak boleh mengarang kutipan atau nomor regulasi.

### FR-05 — Kerangka Pembelajaran Mendalam

Form harus menyediakan Dimensi Profil Lulusan, praktik pedagogis, konteks lokal, kemitraan, lingkungan, pemanfaatan digital, lintas disiplin, serta sumber belajar.

Kriteria:

- pengguna dapat memilih maksimal tiga dimensi;
- Rencana PM memerlukan dua atau tiga dimensi;
- istilah lengkap digunakan dalam hasil;
- label hanya diberikan bila aktivitas memiliki bukti nyata.

### FR-06 — Preferensi

Pengguna dapat mengaktifkan atau menonaktifkan diferensiasi, literasi/numerasi, sosial-emosional, diagnostik, formatif, as learning, sumatif, asumsi, dan keluaran bertahap.

Kriteria:

- preferensi tercermin pada prompt;
- perubahan preferensi memperbarui pratinjau setelah generate;
- preferensi disimpan pada proyek.

### FR-07 — Tingkat keluaran

Sistem menyediakan Ringkas, Rinci, dan Skenario Mengajar Sangat Rinci.

Kriteria:

- mode Ringkas boleh menggunakan tabel;
- mode Rinci menggunakan langkah bernomor;
- mode Sangat Rinci menyertakan tindakan guru/siswa, pertanyaan konkret, waktu, bukti belajar, diferensiasi, serta blok pengalaman/prinsip.

### FR-08 — Prompt engine

Backend menghasilkan prompt dari input terstruktur.

Kriteria:

- hasil memuat versi engine;
- input yang sama pada versi engine sama menghasilkan prompt yang sama;
- warning dan asumsi dikembalikan terpisah dari prompt;
- delapan kontrak dokumen memiliki test.

### FR-09 — Langkah kegiatan rinci

Untuk RPP, Modul Ajar, Rencana PM, dan Paket Lengkap, prompt harus meminta kegiatan pendahuluan, inti, dan penutup berupa item bernomor.

Setiap item harus dapat meminta:

- nama aktivitas;
- durasi;
- pengalaman belajar lengkap;
- prinsip pembelajaran lengkap;
- tindakan guru;
- tindakan siswa;
- instruksi/pertanyaan konkret;
- bukti belajar;
- diferensiasi bila relevan.

### FR-10 — Keluaran bertahap

Untuk beberapa pertemuan, pengguna dapat meminta peta keseluruhan dan rincian satu pertemuan per respons.

Kriteria:

- Tahap 1 menghasilkan bagian awal, peta alur, dan Pertemuan 1;
- prompt meminta AI berhenti;
- tersedia prompt “Pertemuan Berikutnya”;
- bagian asesmen/lampiran dibuat setelah pengguna melanjutkan.

### FR-11 — Checklist kualitas

Sistem menampilkan status kelengkapan materi, waktu, CP/TP, karakteristik siswa, dimensi, dan konteks/sumber.

Kriteria:

- checklist berubah saat pengguna mengetik;
- item wajib menghalangi generate bila tidak valid;
- item rekomendasi menghasilkan warning tanpa menghalangi.

### FR-12 — Proyek

Pengguna dapat membuat, melihat, mengubah, menggandakan, memfavoritkan, dan mengarsipkan proyek.

Kriteria:

- penghapusan awal berupa arsip lunak;
- daftar dapat difilter menurut mapel, jenjang, jenis, favorit, dan waktu;
- proyek menyimpan input terbaru dan metadata.

### FR-13 — Versi dan riwayat

Setiap penyimpanan penting membuat snapshot input dan generasi prompt.

Kriteria:

- riwayat menampilkan waktu, jenis dokumen, dan versi engine;
- pengguna dapat melihat prompt lama;
- membuka prompt lama tidak mengubahnya ke template terbaru;
- pengguna dapat menjadikan versi lama sebagai draft baru.

### FR-14 — Template

Pengguna dapat memakai template sistem atau membuat template pribadi.

Kriteria:

- template dapat mengisi sebagian atau seluruh form;
- pengguna melihat field yang akan diganti sebelum menerapkan;
- template pribadi dapat diubah, digandakan, difavoritkan, dan diarsipkan.

### FR-15 — Ekspor dan tujuan AI

Pengguna dapat menyalin, mengunduh Markdown, mengunduh DOC Word-kompatibel, mencetak, dan membuka layanan AI.

Kriteria:

- aplikasi tidak mengirim prompt otomatis ke penyedia AI;
- tombol Salin & Buka menyalin prompt lalu membuka URL tujuan;
- error clipboard/pop-up diberi pesan yang dapat ditindaklanjuti;
- nama file berasal dari materi pokok yang disanitasi.

### FR-16 — Draft lokal

Sebelum pengguna memiliki akun atau menekan Simpan, form aktif disimpan secara lokal.

Kriteria:

- reload tidak menghapus draft aktif;
- pengguna dapat mereset draft;
- draft lokal tidak dianggap backup permanen.

## 13. Kebutuhan per jenis dokumen

| Jenis | Kontrak minimum |
|---|---|
| RPP | Identitas, tujuan, matriks keterkaitan, langkah rinci, asesmen, refleksi |
| Modul Ajar | RPP + bahan ajar, LKPD, asesmen, rubrik, remedial, pengayaan |
| Rencana PM | Hubungan eksplisit dimensi, pengalaman, prinsip, aktivitas, dan bukti |
| LKPD | Tujuan, petunjuk bernomor, aktivitas konkret, ruang jawaban, refleksi, kunci |
| Asesmen | Tujuan, kisi-kisi, instrumen, stimulus, kunci, penskoran, tindak lanjut |
| Rubrik | Kriteria teramati, 3–4 tingkat, deskriptor, skor, interpretasi |
| Media | Alur media, konten, visual, interaksi, aksesibilitas, cara penggunaan |
| Paket Lengkap | Komponen yang saling terhubung tanpa duplikasi tidak perlu |

## 14. Kebutuhan data

Entitas utama:

- `Project`;
- `ProjectVersion`;
- `PromptGeneration`;
- `Template`;
- `UserSettings`;
- `User` saat autentikasi aktif.

Setiap generasi prompt menyimpan `engine_version` dan snapshot input agar dapat diaudit.

## 15. Kebutuhan nonfungsional

### Performa

- halaman generator interaktif dalam ≤ 2 detik pada koneksi dan perangkat yang wajar;
- komposisi prompt p95 < 500 ms di server lokal/region yang sama;
- daftar proyek memakai paginasi;
- input panjang tidak menyebabkan UI tersendat.

### Aksesibilitas

- dapat digunakan dengan keyboard;
- focus state terlihat;
- semua input memiliki label;
- warna bukan satu-satunya penanda;
- kontras teks memenuhi WCAG AA;
- pesan error terhubung dengan field terkait;
- layout dapat digunakan pada lebar 360 px.

### Keamanan dan privasi

- prepared statement untuk seluruh query;
- validasi frontend dan backend;
- HTTPS di produksi;
- pembatasan ukuran body;
- CORS hanya untuk origin yang diizinkan;
- tidak menyimpan API key AI pada MVP;
- log tidak memuat prompt/CP/TP lengkap;
- aplikasi mengingatkan pengguna agar tidak memasukkan identitas sensitif siswa.

### Reliabilitas

- migrasi database atomik;
- backup sebelum migrasi produksi;
- SQLite berada pada volume persisten;
- error API memiliki kode, pesan aman, dan request ID;
- data proyek tidak hilang ketika prompt generation gagal.

### Kompatibilitas

- dua versi utama terbaru Chrome, Edge, Firefox, dan Safari;
- desktop dan mobile web;
- ekspor Markdown UTF-8;
- DOC dapat dibuka aplikasi pengolah kata umum.

## 16. API minimum

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/health` |
| `POST` | `/api/v1/prompts/compose` |
| `GET/POST` | `/api/v1/projects` |
| `GET/PATCH/DELETE` | `/api/v1/projects/:projectId` |
| `GET/POST` | `/api/v1/projects/:projectId/generations` |
| `GET/POST` | `/api/v1/templates` |
| `PATCH/DELETE` | `/api/v1/templates/:templateId` |

Detail implementasi API dan skema database mengikuti [Rencana_Pengembangan_Fullstack.md](./Rencana_Pengembangan_Fullstack.md).

## 17. Kriteria penerimaan MVP

MVP siap dirilis jika:

1. Delapan jenis dokumen dapat menghasilkan prompt.
2. RPP sangat rinci menghasilkan kontrak langkah kegiatan bernomor.
3. Perhitungan JP/menit tervalidasi.
4. Blok pengalaman dan prinsip memakai istilah lengkap.
5. Salin, Markdown, DOC, cetak, dan buka AI berfungsi.
6. Draft bertahan setelah reload.
7. Semua test kontrak prompt lulus.
8. Tidak ada error console kritis.
9. Tampilan desktop dan mobile lulus smoke test.
10. Prototipe HTML tetap tersedia sebagai referensi sampai paritas tercapai.

## 18. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Prompt terlalu panjang | Jawaban AI terpotong | Keluaran bertahap per pertemuan |
| Template berubah dan merusak riwayat | Hasil lama tidak dapat direproduksi | Simpan prompt dan `engine_version` |
| SQLite dipakai multi-replika | Konflik tulis atau data tidak konsisten | Satu instans; migrasi PostgreSQL saat scale |
| Guru memasukkan data siswa sensitif | Risiko privasi | Peringatan, minimisasi data, kebijakan log |
| Istilah PM menjadi kosmetik | Kualitas perangkat rendah | Kontrak tindakan nyata dan bukti belajar |
| Banyak field membuat form berat | Pengguna berhenti | Section bertahap, default wajar, template |
| Perbedaan hasil antar AI | Ekspektasi tidak konsisten | Prompt portabel, contoh, dan aturan output eksplisit |

## 19. Keputusan produk

- Generator dan Salin & Buka adalah fitur utama.
- Integrasi API AI bukan syarat MVP.
- Prompt engine berada di backend dan memiliki versi.
- Prototipe visual biru menjadi acuan desain.
- SQLite digunakan pada satu instans.
- Autentikasi wajib sebelum penggunaan multi-pengguna.
- Data sensitif siswa tidak menjadi bagian model data.

## 20. Pertanyaan untuk fase berikutnya

Pertanyaan ini tidak menghalangi MVP:

- mekanisme autentikasi yang dipilih;
- penyedia hosting dan strategi backup;
- apakah template sistem dikelola melalui UI admin;
- apakah hasil jawaban AI akan dapat ditempel kembali ke proyek;
- apakah ekspor DOCX native diperlukan setelah format DOC sederhana;
- kebutuhan integrasi dengan LMS atau penyimpanan cloud.
