# Implementation Issues — PromptRPP

Dokumen ini adalah backlog implementasi dari [PRD.md](./PRD.md) dan [Rencana_Pengembangan_Fullstack.md](./Rencana_Pengembangan_Fullstack.md). Setiap bagian dapat dipindahkan menjadi GitHub Issue atau Linear Issue.

## Konvensi

### Prioritas

| Label | Makna |
|---|---|
| `priority:P0` | Memblokir milestone atau release |
| `priority:P1` | Fitur utama yang harus selesai dalam milestone |
| `priority:P2` | Penting, dapat dijadwalkan setelah alur utama stabil |
| `priority:P3` | Pengembangan lanjutan |

### Label area

- `area:repo`
- `area:web`
- `area:api`
- `area:prompt-engine`
- `area:database`
- `area:ux`
- `area:testing`
- `area:security`
- `area:deployment`
- `area:docs`

### Milestone

| Milestone | Hasil |
|---|---|
| M0 — Foundation | Monorepo dapat dijalankan, diuji, dan dibuild |
| M1 — React Parity | Fitur prototipe tersedia pada React |
| M2 — Canonical Prompt API | Prompt engine dan API menjadi sumber kebenaran |
| M3 — Persistence | Proyek, versi, riwayat, dan template tersimpan |
| M4 — Release Readiness | Aksesibilitas, keamanan, E2E, deployment, dokumentasi |
| M5 — Multi-user | Autentikasi dan isolasi data |
| Future | Integrasi AI dan fitur lanjutan |

## Definition of Done

Sebuah issue dianggap selesai jika:

- acceptance criteria terpenuhi;
- TypeScript tidak memiliki error;
- test relevan ditambahkan dan lulus;
- tidak menambah error console atau warning yang tidak dijelaskan;
- UI diuji pada desktop dan mobile bila ada perubahan visual;
- dokumentasi diperbarui bila kontrak, API, atau perilaku berubah;
- data sensitif tidak muncul pada log atau fixture.

---

## Epic A — Foundation

### PRP-001 — Inisialisasi Bun workspace

**Milestone:** M0  
**Labels:** `priority:P0`, `area:repo`  
**Dependencies:** Tidak ada

**Scope**

- Buat root `package.json` dengan Bun workspaces.
- Tambahkan `apps/web`, `apps/api`, `packages/contracts`, dan `packages/prompt-engine`.
- Pastikan `bun install` dapat dijalankan dari root.

**Acceptance criteria**

- [ ] Struktur direktori sesuai rencana arsitektur.
- [ ] `bun install` selesai tanpa error.
- [ ] `bun.lock` dibuat.
- [ ] Database, environment lokal, dan hasil build masuk `.gitignore`.

### PRP-002 — Konfigurasi TypeScript strict bersama

**Milestone:** M0  
**Labels:** `priority:P0`, `area:repo`  
**Dependencies:** PRP-001

**Scope**

- Buat konfigurasi TypeScript dasar.
- Aktifkan strict mode.
- Setiap workspace mewarisi konfigurasi yang sesuai.

**Acceptance criteria**

- [ ] `bun run typecheck` tersedia dari root.
- [ ] Import antar-package memiliki tipe.
- [ ] Tidak ada `any` implisit pada kode awal.

### PRP-003 — Bootstrap React + Vite

**Milestone:** M0  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-001, PRP-002

**Scope**

- Buat React TypeScript app di `apps/web`.
- Konfigurasikan Vite development server.
- Tambahkan proxy `/api` ke Hono untuk development.

**Acceptance criteria**

- [ ] `bun run dev:web` membuka aplikasi.
- [ ] Fast Refresh bekerja.
- [ ] `bun run build:web` menghasilkan build produksi.
- [ ] Route SPA tetap dapat dimuat langsung.

### PRP-004 — Bootstrap Bun + Hono API

**Milestone:** M0  
**Labels:** `priority:P0`, `area:api`  
**Dependencies:** PRP-001, PRP-002

**Scope**

- Buat aplikasi Hono di `apps/api`.
- Tambahkan endpoint `GET /api/v1/health`.
- Tambahkan mode development hot reload.

**Acceptance criteria**

- [ ] `bun run dev:api` menjalankan server.
- [ ] Health endpoint mengembalikan status, versi, dan waktu.
- [ ] App dapat diuji melalui `app.fetch()`.
- [ ] Shutdown menutup koneksi database saat database ditambahkan.

### PRP-005 — Integrasi Tailwind dan token visual

**Milestone:** M0  
**Labels:** `priority:P1`, `area:web`, `area:ux`  
**Dependencies:** PRP-003

**Scope**

- Pasang Tailwind melalui plugin Vite.
- Definisikan warna biru, background, surface, ink, dan prompt preview.
- Definisikan gaya blok Memahami, Mengaplikasi, Merefleksi, Berkesadaran, Bermakna, dan Menggembirakan.

**Acceptance criteria**

- [ ] Semua token utama tersedia sebagai utility/theme.
- [ ] Tidak ada warna utama berulang sebagai magic value pada komponen.
- [ ] Kontras teks utama memenuhi WCAG AA.

### PRP-006 — Tambahkan lint, format, dan skrip root

**Milestone:** M0  
**Labels:** `priority:P1`, `area:repo`, `area:testing`  
**Dependencies:** PRP-001–PRP-004

**Scope**

- Tambahkan skrip `dev`, `build`, `test`, `typecheck`, dan `lint`.
- Tetapkan formatter dan linter.

**Acceptance criteria**

- [ ] Semua skrip dapat dijalankan dari root.
- [ ] Build frontend dan backend lulus.
- [ ] CI lokal tidak bergantung pada state editor.

---

## Epic B — Contracts dan Prompt Engine

### PRP-007 — Definisikan schema input PromptRPP

**Milestone:** M1  
**Labels:** `priority:P0`, `area:prompt-engine`  
**Dependencies:** PRP-002

**Scope**

- Buat tipe `DocumentType` dan `ComposePromptInput`.
- Buat schema runtime dengan Zod.
- Modelkan preferensi, alokasi waktu, konteks, dan Pembelajaran Mendalam.

**Acceptance criteria**

- [ ] Delapan jenis dokumen masuk enum.
- [ ] Bilangan waktu wajib positif.
- [ ] Rencana PM memerlukan 2–3 dimensi.
- [ ] Schema dapat digunakan frontend dan backend.

### PRP-008 — Implementasikan normalisasi dan perhitungan waktu

**Milestone:** M1  
**Labels:** `priority:P0`, `area:prompt-engine`  
**Dependencies:** PRP-007

**Scope**

- Hitung menit per pertemuan, total JP, dan total menit.
- Normalisasi string kosong.
- Bentuk nilai asumsi bila diaktifkan.

**Acceptance criteria**

- [ ] Hasil perhitungan sesuai nilai input.
- [ ] Nilai kosong tidak berubah menjadi string `undefined`.
- [ ] Semua asumsi ditandai `[ASUMSI]`.
- [ ] Unit test mencakup kasus batas.

### PRP-009 — Implementasikan blok prompt bersama

**Milestone:** M1  
**Labels:** `priority:P0`, `area:prompt-engine`  
**Dependencies:** PRP-007, PRP-008

**Scope**

- Peran.
- Konteks pembelajaran.
- CP, TP, kompetensi awal, dan karakteristik siswa.
- Kerangka Pembelajaran Mendalam.
- Preferensi dan aturan kualitas.

**Acceptance criteria**

- [ ] Blok tersusun dalam urutan yang ditetapkan PRD.
- [ ] Tidak ada kutipan regulasi yang dibuat otomatis.
- [ ] Input pengguna dipertahankan apa adanya selain normalisasi whitespace.
- [ ] Output Markdown stabil.

### PRP-010 — Implementasikan delapan kontrak jenis dokumen

**Milestone:** M1  
**Labels:** `priority:P0`, `area:prompt-engine`  
**Dependencies:** PRP-009

**Scope**

- RPP.
- Modul Ajar.
- Rencana PM.
- LKPD.
- Asesmen.
- Rubrik.
- Media.
- Paket Lengkap.

**Acceptance criteria**

- [ ] Setiap jenis memiliki modul template sendiri.
- [ ] Setiap jenis memuat format output minimal dari PRD.
- [ ] Mengganti jenis hanya mengganti bagian yang relevan.
- [ ] Semua kontrak memiliki snapshot/golden test.

### PRP-011 — Implementasikan kontrak langkah kegiatan rinci

**Milestone:** M1  
**Labels:** `priority:P0`, `area:prompt-engine`  
**Dependencies:** PRP-009, PRP-010

**Scope**

- Pendahuluan, inti, dan penutup.
- Nomor berkelanjutan.
- Durasi, guru, siswa, bukti belajar, dan diferensiasi.
- Blok pengalaman dan prinsip dengan istilah lengkap.

**Acceptance criteria**

- [ ] Tidak menggunakan singkatan M/A/R atau Bks/Bmk/Mgb.
- [ ] Prompt melarang aktivitas generik tanpa langkah konkret.
- [ ] Prompt mewajibkan rekap waktu tepat.
- [ ] Hanya jenis rencana yang menerima kontrak kegiatan lengkap.

### PRP-012 — Implementasikan tingkat keluaran

**Milestone:** M1  
**Labels:** `priority:P1`, `area:prompt-engine`  
**Dependencies:** PRP-011

**Scope**

- Ringkas.
- Rinci.
- Skenario Mengajar Sangat Rinci.

**Acceptance criteria**

- [ ] Ringkas menghasilkan kontrak tabel singkat.
- [ ] Rinci menghasilkan langkah bernomor.
- [ ] Sangat Rinci menyertakan semua detail FR-09.
- [ ] Perbedaan tiap tingkat dilindungi test.

### PRP-013 — Implementasikan keluaran bertahap

**Milestone:** M1  
**Labels:** `priority:P1`, `area:prompt-engine`  
**Dependencies:** PRP-011

**Scope**

- Tahap 1: bagian awal, peta alur, Pertemuan 1.
- Prompt pertemuan berikutnya.
- Lanjutan asesmen dan lampiran.

**Acceptance criteria**

- [ ] Prompt menyuruh AI berhenti pada titik yang tepat.
- [ ] Instruksi lanjutan menggunakan konteks percakapan yang sama.
- [ ] Fitur hanya muncul untuk jenis dokumen yang relevan.

### PRP-014 — Buat suite test prompt engine

**Milestone:** M1  
**Labels:** `priority:P0`, `area:testing`, `area:prompt-engine`  
**Dependencies:** PRP-008–PRP-013

**Scope**

- Unit test aturan validasi.
- Golden test delapan dokumen.
- Test asumsi, dimensi, waktu, dan keluaran bertahap.

**Acceptance criteria**

- [ ] Seluruh delapan kontrak diuji.
- [ ] Perubahan output disengaja harus memperbarui golden file secara eksplisit.
- [ ] Test berjalan dengan `bun test`.

---

## Epic C — Frontend React Parity

### PRP-015 — Bangun AppShell dan layout responsif

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`, `area:ux`  
**Dependencies:** PRP-003, PRP-005

**Scope**

- Header gradien biru.
- Panel form kiri.
- Panel prompt kanan.
- Layout satu kolom pada layar sempit.

**Acceptance criteria**

- [ ] Visual setara dengan prototipe.
- [ ] Tidak ada horizontal overflow pada lebar 360 px.
- [ ] Panel hasil tetap mudah dibaca pada desktop dan mobile.

### PRP-016 — Bangun pemilih jenis dokumen

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-015

**Scope**

- Delapan kartu/chip.
- State aktif.
- Sinkronisasi judul dan badge pratinjau.

**Acceptance criteria**

- [ ] Dapat digunakan dengan mouse dan keyboard.
- [ ] Hanya satu pilihan aktif.
- [ ] Screen reader mengetahui pilihan aktif.

### PRP-017 — Bangun section identitas pembelajaran

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-007, PRP-015

**Acceptance criteria**

- [ ] Semua field FR-02 tersedia.
- [ ] Mata pelajaran Lainnya membuka field khusus.
- [ ] Pesan error muncul dekat input terkait.

### PRP-018 — Bangun section waktu dan tujuan

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-008, PRP-015

**Acceptance criteria**

- [ ] Jumlah pertemuan, JP, dan menit tervalidasi.
- [ ] Total dihitung langsung.
- [ ] CP, TP, kompetensi awal, dan karakteristik siswa tersedia.

### PRP-019 — Bangun section Pembelajaran Mendalam

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-007, PRP-015

**Acceptance criteria**

- [ ] Pilihan dimensi dibatasi maksimal tiga.
- [ ] Praktik pedagogis memiliki chip dan field lainnya.
- [ ] Konteks, kemitraan, lingkungan, digital, lintas disiplin, dan sumber tersedia.

### PRP-020 — Bangun section preferensi

**Milestone:** M1  
**Labels:** `priority:P1`, `area:web`  
**Dependencies:** PRP-015

**Acceptance criteria**

- [ ] Semua toggle FR-06 tersedia.
- [ ] Tingkat keluaran dapat dipilih.
- [ ] Field asesmen/rubrik/media muncul sesuai kebutuhan atau diberi konteks jelas.

### PRP-021 — Integrasikan React Hook Form dan schema

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-007, PRP-017–PRP-020

**Acceptance criteria**

- [ ] Form memakai schema bersama.
- [ ] Submit diblokir pada error wajib.
- [ ] Warning rekomendasi tidak memblokir.
- [ ] Fokus berpindah ke error pertama.

### PRP-022 — Bangun PromptPreview dan checklist

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`, `area:ux`  
**Dependencies:** PRP-015, PRP-021

**Acceptance criteria**

- [ ] Prompt tampil dalam panel gelap.
- [ ] Prompt panjang dapat digulir dan dipilih.
- [ ] Checklist berubah saat form diisi.
- [ ] Warning dan asumsi ditampilkan terpisah.

### PRP-023 — Implementasikan aksi salin, ekspor, cetak, dan buka AI

**Milestone:** M1  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-022

**Acceptance criteria**

- [ ] Clipboard API memiliki fallback.
- [ ] Ekspor Markdown UTF-8 berhasil.
- [ ] Ekspor DOC Word-kompatibel berhasil.
- [ ] Cetak tidak memasukkan kontrol UI.
- [ ] Salin & Buka menangani pop-up yang diblokir.

### PRP-024 — Implementasikan draft lokal dan reset

**Milestone:** M1  
**Labels:** `priority:P1`, `area:web`  
**Dependencies:** PRP-021

**Acceptance criteria**

- [ ] Reload memulihkan draft.
- [ ] Reset menghapus draft setelah konfirmasi UI yang jelas.
- [ ] Versi schema draft disimpan untuk migrasi data lokal.
- [ ] Data rusak tidak membuat aplikasi gagal dimuat.

---

## Epic D — API dan Database

### PRP-025 — Buat endpoint compose prompt

**Milestone:** M2  
**Labels:** `priority:P0`, `area:api`, `area:prompt-engine`  
**Dependencies:** PRP-004, PRP-007–PRP-014

**Acceptance criteria**

- [ ] `POST /api/v1/prompts/compose` menerima schema bersama.
- [ ] Respons berisi prompt, versi engine, warning, dan asumsi.
- [ ] Input invalid mendapat status 400 dengan field errors.
- [ ] Endpoint memiliki integration test.

### PRP-026 — Tambahkan middleware API dasar

**Milestone:** M2  
**Labels:** `priority:P1`, `area:api`, `area:security`  
**Dependencies:** PRP-004

**Scope**

- Error handler.
- Request ID.
- CORS.
- Batas ukuran body.
- Security headers.

**Acceptance criteria**

- [ ] Error response memiliki struktur konsisten.
- [ ] Stack trace tidak dikirim pada produksi.
- [ ] Origin tidak dikenal ditolak pada produksi.

### PRP-027 — Integrasikan frontend dengan compose API

**Milestone:** M2  
**Labels:** `priority:P0`, `area:web`, `area:api`  
**Dependencies:** PRP-022, PRP-025

**Acceptance criteria**

- [ ] Generate memakai API sebagai sumber hasil.
- [ ] Loading, success, validation error, dan network error ditampilkan.
- [ ] Submit ganda dicegah.
- [ ] Input tidak hilang ketika API gagal.

### PRP-028 — Buat koneksi bun:sqlite dan migration runner

**Milestone:** M3  
**Labels:** `priority:P0`, `area:database`  
**Dependencies:** PRP-004

**Acceptance criteria**

- [ ] Path database berasal dari `DATABASE_PATH`.
- [ ] Foreign key, WAL, dan busy timeout aktif.
- [ ] Migrasi dijalankan dalam transaksi.
- [ ] Migrasi aman dijalankan ulang.
- [ ] Database dapat ditutup dengan benar.

### PRP-029 — Implementasikan skema awal database

**Milestone:** M3  
**Labels:** `priority:P0`, `area:database`  
**Dependencies:** PRP-028

**Acceptance criteria**

- [ ] Tabel projects, versions, generations, templates, settings, dan migrations dibuat.
- [ ] Foreign key dan index sesuai rencana.
- [ ] Test migrasi dari database kosong lulus.

### PRP-030 — Implementasikan project repository

**Milestone:** M3  
**Labels:** `priority:P0`, `area:database`  
**Dependencies:** PRP-029

**Acceptance criteria**

- [ ] Create, get, list, update, favorite, archive.
- [ ] Semua query memakai prepared statement.
- [ ] Pagination dan filter tersedia.
- [ ] Repository diuji dengan database sementara.

### PRP-031 — Implementasikan version dan generation repository

**Milestone:** M3  
**Labels:** `priority:P0`, `area:database`  
**Dependencies:** PRP-029

**Acceptance criteria**

- [ ] Nomor versi unik per proyek.
- [ ] Snapshot input dan prompt disimpan atomik.
- [ ] Generasi menyimpan versi engine.
- [ ] Riwayat diurutkan terbaru lebih dahulu.

### PRP-032 — Implementasikan Projects API

**Milestone:** M3  
**Labels:** `priority:P0`, `area:api`  
**Dependencies:** PRP-026, PRP-030, PRP-031

**Acceptance criteria**

- [ ] CRUD dan archive sesuai API PRD.
- [ ] Endpoint generasi tersedia.
- [ ] Not found, conflict, dan validation error dibedakan.
- [ ] Integration test mencakup alur penuh.

---

## Epic E — Proyek, Riwayat, dan Template

### PRP-033 — Bangun daftar proyek

**Milestone:** M3  
**Labels:** `priority:P1`, `area:web`  
**Dependencies:** PRP-032

**Acceptance criteria**

- [ ] Menampilkan judul, mapel, jenis, dan waktu update.
- [ ] Search, filter, urut, dan pagination bekerja.
- [ ] Loading, kosong, dan error memiliki tampilan.

### PRP-034 — Bangun detail dan penyimpanan proyek

**Milestone:** M3  
**Labels:** `priority:P0`, `area:web`  
**Dependencies:** PRP-027, PRP-032

**Acceptance criteria**

- [ ] Proyek dapat dibuat dan dibuka kembali.
- [ ] Save membuat versi sesuai aturan.
- [ ] Perubahan belum tersimpan terlihat.
- [ ] Pengguna diperingatkan sebelum meninggalkan perubahan penting.

### PRP-035 — Bangun riwayat generasi

**Milestone:** M3  
**Labels:** `priority:P1`, `area:web`  
**Dependencies:** PRP-031, PRP-032, PRP-034

**Acceptance criteria**

- [ ] Riwayat menampilkan waktu, jenis, dan engine version.
- [ ] Prompt lama dapat dilihat dan disalin.
- [ ] Prompt lama tidak dikomposisi ulang otomatis.
- [ ] Versi lama dapat dijadikan draft baru.

### PRP-036 — Implementasikan template repository dan API

**Milestone:** M3  
**Labels:** `priority:P1`, `area:database`, `area:api`  
**Dependencies:** PRP-029, PRP-026

**Acceptance criteria**

- [ ] Template sistem dan pribadi dapat dibedakan.
- [ ] Create, list, update, favorite, dan archive tersedia.
- [ ] Input template divalidasi dengan schema bersama.

### PRP-037 — Bangun pustaka template

**Milestone:** M3  
**Labels:** `priority:P1`, `area:web`, `area:ux`  
**Dependencies:** PRP-036

**Acceptance criteria**

- [ ] Template dapat dicari dan difilter.
- [ ] Pengguna melihat field yang akan diterapkan.
- [ ] Menerapkan template tidak menimpa field tanpa pemberitahuan.
- [ ] Template pribadi dapat digandakan dan diarsipkan.

### PRP-038 — Implementasikan favorit dan arsip

**Milestone:** M3  
**Labels:** `priority:P2`, `area:web`, `area:api`  
**Dependencies:** PRP-030, PRP-033, PRP-036

**Acceptance criteria**

- [ ] Proyek dan template dapat difavoritkan.
- [ ] Arsip tidak menghapus data permanen.
- [ ] Daftar aktif tidak menampilkan item arsip secara default.

---

## Epic F — Release Readiness

### PRP-039 — Audit aksesibilitas

**Milestone:** M4  
**Labels:** `priority:P0`, `area:web`, `area:ux`  
**Dependencies:** PRP-015–PRP-024, PRP-033–PRP-037

**Acceptance criteria**

- [ ] Alur generator dapat digunakan dengan keyboard.
- [ ] Label, error, dan state aktif dibaca screen reader.
- [ ] Kontras memenuhi WCAG AA.
- [ ] Warna bukan satu-satunya penanda.
- [ ] Focus order masuk akal.

### PRP-040 — Tambahkan integration test API

**Milestone:** M4  
**Labels:** `priority:P0`, `area:testing`, `area:api`  
**Dependencies:** PRP-025, PRP-032, PRP-036

**Acceptance criteria**

- [ ] Health, compose, projects, generations, dan templates diuji.
- [ ] Test memakai database sementara terisolasi.
- [ ] Error case utama diuji.
- [ ] Test tidak bergantung urutan eksekusi.

### PRP-041 — Tambahkan E2E test alur utama

**Milestone:** M4  
**Labels:** `priority:P0`, `area:testing`  
**Dependencies:** PRP-027, PRP-034, PRP-037

**Acceptance criteria**

- [ ] Generate RPP Sangat Rinci.
- [ ] Uji delapan jenis dokumen.
- [ ] Simpan dan buka kembali proyek.
- [ ] Lihat riwayat.
- [ ] Terapkan template.
- [ ] Ekspor Markdown dan DOC.
- [ ] Uji viewport desktop dan mobile.

### PRP-042 — Hardening keamanan dan privasi

**Milestone:** M4  
**Labels:** `priority:P0`, `area:security`  
**Dependencies:** PRP-026, PRP-028–PRP-032

**Acceptance criteria**

- [ ] Body limit dan CORS terkonfigurasi.
- [ ] Tidak ada SQL string concatenation dari input.
- [ ] Prompt/CP/TP lengkap tidak muncul pada log.
- [ ] UI menampilkan peringatan data sensitif siswa.
- [ ] Dependency audit tidak memiliki temuan kritis terbuka.

### PRP-043 — Performance pass

**Milestone:** M4  
**Labels:** `priority:P1`, `area:web`, `area:api`  
**Dependencies:** PRP-027, PRP-033

**Acceptance criteria**

- [ ] Compose prompt p95 memenuhi target PRD pada lingkungan uji.
- [ ] Form panjang tetap responsif.
- [ ] Daftar proyek menggunakan pagination.
- [ ] Bundle frontend ditinjau dan chunk besar dijelaskan.

### PRP-044 — Siapkan deployment satu instans

**Milestone:** M4  
**Labels:** `priority:P0`, `area:deployment`  
**Dependencies:** PRP-028, PRP-041, PRP-042

**Scope**

- Build produksi.
- Container/VM configuration.
- Volume SQLite.
- HTTPS/reverse proxy.
- Health check.

**Acceptance criteria**

- [ ] Deploy baru dapat menjalankan migrasi.
- [ ] Restart tidak menghapus data.
- [ ] Frontend SPA dan API berasal dari origin yang benar.
- [ ] Health check dapat digunakan orchestrator.

### PRP-045 — Implementasikan backup dan restore SQLite

**Milestone:** M4  
**Labels:** `priority:P0`, `area:database`, `area:deployment`  
**Dependencies:** PRP-028, PRP-044

**Acceptance criteria**

- [ ] Backup terjadwal dibuat dari database konsisten.
- [ ] Retensi backup terdokumentasi.
- [ ] Restore diuji pada lingkungan kosong.
- [ ] Prosedur sebelum migrasi produksi terdokumentasi.

### PRP-046 — Dokumentasi pengguna dan operasi

**Milestone:** M4  
**Labels:** `priority:P1`, `area:docs`  
**Dependencies:** PRP-041, PRP-044, PRP-045

**Acceptance criteria**

- [ ] README instalasi dan development.
- [ ] Panduan penggunaan generator.
- [ ] Panduan migrasi dan backup.
- [ ] Daftar environment variable.
- [ ] Known limitations dicatat.

---

## Epic G — Multi-user dan Pengembangan Lanjutan

### PRP-047 — Desain dan implementasi autentikasi

**Milestone:** M5  
**Labels:** `priority:P0`, `area:security`, `area:api`  
**Dependencies:** PRP-032, keputusan metode autentikasi

**Acceptance criteria**

- [ ] Sesi aman dan dapat dicabut.
- [ ] Password, bila digunakan, tidak disimpan sebagai plaintext.
- [ ] CSRF/session fixation ditangani sesuai metode.
- [ ] Flow login/logout memiliki test.

### PRP-048 — Isolasi data per pengguna

**Milestone:** M5  
**Labels:** `priority:P0`, `area:security`, `area:database`  
**Dependencies:** PRP-047

**Acceptance criteria**

- [ ] Semua query proyek/template dibatasi `owner_id`.
- [ ] Pengguna tidak dapat mengakses ID pengguna lain.
- [ ] Integration test lintas pengguna tersedia.
- [ ] Data lama mode lokal memiliki strategi migrasi pemilik.

### PRP-049 — Pengaturan pengguna dan penghapusan data

**Milestone:** M5  
**Labels:** `priority:P1`, `area:web`, `area:api`  
**Dependencies:** PRP-047, PRP-048

**Acceptance criteria**

- [ ] Tujuan AI dan preferensi ekspor dapat disimpan.
- [ ] Pengguna dapat mengekspor data miliknya.
- [ ] Pengguna dapat meminta penghapusan data.
- [ ] Dampak penghapusan terhadap riwayat dijelaskan.

### PRP-050 — Spike integrasi API AI

**Milestone:** Future  
**Labels:** `priority:P3`, `area:api`, `area:security`  
**Dependencies:** Release MVP stabil

**Scope**

- Teliti API resmi penyedia yang dipilih.
- Bandingkan BYOK dan kredensial server.
- Hitung biaya, rate limit, privasi, dan retry.

**Acceptance criteria**

- [ ] Tidak menyimpan kredensial sebelum desain keamanan disetujui.
- [ ] Dokumen keputusan mencakup biaya dan privasi.
- [ ] Mode Salin & Buka tetap dipertahankan.

## Urutan eksekusi yang disarankan

~~~text
PRP-001 → PRP-002 → PRP-003/004 → PRP-005/006
        → PRP-007 → PRP-008 → PRP-009 → PRP-010/011
        → PRP-012/013 → PRP-014
        → PRP-015 → PRP-016–020 → PRP-021 → PRP-022–024
        → PRP-025/026 → PRP-027
        → PRP-028 → PRP-029 → PRP-030/031 → PRP-032
        → PRP-033–038
        → PRP-039–046
        → PRP-047–049
        → PRP-050
~~~

## Kandidat release pertama

Release pertama yang dapat digunakan tanpa database terdiri dari:

- PRP-001 sampai PRP-024;
- PRP-025 sampai PRP-027 jika komposisi prompt langsung memakai API;
- PRP-039, PRP-041, dan PRP-046 dalam scope generator.

Release tersimpan dengan SQLite memerlukan PRP-028 sampai PRP-038.
