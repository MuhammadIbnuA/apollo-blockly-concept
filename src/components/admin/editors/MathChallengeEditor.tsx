/**
 * BlockyKids - Math Challenge Editor
 * Visual editor for Math phase challenges
 */

'use client';

import { BaseLevel } from '@/types';

interface MathLevel extends BaseLevel {
    expectedOutput: string[]; // List of expected printed values
    allowedBlocks: string[];
}

interface MathChallengeEditorProps {
    level: Partial<MathLevel>;
    onChange: (level: Partial<MathLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'math_number', name: '🔢 Angka', category: 'Angka' },
    { id: 'math_add', name: '➕ Tambah', category: 'Angka' },
    { id: 'math_subtract', name: '➖ Kurang', category: 'Angka' },
    { id: 'math_multiply', name: '✖️ Kali', category: 'Angka' },
    { id: 'math_set_var', name: '📦 Set Variabel', category: 'Variabel' },
    { id: 'math_print', name: '📤 Print/Tampil', category: 'Output' },
];

export default function MathChallengeEditor({ level, onChange }: MathChallengeEditorProps) {
    const handleAddOutput = () => {
        const expected = level.expectedOutput || [];
        onChange({ ...level, expectedOutput: [...expected, '0'] });
    };

    const updateOutput = (index: number, value: string) => {
        const expected = [...(level.expectedOutput || [])];
        expected[index] = value;
        onChange({ ...level, expectedOutput: expected });
    };

    const removeOutput = (index: number) => {
        const expected = [...(level.expectedOutput || [])];
        expected.splice(index, 1);
        onChange({ ...level, expectedOutput: expected });
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
            {/* Expected Output Config */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">📤 Output yang Diharapkan</label>
                <div className="bg-[#1a1a35] p-4 rounded-xl space-y-3">
                    <p className="text-xs text-gray-500 mb-2">Masukkan nilai yang harus ditampilkan program (urutan penting):</p>

                    {(level.expectedOutput || []).map((val, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <span className="text-gray-400 w-6 text-sm">#{idx + 1}</span>
                            <input
                                type="text"
                                value={val}
                                onChange={(e) => updateOutput(idx, e.target.value)}
                                className="flex-1 bg-[#252547] px-3 py-2 rounded-lg border border-white/10"
                                placeholder="Contoh: 10"
                            />
                            <button
                                onClick={() => removeOutput(idx)}
                                className="text-red-400 hover:text-red-300 p-2"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={handleAddOutput}
                        className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
                    >
                        + Tambah Syarat Output
                    </button>
                    {(level.expectedOutput?.length === 0 || !level.expectedOutput) && (
                        <p className="text-center text-xs text-yellow-500 mt-2">
                            Mode Bebas: Jika kosong, semua output yang valid akan dianggap benar.
                        </p>
                    )}
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
        </div>
    );
}
