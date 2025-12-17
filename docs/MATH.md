# 🧮 Math Phase

## Deskripsi
Fase matematika dengan kode. Siswa belajar variabel, operasi aritmatika, dan menampilkan output.

## Level

| # | Nama | Kesulitan | Expected Output |
|---|------|-----------|-----------------|
| 1 | Penjumlahan | 🟢 Mudah | 8 (5+3) |
| 2 | Pengurangan | 🟢 Mudah | 6 (10-4) |
| 3 | Perkalian | 🟢 Mudah | 42 (6×7) |
| 4 | Pembagian | 🟡 Sedang | 5 (20÷4) |
| 5 | Variabel | 🟡 Sedang | 10 |
| 6 | Hitung Keliling | 🟡 Sedang | 20 (4×5) |
| 7 | Hitung Luas | 🔴 Sulit | 40 (8×5) |
| 8 | Perhitungan Bertingkat | 🔴 Sulit | 30 ((10+5)×2) |
| 9 | Penghitung Uang | 🔴 Sulit | 5500 |
| 10 | Kalkulator Bebas | 🔴 Sulit | 100 |

## Blok yang Digunakan

```
📦 Variabel
├── Set [nama] = [nilai]
├── [nama] (get value)
└── Ubah [nama] sebesar [delta]

🔢 Angka
├── [angka]
├── A ➕ B
├── A ➖ B
├── A ✖️ B
└── A ➗ B

📤 Output
├── Tampilkan [nilai]
└── Tampilkan variabel [nama]

🔁 Pengulangan
└── Ulangi X kali
```

## Konsep Matematika

### 1. Operasi Dasar
```
5 + 3 = 8    (penjumlahan)
10 - 4 = 6   (pengurangan)
6 × 7 = 42   (perkalian)
20 ÷ 4 = 5   (pembagian)
```

### 2. Variabel
```
Set x = 10
Tampilkan x  → 10
```

### 3. Rumus Geometri
```
Keliling persegi = 4 × sisi
Luas persegi panjang = panjang × lebar
```

## Panel UI

### Output Panel
Menampilkan hasil dari blok "Tampilkan":
```
→ 8
→ 42
→ 100
```

### Variables Panel
Menampilkan variabel aktif:
```
📦 Variabel
├── umur: 10
├── sisi: 5
└── hasil: 20
```

## Tujuan Pembelajaran

1. **Operasi aritmatika** - Keempat operasi dasar
2. **Variabel** - Menyimpan nilai
3. **Expression** - Menggabungkan operasi
4. **Problem solving** - Menerjemahkan soal ke kode

## Tips untuk Guru

- Mulai dengan operasi sederhana
- Kaitkan dengan matematika yang sudah dipelajari
- Tunjukkan bagaimana variabel "menyimpan" nilai
- Buat soal cerita yang relevan

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Output kosong | Pastikan ada blok "Tampilkan" |
| Hasil salah | Cek urutan operasi |
| Variabel tidak ada | Set variabel sebelum digunakan |
| Pembagian = 0 | Jangan bagi dengan nol |
