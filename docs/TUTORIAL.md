# 🎓 Tutorial Phase

## Deskripsi
Fase pengenalan dasar block programming untuk pemula. Siswa akan belajar konsep fundamental: menyeret blok, menyambungkan blok, dan menjalankan program.

## Level

| # | Nama | Kesulitan | Konsep |
|---|------|-----------|--------|
| 1 | Seret Blok | 🟢 Mudah | Drag & drop dari toolbox |
| 2 | Sambung Blok | 🟢 Mudah | Koneksi antar blok |
| 3 | Tekan Jalankan | 🟢 Mudah | Eksekusi program |
| 4 | Blok Belok | 🟢 Mudah | Turn left/right |
| 5 | Kombinasi | 🟡 Sedang | Sequence of commands |
| 6 | Pengulangan | 🟡 Sedang | Loop blocks |
| 7 | Ambil Bintang | 🟡 Sedang | Action blocks |
| 8 | Selesai! | 🟢 Mudah | Graduation |

## Blok yang Digunakan

```
🏃 Gerakan
├── Maju
├── Belok Kiri  
└── Belok Kanan

🔁 Kontrol
└── Ulangi X kali

⭐ Aksi
└── Ambil Bintang
```

## Tujuan Pembelajaran

1. **Memahami interface** - Mengenal toolbox, workspace, dan tombol kontrol
2. **Drag and drop** - Kemampuan dasar menyeret blok
3. **Sequencing** - Menyusun instruksi berurutan
4. **Debugging** - Memperbaiki kesalahan sederhana

## Tips untuk Guru

- Biarkan siswa eksplorasi sendiri terlebih dahulu
- Gunakan dialog interaktif untuk membimbing
- Berikan pujian untuk setiap langkah berhasil
- Jangan terburu-buru pindah level

## Menambah Level Custom

```typescript
// Di AdminEditor, buat level baru dengan:
{
  name: 'Nama Level',
  difficulty: 'easy' | 'medium' | 'hard',
  description: 'Deskripsi misi...',
  hint: 'Petunjuk untuk siswa...',
  instruction: 'Instruksi spesifik...',
  targetBlocks: ['move_forward', 'turn_left'],
}
```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Blok tidak bisa diseret | Pastikan klik di area blok, bukan teks |
| Blok tidak tersambung | Dekatkan hingga ada "snap" visual |
| Program tidak jalan | Cek apakah blok tersambung dengan benar |
