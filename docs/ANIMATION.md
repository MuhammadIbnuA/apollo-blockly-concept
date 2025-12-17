# 🎬 Animation Phase

## Deskripsi
Fase kontrol sprite dan animasi. Siswa dapat menggunakan sprite default atau **upload gambar sendiri** untuk membuat animasi interaktif.

## Level

| # | Nama | Kesulitan | Konsep |
|---|------|-----------|--------|
| 1 | Kucing Berjalan | 🟢 Mudah | Gerakan horizontal |
| 2 | Burung Terbang | 🟢 Mudah | Gerakan vertikal |
| 3 | Lompat! | 🟢 Mudah | Jump animation |
| 4 | Zig Zag | 🟡 Sedang | Combined movement |
| 5 | Berputar | 🟡 Sedang | Rotation |
| 6 | Besar Kecil | 🟡 Sedang | Scaling |
| 7 | Dialog | 🔴 Sulit | Speech bubbles |
| 8 | Cerita Pendek | 🔴 Sulit | Multiple sprites |
| 9 | 🎨 Sandbox | 🎨 Bebas | Free creativity |

## Blok yang Digunakan

```
🏃 Gerakan
├── Gerak kanan X pixel
├── Gerak kiri X pixel
├── Gerak atas X pixel
├── Gerak bawah X pixel
├── Pindah ke (x, y)
└── Lompat

🎨 Tampilan
├── Putar X derajat
├── Ubah ukuran X%
├── Tampilkan
└── Sembunyikan

💬 Komunikasi
├── Katakan "..."
└── Pikirkan "..."

⏱️ Waktu
├── Tunggu X detik
└── Ulangi X kali

🎭 Sprite
├── Pilih sprite [dropdown]
└── Pilih sprite ke-X
```

## 📤 Upload Sprite Custom

### Cara Upload

1. Di sidebar, klik **"Upload Sprite"**
2. Pilih file gambar (PNG, JPG, GIF)
3. Beri nama sprite
4. Klik **"Simpan"**

### Format yang Didukung

- PNG (recommended, supports transparency)
- JPG/JPEG
- GIF (first frame only)
- WebP

### Tips Upload

- Gunakan gambar dengan background transparan
- Ukuran ideal: 64×64 hingga 256×256 pixel
- File < 1MB untuk performa optimal

## Sprite Default

| Emoji | Nama | ID |
|-------|------|-----|
| 🐱 | Kucing | cat |
| 🐕 | Anjing | dog |
| 🐦 | Burung | bird |
| 🐰 | Kelinci | rabbit |
| 🐝 | Lebah | bee |
| ⭐ | Bintang | star |
| 🎈 | Balon | balloon |
| 🚀 | Roket | rocket |
| 🚗 | Mobil | car |
| 🐟 | Ikan | fish |

## Sandbox Mode

Level 9 adalah **Sandbox Mode** di mana:
- Tidak ada goal spesifik
- Bebas upload sprite
- Bebas berkreasi
- Cocok untuk proyek final

## Tujuan Pembelajaran

1. **Animation principles** - Timing dan movement
2. **Event handling** - Urutan aksi
3. **Creativity** - Ekspresi melalui animasi
4. **Storytelling** - Membuat cerita visual

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Sprite tidak bergerak | Cek apakah sprite terpilih |
| Upload gagal | Pastikan format dan ukuran file |
| Sprite hilang | Cek opacity/visible state |
| Speech bubble tidak muncul | Blok "Katakan" butuh teks |
