/**
 * BlockyKids - Pixel Art Challenge Editor
 * Visual editor for Pixel Art phase challenges
 */

'use client';

import { BaseLevel } from '@/types';

interface PixelArtLevel extends BaseLevel {
    target: number[][]; // [x, y] coordinates
    allowedBlocks: string[];
}

interface PixelArtChallengeEditorProps {
    level: Partial<PixelArtLevel>;
    onChange: (level: Partial<PixelArtLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'pixel_draw', name: '✏️ Gambar Pixel', category: 'Gambar' },
    { id: 'pixel_move_right', name: '➡️ Geser Kanan', category: 'Gerakan' },
    { id: 'pixel_move_down', name: '⬇️ Geser Bawah', category: 'Gerakan' },
    { id: 'pixel_set_color', name: '🎨 Ganti Warna', category: 'Gambar' },
    { id: 'repeat_times', name: '🔁 Ulangi', category: 'Kontrol' },
];

const GRID_SIZE = 8;

export default function PixelArtChallengeEditor({ level, onChange }: PixelArtChallengeEditorProps) {
    const handlePixelClick = (x: number, y: number) => {
        const target = level.target || [];
        const existingIndex = target.findIndex(p => p[0] === x && p[1] === y);

        if (existingIndex >= 0) {
            // Remove pixel
            const newTarget = [...target];
            newTarget.splice(existingIndex, 1);
            onChange({ ...level, target: newTarget });
        } else {
            // Add pixel
            onChange({ ...level, target: [...target, [x, y]] });
        }
    };

    const toggleBlock = (blockId: string) => {
        const allowed = level.allowedBlocks || [];
        if (allowed.includes(blockId)) {
            onChange({ ...level, allowedBlocks: allowed.filter(b => b !== blockId) });
        } else {
            onChange({ ...level, allowedBlocks: [...allowed, blockId] });
        }
    };

    return (
        <div className="space-y-6">
            {/* Target Pattern Editor */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🎨 Pola Target (Klik untuk set pixel)</label>
                <div className="flex justify-center bg-[#1a1a35] p-4 rounded-xl">
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            const isActive = level.target?.some(p => p[0] === x && p[1] === y);

                            return (
                                <button
                                    key={i}
                                    onClick={() => handlePixelClick(x, y)}
                                    className={`w-8 h-8 rounded-sm border transition-all ${isActive
                                        ? 'bg-red-500 border-red-400'
                                        : 'bg-[#2d2d5a] border-white/5 hover:bg-white/10'
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => onChange({ ...level, target: [] })}
                        className="text-xs text-red-400 hover:text-red-300"
                    >
                        Sapu Bersih
                    </button>
                </div>
            </div>

            {/* Allowed Blocks */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🧩 Blok yang Diizinkan</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_BLOCKS.map(block => (
                        <button
                            key={block.id}
                            onClick={() => toggleBlock(block.id)}
                            className={`px-3 py-2 rounded-lg text-sm ${level.allowedBlocks?.includes(block.id) ? 'bg-purple-600' : 'bg-[#1a1a35]'
                                }`}
                        >
                            {block.name}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Kosongkan untuk mengizinkan semua blok</p>
            </div>

            {/* Max Blocks Limit */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🛑 Batas Jumlah Blok (Opsional)</label>
                <input
                    type="number"
                    min="1"
                    value={level.maxBlocks || ''}
                    onChange={(e) => onChange({ ...level, maxBlocks: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Contoh: 10 (Kosongkan jika tidak ada batas)"
                    className="w-full bg-[#1a1a35] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>
        </div>
    );
}
