# 🤖 Robot Phase

## Deskripsi
Fase navigasi robot di grid. Siswa mengarahkan robot untuk mencapai tujuan, mengumpulkan bintang, dan menghindari rintangan.

## Level

| # | Nama | Kesulitan | Konsep |
|---|------|-----------|--------|
| 1 | Langkah Pertama | 🟢 Mudah | Gerakan dasar |
| 2 | Belok Kiri | 🟢 Mudah | Turning |
| 3 | Kumpulkan Bintang | 🟡 Sedang | Collecting items |
| 4 | Pakai Pengulangan | 🟡 Sedang | Loop optimization |
| 5 | Labirin | 🔴 Sulit | Complex navigation |

## Blok yang Digunakan

```
🏃 Gerakan
├── Maju
├── Belok Kiri
└── Belok Kanan

🔁 Kontrol
├── Ulangi X kali
└── Ulangi sampai di tujuan

❓ Kondisi
├── Jika ada jalan di depan
├── Jika ada jalan di kiri
└── Jika ada jalan di kanan

⭐ Aksi
├── Ambil Bintang
├── Ambil Kunci
└── Buka Pintu
```

## Tile Types

| Emoji | Tipe | Deskripsi |
|-------|------|-----------|
| 🤖 | Robot | Posisi start |
| 🏁 | Goal | Tujuan akhir |
| ⭐ | Star | Bintang untuk dikumpulkan |
| 🧱 | Wall | Tembok (tidak bisa dilewati) |
| 🌲 | Tree | Pohon (obstacle) |
| 💧 | Water | Air (obstacle) |
| 🔑 | Key | Kunci untuk pintu |
| 🚪 | Door | Pintu (butuh kunci) |

## Tujuan Pembelajaran

1. **Navigasi terstruktur** - Merencanakan jalur
2. **Loop** - Mengurangi pengulangan manual
3. **Conditional** - Membuat keputusan berdasarkan kondisi
4. **Problem solving** - Memecahkan labirin

## Membuat Level Custom (Guru)

1. Klik tombol **"Edit Tantangan"** di sidebar
2. Set ukuran grid (width × height)
3. Pilih tile dari palette
4. Klik di grid untuk menempatkan tile
5. Pastikan ada 1 robot dan 1 goal
6. Simpan tantangan

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Robot tidak bergerak | Pastikan ada blok gerakan |
| Robot menabrak tembok | Cek arah dan jumlah langkah |
| Bintang tidak terkumpul | Gunakan blok "Ambil Bintang" |
| Pintu tidak terbuka | Kumpulkan kunci dulu |
