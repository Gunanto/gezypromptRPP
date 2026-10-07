# Rencana Pengembangan Full-stack PromptRPP

## Tujuan

Dokumen ini menjadi rencana pengembangan `promptRPP.html` dari prototipe HTML mandiri menjadi aplikasi yang dapat menyimpan proyek, riwayat prompt, template, dan versi perangkat ajar.

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS | Form, pratinjau, ekspor, riwayat, template |
| Backend/API | Bun + Hono | Validasi, komposisi prompt, API proyek/template/riwayat |
| Database | `bun:sqlite` / SQLite | Proyek, versi input, generasi prompt, template, pengaturan |

Versi pertama tetap menggunakan pola **Salin & Buka AI**. Aplikasi tidak mengirim prompt ke ChatGPT, Claude, DeepSeek, Codex, Muse, atau penyedia lain. Integrasi API AI menjadi tahap lanjutan karena membutuhkan kredensial, pengelolaan biaya, serta persetujuan pengguna.

## Sasaran produk

Pengguna dapat:

1. Membuat proyek perangkat ajar.
2. Mengisi konteks pembelajaran sekali dan menggunakannya untuk berbagai jenis keluaran.
3. Menghasilkan RPP, Modul Ajar, Rencana Pembelajaran Mendalam, LKPD, asesmen, rubrik, media pembelajaran, atau paket lengkap.
4. Menghasilkan prompt dengan langkah kegiatan bernomor yang rinci sesuai [Desain_PromptRPP.md](./Desain_PromptRPP.md).
5. Menyimpan draft, membuka kembali riwayat, menggandakan proyek, dan menyimpan template favorit.
6. Mengekspor prompt ke Markdown dan dokumen Word-kompatibel.
7. Menyalin prompt atau membuka layanan AI pilihan.

## Prinsip arsitektur

### Satu mesin prompt sebagai sumber kebenaran

Logika komposisi prompt dipindahkan dari HTML ke paket TypeScript murni bernama `prompt-engine`. Backend memanggil paket ini untuk menghasilkan prompt. Komponen React hanya mengelola interaksi pengguna dan menampilkan hasil.

Setiap generasi prompt menyimpan:

- snapshot data input;
- versi mesin prompt;
- jenis dokumen;
- isi prompt Markdown;
- daftar peringatan dan asumsi.

Riwayat lama tetap dapat dibuka dengan hasil yang sama walaupun template prompt berubah di masa depan.

### Frontend dan backend berbagi kontrak

Skema input dan respons API berada di `packages/contracts`. Frontend melakukan validasi ringan agar umpan balik cepat; backend memvalidasi ulang sebelum menyusun atau menyimpan data.

### SQLite satu instans

SQLite cocok untuk aplikasi awal yang berjalan pada satu komputer, satu VM, atau satu kontainer dengan volume persisten. `bun:sqlite` adalah driver SQLite bawaan Bun dan mendukung prepared statement serta transaksi. [Dokumentasi Bun SQLite](https://bun.sh/docs/runtime/sqlite)

Database tidak boleh berada pada filesystem sementara atau dipakai bersamaan oleh banyak replika backend. Jika aplikasi membutuhkan beberapa replika atau banyak operasi tulis secara bersamaan, database perlu dipindahkan ke PostgreSQL.

### Prompt portabel lintas-AI

Blok Pembelajaran Mendalam tetap memakai istilah lengkap dan emoji warna:

~~~markdown
> 🟦 **Pengalaman belajar:** Memahami
> 🟩 **Prinsip pembelajaran:** Bermakna · 🟨 Menggembirakan
~~~

React dapat merender data yang sama sebagai blok warna Tailwind. Saat disalin, teks tersebut tetap terbaca pada layanan AI atau editor Markdown tanpa CSS aplikasi.

## Gambaran arsitektur

~~~mermaid
flowchart LR
  U[Guru] --> W[React + Vite]
  W -->|POST /api/v1/prompts/compose| A[Hono di Bun]
  W -->|CRUD proyek, template, riwayat| A
  A --> E[Prompt Engine TypeScript]
  A --> D[(SQLite via bun:sqlite)]
  W -->|Salin prompt| C[Clipboard]
  C --> X[ChatGPT / Claude / DeepSeek / Codex / Muse]
~~~

Alur utama:

1. Guru mengisi form di React.
2. Frontend memberikan validasi awal.
3. Frontend mengirim input ke API komposisi prompt.
4. Backend memvalidasi input, menjalankan `prompt-engine`, lalu mengembalikan prompt, asumsi, dan peringatan.
5. Saat pengguna menekan Simpan, backend menyimpan proyek dan generasi prompt sebagai versi baru.
6. Guru menyalin atau mengekspor prompt tanpa mengirim data ke penyedia AI.

## Struktur repository

Gunakan Bun workspaces agar frontend, backend, kontrak tipe, dan mesin prompt dapat berkembang tanpa duplikasi.

~~~text
gezypromptRPP/
├── apps/
│   ├── web/                         # React + TypeScript + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── projects/
│   │   │   │   ├── prompt-builder/
│   │   │   │   ├── templates/
│   │   │   │   └── history/
│   │   │   ├── lib/
│   │   │   ├── routes/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                         # Bun + Hono
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── repositories/
│       │   └── db/
│       └── package.json
├── packages/
│   ├── contracts/                   # Tipe dan validasi bersama
│   └── prompt-engine/               # composePrompt(), template, aturan mutu
├── data/
│   ├── migrations/
│   └── promptrpp.sqlite             # Tidak dikomit
├── docs/
├── package.json
├── bun.lock
└── README.md
~~~

Pada saat migrasi, pindahkan `Desain_PromptRPP.md` ke `docs/`. Simpan `promptRPP.html` sebagai prototipe referensi sampai implementasi React mencapai kesetaraan fungsi.

## Frontend

### Halaman dan fitur

| Halaman/fitur | Fungsi |
|---|---|
| Beranda / Generator | Membuat atau membuka proyek, mengisi form, menghasilkan prompt |
| Riwayat proyek | Menampilkan proyek tersimpan dan generasi sebelumnya |
| Detail proyek | Mengubah input, melihat versi, menggandakan, atau mengarsipkan |
| Template | Mengelola template sistem dan template pribadi |
| Favorit | Menyaring proyek dan template favorit |
| Pengaturan | Tujuan AI default, preferensi ekspor, dan mode penyimpanan |

### Komponen

~~~text
AppShell
├── HeaderHero
├── ProjectSidebar
├── PromptBuilderPage
│   ├── DocumentTypeSelector
│   ├── IdentitySection
│   ├── LearningContextSection
│   ├── DeepLearningSection
│   ├── PreferencesSection
│   ├── QualityChecklist
│   └── PromptPreview
│       ├── PromptActionBar
│       └── DestinationMenu
├── ProjectHistoryPage
└── TemplateLibraryPage
~~~

### Form dan state

Gunakan React Hook Form bersama Zod. Skema Zod ditempatkan di `packages/contracts` agar aturan validasi tidak berbeda antara frontend dan backend.

Validasi utama:

- `topic`, `subject`, `level`, `classroom`, `meetings`, `jp`, dan `minutes` wajib ada.
- Jumlah pertemuan, JP, dan menit harus bilangan positif.
- Rencana Pembelajaran Mendalam mewajibkan dua atau tiga Dimensi Profil Lulusan.
- Jika diferensiasi aktif, isi minimal satu karakteristik peserta didik.
- Jika pemanfaatan digital diisi, tampilkan batasan dan etika penggunaan.

### Desain Tailwind

Pertahankan identitas dari prototipe:

~~~text
primary: #155EEF
primary-dark: #1049BD
surface: #FFFFFF
background: #F3F7FF
ink: #102A56
prompt-preview: #0B1730
~~~

| Blok | Tampilan |
|---|---|
| Memahami | Biru muda / teks biru tua |
| Mengaplikasi | Jingga muda / teks jingga tua |
| Merefleksi | Ungu muda / teks ungu tua |
| Berkesadaran | Toska muda / teks toska tua |
| Bermakna | Hijau muda / teks hijau tua |
| Menggembirakan | Kuning muda / teks kuning tua |

Tailwind dapat dipasang melalui plugin Vite `@tailwindcss/vite` dan impor `@import "tailwindcss";` di CSS utama. [Panduan Tailwind untuk Vite](https://tailwindcss.com/docs/installation/using-vite)

## Backend dan API

### Struktur Hono

~~~text
apps/api/src/
├── app.ts                 # Membuat app Hono dan mendaftarkan middleware
├── index.ts               # Entry point Bun
├── middleware/
│   ├── error-handler.ts
│   ├── request-id.ts
│   ├── cors.ts
│   └── auth.ts            # Ditambahkan saat autentikasi aktif
├── routes/
│   ├── health.ts
│   ├── prompts.ts
│   ├── projects.ts
│   ├── generations.ts
│   ├── templates.ts
│   └── exports.ts
├── services/
├── repositories/
└── db/
    ├── client.ts
    ├── migrate.ts
    └── migrations.ts
~~~

Hono berjalan langsung di Bun menggunakan handler `fetch`. [Panduan Hono untuk Bun](https://hono.dev/docs/getting-started/bun)

### API versi 1

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/v1/health` | Status layanan dan versi |
| `POST` | `/api/v1/prompts/compose` | Validasi input dan hasilkan prompt tanpa menyimpan |
| `GET` | `/api/v1/projects` | Daftar proyek dengan filter, urutan, dan paginasi |
| `POST` | `/api/v1/projects` | Membuat proyek |
| `GET` | `/api/v1/projects/:projectId` | Detail proyek dan versi terbaru |
| `PATCH` | `/api/v1/projects/:projectId` | Mengubah metadata atau input |
| `DELETE` | `/api/v1/projects/:projectId` | Mengarsipkan proyek secara lunak |
| `POST` | `/api/v1/projects/:projectId/generations` | Menyimpan generasi prompt |
| `GET` | `/api/v1/projects/:projectId/generations` | Riwayat generasi proyek |
| `GET` | `/api/v1/templates` | Template sistem dan pribadi |
| `POST` | `/api/v1/templates` | Membuat template pribadi |
| `PATCH` | `/api/v1/templates/:templateId` | Mengubah template |
| `DELETE` | `/api/v1/templates/:templateId` | Mengarsipkan template |

Contoh respons `POST /api/v1/prompts/compose`:

~~~json
{
  "prompt": "# PROMPTRPP — RPP\n...",
  "engineVersion": "1.0.0",
  "validation": {
    "warnings": ["Karakteristik peserta didik belum diisi."],
    "assumptions": ["[ASUMSI] Gunakan konteks kehidupan sehari-hari peserta didik."]
  }
}
~~~

## Prompt engine

### Antarmuka

~~~ts
export type ComposePromptInput = {
  documentType: DocumentType
  curriculum: string
  subject: string
  level: string
  phase?: string
  classroom: string
  semester?: string
  topic: string
  meetings: number
  jpPerMeeting: number
  minutesPerJp: number
  cp?: string
  tp?: string
  initialCompetence?: string
  studentCharacteristics?: string
  dimensions: string[]
  pedagogicalPractice?: string
  localContext?: string
  partnership?: string
  learningEnvironment?: string
  digitalUse?: string
  crossDiscipline?: string
  resources?: string
  preferences: PromptPreferences
}

export type ComposePromptResult = {
  prompt: string
  engineVersion: string
  warnings: string[]
  assumptions: string[]
}

export function composePrompt(input: ComposePromptInput): ComposePromptResult
~~~

### Tanggung jawab

1. Menormalisasi input dan menghitung total JP/menit.
2. Memvalidasi aturan lintas-field.
3. Menyusun blok peran, konteks, Pembelajaran Mendalam, preferensi, dan aturan kualitas.
4. Menambahkan kontrak khusus untuk setiap jenis dokumen.
5. Menambahkan kontrak langkah pembelajaran rinci untuk RPP, Modul Ajar, Rencana PM, dan Paket Lengkap.
6. Menambahkan keluaran bertahap untuk dokumen multi-pertemuan.
7. Menghasilkan asumsi dan peringatan yang dapat ditampilkan UI.

~~~text
packages/prompt-engine/src/
├── compose.ts
├── validation.ts
├── defaults.ts
├── shared/
│   ├── role.ts
│   ├── context.ts
│   ├── deep-learning.ts
│   ├── quality-rules.ts
│   └── detailed-steps.ts
└── document-types/
    ├── rpp.ts
    ├── module.ts
    ├── deep-learning-plan.ts
    ├── lkpd.ts
    ├── assessment.ts
    ├── rubric.ts
    ├── media.ts
    └── complete-package.ts
~~~

## Database

Gunakan prepared statement `bun:sqlite`; jangan menyusun SQL dari string input pengguna. Saat koneksi dibuat, aktifkan foreign key, WAL, dan batas tunggu:

~~~sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
~~~

| Tabel | Fungsi |
|---|---|
| `schema_migrations` | Mencatat migrasi yang sudah diterapkan |
| `users` | Identitas pengguna ketika autentikasi aktif |
| `projects` | Metadata proyek dan input terkini |
| `project_versions` | Snapshot input setiap proyek disimpan |
| `prompt_generations` | Prompt hasil komposisi serta metadata mesin |
| `templates` | Template sistem atau pribadi |
| `user_settings` | Tujuan AI default dan preferensi ekspor |

Skema awal:

~~~sql
CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  input_json TEXT NOT NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_owner_updated
  ON projects(owner_id, updated_at DESC);

CREATE TABLE project_versions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  input_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, version_number)
);

CREATE TABLE prompt_generations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_version_id TEXT REFERENCES project_versions(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  prompt_markdown TEXT NOT NULL,
  validation_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generations_project_created
  ON prompt_generations(project_id, created_at DESC);

CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT,
  input_json TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_destination TEXT,
  export_format TEXT,
  preferences_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
~~~

`owner_id` boleh kosong pada mode pribadi di komputer sendiri. Jika aplikasi melayani banyak pengguna, autentikasi wajib aktif dan setiap query harus dibatasi dengan `owner_id`.

## Migrasi dan backup

~~~text
data/migrations/
├── 0001_initial.sql
├── 0002_add_template_tags.sql
└── 0003_add_project_archiving.sql
~~~

Pada startup:

1. Buka database dari `DATABASE_PATH`.
2. Terapkan PRAGMA.
3. Buat `schema_migrations` bila belum ada.
4. Jalankan migrasi yang belum tercatat dalam transaksi.
5. Catat versi migrasi setelah transaksi berhasil.

Backup file SQLite perlu dilakukan sebelum migrasi produksi. File database, WAL, dan SHM harus berada pada volume persisten yang sama.

## Keamanan dan privasi

| Area | Keputusan |
|---|---|
| Data siswa | Jangan menyimpan nama, NISN, nilai individual, alamat, atau data sensitif siswa |
| AI pihak ketiga | Tidak ada API key penyedia AI pada tahap awal |
| SQL | Prepared statement dan validasi skema untuk setiap input |
| HTTP | HTTPS produksi, CORS untuk origin frontend yang disetujui, batas ukuran body |
| Autentikasi | Wajib sebelum mode multi-pengguna |
| Backup | Backup terenkripsi di lokasi dengan akses terbatas |
| Logging | Jangan catat isi prompt, CP, atau TP secara lengkap pada log produksi |

## Pengujian

### Unit

Gunakan `bun:test` untuk:

- perhitungan JP dan menit;
- validasi input;
- asumsi otomatis;
- seluruh delapan kontrak jenis dokumen;
- kontrak langkah kegiatan rinci;
- keluaran bertahap;
- migrasi dan repository SQLite.

### Integration

- Panggil `app.fetch()` Hono dengan database SQLite sementara.
- Buat proyek, simpan generasi, ambil riwayat, dan arsipkan proyek.
- Pastikan proyek pengguna lain tidak dapat diakses setelah autentikasi aktif.
- Jalankan migrasi dari database kosong sampai skema terbaru.

### End-to-end

- Isi form RPP sangat rinci dan verifikasi kontrak langkah kegiatan.
- Uji delapan jenis dokumen.
- Simpan proyek, muat ulang halaman, lalu buka kembali proyek.
- Uji ekspor Markdown dan DOC.
- Uji desktop serta layar kecil.

Hono mendokumentasikan pengujian route melalui pemanggilan `app.fetch()` langsung tanpa server eksternal. [Contoh pengujian Hono di Bun](https://hono.dev/docs/getting-started/bun)

## Tahap implementasi

### Tahap 0 — Fondasi

- Buat Bun workspace dan TypeScript strict mode.
- Buat `apps/web` dan `apps/api`.
- Pasang Vite React TypeScript, Tailwind, Hono, dan test runner Bun.
- Siapkan lint, format, build, dan pipeline test.

Kriteria selesai:

~~~text
bun run dev
bun run test
bun run build
~~~

berhasil dari root repository.

### Tahap 1 — Kesetaraan dengan prototipe

- Port semua field dan delapan jenis dokumen dari `promptRPP.html` ke React.
- Pertahankan header biru, form kiri, prompt gelap kanan, chip, blok warna, salin, ekspor, cetak, dan tujuan AI.
- Belum memerlukan database atau akun.

Kriteria selesai: fungsi inti dan isi prompt setara dengan prototipe HTML.

### Tahap 2 — Prompt engine dan API

- Buat `packages/contracts` dan `packages/prompt-engine`.
- Tambahkan `POST /api/v1/prompts/compose`.
- Backend menyusun prompt kanonis; frontend memakai respons API.
- Tulis unit test untuk setiap jenis dokumen.

Kriteria selesai: input yang sama memberi hasil prompt yang stabil dan teruji.

### Tahap 3 — SQLite dan proyek tersimpan

- Tambahkan migrasi, repository, dan endpoint proyek.
- Simpan draft, versi, riwayat generasi, favorit, dan pengarsipan.
- Buat halaman Riwayat dan Detail Proyek.

Kriteria selesai: proyek yang disimpan dapat dibuka dengan input dan prompt yang sama.

### Tahap 4 — Template dan pengalaman guru

- Tambahkan template sistem/pribadi, penggandaan proyek, pencarian, filter, dan favorit.
- Tambahkan pesan validasi yang menjelaskan data yang belum lengkap.

### Tahap 5 — Autentikasi dan multi-pengguna

- Tambahkan login, sesi aman, isolasi `owner_id`, pengaturan pengguna, serta penghapusan data.

Autentikasi tidak boleh ditunda bila aplikasi dibuka untuk lebih dari satu pengguna.

### Tahap 6 — Integrasi AI opsional

- Buat adapter terpisah untuk layanan yang memiliki API resmi.
- Tambahkan persetujuan pengguna, pembatasan permintaan, biaya, dan penanganan error.
- Pertahankan mode Salin & Buka sebagai pilihan universal.

## Konfigurasi dan skrip

Contoh `.env`:

~~~dotenv
APP_ENV=development
API_PORT=3001
DATABASE_PATH=./data/promptrpp.sqlite
WEB_ORIGIN=http://localhost:5173
LOG_LEVEL=info
~~~

Contoh skrip root:

~~~json
{
  "scripts": {
    "dev": "concurrently \"bun --cwd apps/api run dev\" \"bun --cwd apps/web run dev\"",
    "dev:web": "bun --cwd apps/web run dev",
    "dev:api": "bun --cwd apps/api run dev",
    "build": "bun run build:web && bun run build:api",
    "build:web": "bun --cwd apps/web run build",
    "build:api": "bun --cwd apps/api run build",
    "test": "bun test",
    "db:migrate": "bun --cwd apps/api run db:migrate"
  }
}
~~~

Vite menyediakan template `react-ts` serta server pengembangan dan build produksi untuk aplikasi React TypeScript. [Panduan Vite](https://vite.dev/guide/)

## Deployment

Deploy awal yang disarankan:

- satu instans Bun/Hono pada VM atau kontainer;
- volume persisten untuk `data/promptrpp.sqlite`;
- reverse proxy HTTPS;
- backup database terjadwal;
- satu proses penulis database;
- frontend Vite hasil build disajikan oleh Hono atau reverse proxy.

Hono menyediakan static serving untuk Bun jika frontend hasil build ingin disajikan dari backend yang sama. [Static serving Hono di Bun](https://hono.dev/docs/getting-started/bun)

Pindahkan ke PostgreSQL apabila aplikasi memerlukan lebih dari satu replika backend, filesystem database sementara, banyak operasi tulis serentak, replikasi, atau pemulihan lintas region.

## Keputusan yang ditetapkan

| Keputusan | Alasan |
|---|---|
| Bun workspace monorepo | Tipe, skema, dan mesin prompt dipakai bersama frontend/backend |
| `bun:sqlite` tanpa ORM pada awal proyek | Skema kecil, query mudah diaudit, dependency ringan |
| Hono untuk API | Ringan, berbasis Web Standard, berjalan langsung di Bun |
| Prompt engine terpisah | Hasil konsisten, mudah diuji, dan memiliki versi |
| Salin & Buka AI sebagai default | Tidak membutuhkan API key atau biaya |
| SQLite satu instans | Sederhana untuk MVP dengan batas skala yang jelas |
| Autentikasi sebelum multi-pengguna | Melindungi proyek pembelajaran antar guru |

## Urutan pekerjaan pertama

1. Buat Bun workspace dan dua aplikasi kosong: `apps/web` serta `apps/api`.
2. Port tampilan dan field dari `promptRPP.html` ke React tanpa mengubah perilaku prompt.
3. Ekstrak template prompt ke `packages/prompt-engine`.
4. Tulis test delapan jenis dokumen dan langkah kegiatan rinci.
5. Tambahkan Hono serta endpoint komposisi prompt.
6. Tambahkan migrasi SQLite dan penyimpanan proyek.
7. Tambahkan riwayat/template setelah generator inti stabil.
