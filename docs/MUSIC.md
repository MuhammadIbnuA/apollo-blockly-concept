# 🎵 Music Phase

## Deskripsi
Fase komposisi musik dengan blok. Siswa memainkan nada, mengatur durasi, dan membuat melodi sederhana.

## Level

| # | Nama | Kesulitan | Goal |
|---|------|-----------|------|
| 1 | Nada Pertama | 🟢 Mudah | Mainkan Do |
| 2 | Do Re Mi | 🟢 Mudah | Urutan 3 nada |
| 3 | Tangga Nada | 🟢 Mudah | Semua 8 nada |
| 4 | Jeda Musik | 🟡 Sedang | Gunakan rest |
| 5 | Durasi Berbeda | 🟡 Sedang | Variasi durasi |
| 6 | Pengulangan Ritme | 🟡 Sedang | Loop pattern |
| 7 | Twinkle Star | 🔴 Sulit | Lagu spesifik |
| 8 | Komposisi Bebas | 🎨 Bebas | Minimal 10 nada |

## Blok yang Digunakan

```
🎵 Nada
├── Mainkan [Do/Re/Mi/Fa/Sol/La/Si/Do↑]
└── Jeda X ketuk

⏱️ Durasi
├── Durasi nada [1/2/½/¼] ketuk
└── Tempo [60-200] BPM

🔊 Volume
└── Volume X%

🔁 Pengulangan
└── Ulangi X kali
```

## 🎹 Piano Virtual

Piano 8 nada yang bisa diklik langsung:

| Nada | Nama | Frekuensi |
|------|------|-----------|
| C4 | Do | 261.63 Hz |
| D4 | Re | 293.66 Hz |
| E4 | Mi | 329.63 Hz |
| F4 | Fa | 349.23 Hz |
| G4 | Sol | 392.00 Hz |
| A4 | La | 440.00 Hz |
| B4 | Si | 493.88 Hz |
| C5 | Do↑ | 523.25 Hz |

## Konsep Musik

### 1. Nada
Setiap nada memiliki frekuensi berbeda:
```
Do → Re → Mi → Fa → Sol → La → Si → Do↑
(naik semakin tinggi)
```

### 2. Durasi
```
1 ketuk   = nada penuh
2 ketuk   = nada panjang
½ ketuk   = nada setengah
¼ ketuk   = nada cepat
```

### 3. Tempo (BPM)
```
60 BPM  = lambat (1 ketuk/detik)
120 BPM = normal (2 ketuk/detik)
180 BPM = cepat (3 ketuk/detik)
```

## Contoh Lagu

### Twinkle Twinkle Little Star
```
Do Do Sol Sol La La Sol
Fa Fa Mi Mi Re Re Do
```

### Mary Had a Little Lamb
```
Mi Re Do Re Mi Mi Mi
Re Re Re Mi Sol Sol
```

## Notes Display

Menampilkan nada yang dimainkan secara visual:
```
♪ Do  ♪ Do  ♪ Sol  ♪ Sol  ♪ La  ♪ La  ♪ Sol
```

## Tujuan Pembelajaran

1. **Pitch** - Membedakan tinggi rendah nada
2. **Rhythm** - Pola durasi dan timing
3. **Pattern** - Mengenali dan membuat pola musik
4. **Creativity** - Komposisi original

## Tips untuk Guru

- Mulai dengan nada tunggal
- Nyanyikan bersama untuk validasi
- Gunakan lagu familiar sebagai target
- Dorong eksperimen di Sandbox mode

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tidak ada suara | Klik halaman dulu (browser policy) |
| Volume terlalu kecil | Cek slider volume |
| Nada terlalu cepat | Kurangi tempo atau perbesar durasi |
| Program tidak berhenti | Klik tombol Stop |

## Browser Compatibility

Audio menggunakan Web Audio API:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Butuh interaksi user pertama untuk unmute
