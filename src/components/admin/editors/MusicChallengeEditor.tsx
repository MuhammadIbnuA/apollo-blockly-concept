/**
 * BlockyKids - Music Challenge Editor
 * Visual editor for Music phase challenges
 */

'use client';

import { BaseLevel } from '@/types';

interface MusicLevel extends BaseLevel {
    goal: {
        type: 'notes' | 'sequence' | 'repeat' | 'free';
        required?: string[];
        minNotes?: number;
    };
    allowedBlocks: string[];
}

interface MusicChallengeEditorProps {
    level: Partial<MusicLevel>;
    onChange: (level: Partial<MusicLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'music_play_note', name: '🎵 Mainkan Nada', category: 'Nada' },
    { id: 'music_rest', name: '🛑 Istirahat', category: 'Nada' },
    { id: 'repeat_times', name: '🔁 Ulangi', category: 'Kontrol' },
];

const NOTES = [
    { name: 'Do', note: 'C4' },
    { name: 'Re', note: 'D4' },
    { name: 'Mi', note: 'E4' },
    { name: 'Fa', note: 'F4' },
    { name: 'Sol', note: 'G4' },
    { name: 'La', note: 'A4' },
    { name: 'Si', note: 'B4' },
    { name: 'Do↑', note: 'C5' },
];

export default function MusicChallengeEditor({ level, onChange }: MusicChallengeEditorProps) {
    const handleGoalTypeChange = (type: string) => {
        onChange({
            ...level,
            goal: { ...level.goal, type: type as any, required: [], minNotes: 0 }
        });
    };

    const toggleNoteRequirement = (note: string) => {
        const required = level.goal?.required || [];
        if (required.includes(note)) {
            onChange({
                ...level,
                goal: { ...level.goal, type: level.goal?.type || 'notes', required: required.filter(n => n !== note) }
            });
        } else {
            onChange({
                ...level,
                goal: { ...level.goal, type: level.goal?.type || 'notes', required: [...required, note] }
            });
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
            {/* Goal Config */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🎵 Target Musik</label>
                <div className="bg-[#1a1a35] p-4 rounded-xl space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tipe Target</label>
                        <select
                            value={level.goal?.type || 'free'}
                            onChange={(e) => handleGoalTypeChange(e.target.value)}
                            className="w-full bg-[#252547] px-3 py-2 rounded-lg border border-white/10"
                        >
                            <option value="free">⚪ Bebas (Kreativitas)</option>
                            <option value="notes">🎼 Harus Memuat Nada Tertentu</option>
                            <option value="sequence">🎹 Urutan Nada Spesifik</option>
                            <option value="repeat">🔁 Jumlah Nada Minimal</option>
                        </select>
                    </div>

                    {(level.goal?.type === 'notes' || level.goal?.type === 'sequence') && (
                        <div>
                            <label className="text-xs text-gray-500 mb-2 block">
                                {level.goal.type === 'notes' ? 'Nada yang Wajib Ada:' : 'Urutan Nada:'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {NOTES.map(note => (
                                    <button
                                        key={note.note}
                                        onClick={() => toggleNoteRequirement(note.note)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-all ${level.goal?.required?.includes(note.note)
                                                ? 'bg-purple-600 ring-2 ring-purple-400'
                                                : 'bg-[#252547] hover:bg-[#2d2d5a]'
                                            }`}
                                    >
                                        {note.name}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-400 min-h-[20px]">
                                {level.goal?.required?.join(' - ') || '(Belum ada nada)'}
                            </div>
                        </div>
                    )}

                    {(level.goal?.type === 'repeat' || level.goal?.type === 'free') && (
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Minimal Jumlah Nada</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={level.goal?.minNotes || 5}
                                onChange={(e) => onChange({ ...level, goal: { ...level.goal, type: level.goal?.type || 'free', minNotes: parseInt(e.target.value) } })}
                                className="w-full bg-[#252547] px-3 py-2 rounded-lg border border-white/10"
                            />
                        </div>
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
