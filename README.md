# PromptRPP

PromptRPP adalah ruang kerja untuk membuat, menyimpan, membuka kembali, mengedit, dan membuat revisi prompt perangkat ajar.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- Bun + Hono
- SQLite melalui `bun:sqlite`
- Zod untuk kontrak data bersama
- Bun Test

## Menjalankan aplikasi

Persyaratan: Bun 1.4 atau lebih baru.

~~~bash
bun install
bun run dev
~~~

Buka:

- Web: http://localhost:5173
- API: http://localhost:3001
- Health: http://localhost:3001/api/v1/health

Database default dibuat di `data/promptrpp.sqlite`. Salin `.env.example` menjadi `.env` untuk mengganti konfigurasi.

## Perintah

~~~bash
bun run dev          # Web dan API
bun run dev:web      # Vite saja
bun run dev:api      # Hono saja
bun run typecheck
bun test
bun run build
bun run db:migrate
~~~

## Alur penyimpanan prompt

1. Guru mengisi form.
2. `Pratinjau` menghasilkan prompt tanpa menyimpan.
3. `Generate & Simpan` menyimpan snapshot input, hasil asli mesin, dan dokumen prompt revisi 1.
4. Isi prompt dapat diedit pada panel kanan.
5. `Simpan Revisi` membuat revisi baru tanpa menghapus versi sebelumnya.
6. Proyek dan prompt dapat dibuka kembali dari panel Proyek.
7. Revisi lama dapat dipulihkan sebagai revisi baru.

Hasil asli mesin disimpan di `prompt_generations` dan tidak diubah. Versi aktif yang diedit disimpan di `prompt_documents`, sedangkan riwayatnya berada di `prompt_revisions`.

## Struktur

~~~text
apps/
├── api/                 # Hono, SQLite, repository, routes
└── web/                 # React, form, proyek, editor prompt
packages/
├── contracts/           # Zod schema dan tipe bersama
└── prompt-engine/       # Mesin prompt delapan jenis dokumen
data/                    # Database lokal, tidak dikomit
~~~

## Jenis dokumen

- RPP
- Modul Ajar
- Rencana Pembelajaran berbasis Pembelajaran Mendalam
- LKPD
- Asesmen
- Rubrik penilaian
- Media pembelajaran
- Paket perangkat ajar lengkap

## Verifikasi

Suite test mencakup:

- delapan kontrak prompt;
- perhitungan JP dan menit;
- asumsi dan warning;
- compose API;
- membuat proyek;
- generate dan simpan prompt;
- edit serta simpan revisi;
- memulihkan revisi;
- konflik optimistic locking.

## Dokumen

- [PRD](./PRD.md)
- [Issues](./ISSUES.md)
- [Desain prompt](./Desain_PromptRPP.md)
- [Rencana full-stack](./Rencana_Pengembangan_Fullstack.md)

`promptRPP.html` tetap disimpan sebagai prototipe pembanding selama implementasi React berkembang.

## Deployment produksi

Contoh unit systemd dan virtual host Nginx tersedia di [`deploy/`](./deploy/).
Konfigurasi produksi yang digunakan untuk `prompt.gezytech.web.id` menjalankan API
pada `127.0.0.1:3012`, menyajikan frontend statis melalui Nginx, dan menyimpan
SQLite di direktori `data/` yang tidak masuk Git.
