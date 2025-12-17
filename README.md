# BlockyKids 🧩

Platform pembelajaran coding untuk siswa Sekolah Dasar dengan block programming dan game interaktif.

## 🚀 Fitur Utama

- **6 Fase Pembelajaran** progresif dari dasar hingga lanjutan
- **Mode Admin (Guru)** untuk membuat tantangan custom
- **Semua Fase Terbuka** untuk memudahkan testing dan pembelajaran
- **Upload Sprite Custom** di fase Animasi
- **Dark Theme** dengan UI modern dan animatif

## 📚 Fase Pembelajaran

| # | Fase | Ikon | Deskripsi |
|---|------|------|-----------|
| 1 | Tutorial | 🎓 | Pengenalan dasar block programming |
| 2 | Robot | 🤖 | Navigasi robot di grid |
| 3 | Pixel Art | 🎨 | Menggambar dengan kode |
| 4 | Animasi | 🎬 | Kontrol sprite dan animasi |
| 5 | Math Quest | 🧮 | Matematika dengan variabel |
| 6 | Musik | 🎵 | Komposisi musik dengan blok |

## 🛠️ Teknologi

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Blockly** - Visual block programming

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
src/
├── app/                    # Next.js app router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/
│   ├── phases/             # Komponen fase
│   │   ├── TutorialPhase.tsx
│   │   ├── RobotPhase.tsx
│   │   ├── PixelArtPhase.tsx
│   │   ├── AnimationPhase.tsx
│   │   ├── MathPhase.tsx
│   │   └── MusicPhase.tsx
│   ├── admin/              # Komponen admin
│   │   └── AdminEditor.tsx
│   ├── ui/                 # UI components
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── Header.tsx
│   ├── LevelList.tsx
│   └── PhaseSelector.tsx
├── data/                   # Data statis
│   └── phases.ts
├── hooks/                  # Custom React hooks
│   └── index.ts
├── lib/                    # Utilities
│   ├── blockly.ts
│   └── storage.ts
└── types/                  # TypeScript types
    └── index.ts
```

## 👨‍🏫 Mode Admin (Guru)

1. Klik toggle **"Guru/Murid"** di header
2. Setiap fase memiliki tombol **"Edit Tantangan"**
3. Buat tantangan custom dengan form editor
4. Tantangan tersimpan di localStorage

## 🎨 Customization

### Menambah Level Baru

Edit file fase di `src/components/phases/[Fase]Phase.tsx`:

```typescript
const DEFAULT_LEVELS = [
  {
    id: 1,
    name: 'Level Baru',
    difficulty: 'easy',
    description: 'Deskripsi...',
    hint: 'Petunjuk...',
    // ...props spesifik fase
  },
];
```

### Upload Sprite (Fase Animasi)

1. Masuk ke fase Animasi
2. Klik **"Upload Sprite"** di sidebar
3. Pilih gambar (PNG/JPG)
4. Sprite tersimpan di localStorage

## 📖 README per Fase

- [Tutorial Phase](./docs/TUTORIAL.md)
- [Robot Phase](./docs/ROBOT.md)
- [Pixel Art Phase](./docs/PIXELART.md)
- [Animation Phase](./docs/ANIMATION.md)
- [Math Phase](./docs/MATH.md)
- [Music Phase](./docs/MUSIC.md)

## 📄 License

MIT License - Bebas digunakan untuk pembelajaran.
