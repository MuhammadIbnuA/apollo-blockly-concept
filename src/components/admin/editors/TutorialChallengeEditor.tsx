/**
 * BlockyKids - Tutorial Challenge Editor
 * Visual editor for Tutorial phase challenges
 */

'use client';

import { useState, useCallback } from 'react';
import { BaseLevel } from '@/types';

interface TutorialLevel extends BaseLevel {
    instruction: string;
    allowedBlocks: string[];
    gridSize: { cols: number; rows: number };
    startPosition: { x: number; y: number };
    startDirection: 'up' | 'down' | 'left' | 'right';
    goalPosition?: { x: number; y: number };
    stars?: { x: number; y: number }[];
    requireGoal?: boolean;
    requireAllStars?: boolean;
    requireBlockCount?: number;
    requireRun?: boolean;
}

interface TutorialChallengeEditorProps {
    level: Partial<TutorialLevel>;
    onChange: (level: Partial<TutorialLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'move_forward', name: '⬆️ Maju', category: 'Gerakan' },
    { id: 'turn_left', name: '↩️ Belok Kiri', category: 'Gerakan' },
    { id: 'turn_right', name: '↪️ Belok Kanan', category: 'Gerakan' },
    { id: 'collect_star', name: '⭐ Ambil Bintang', category: 'Aksi' },
    { id: 'repeat_times', name: '🔁 Ulangi', category: 'Kontrol' },
];

const DIRECTIONS = [
    { id: 'up', name: '⬆️ Atas' },
    { id: 'down', name: '⬇️ Bawah' },
    { id: 'left', name: '⬅️ Kiri' },
    { id: 'right', name: '➡️ Kanan' },
];

export default function TutorialChallengeEditor({ level, onChange }: TutorialChallengeEditorProps) {
    const [selectedTool, setSelectedTool] = useState<'start' | 'goal' | 'star' | null>(null);

    const gridCols = level.gridSize?.cols || 5;
    const gridRows = level.gridSize?.rows || 5;

    const handleGridClick = useCallback((x: number, y: number) => {
        if (selectedTool === 'start') {
            onChange({ ...level, startPosition: { x, y } });
        } else if (selectedTool === 'goal') {
            onChange({ ...level, goalPosition: { x, y }, requireGoal: true });
        } else if (selectedTool === 'star') {
            const stars = level.stars || [];
            const existing = stars.findIndex(s => s.x === x && s.y === y);
            if (existing >= 0) {
                onChange({ ...level, stars: stars.filter((_, i) => i !== existing) });
            } else {
                onChange({ ...level, stars: [...stars, { x, y }], requireAllStars: true });
            }
        }
    }, [selectedTool, level, onChange]);

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
            {/* Instruction */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">📌 Instruksi Level</label>
                <input
                    type="text"
                    value={level.instruction || ''}
                    onChange={(e) => onChange({ ...level, instruction: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    placeholder="Contoh: Buat robot sampai ke finish!"
                />
            </div>

            {/* Grid Size */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Kolom (X)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={gridCols}
                        onChange={(e) => onChange({ ...level, gridSize: { cols: parseInt(e.target.value) || 5, rows: gridRows } })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Baris (Y)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={gridRows}
                        onChange={(e) => onChange({ ...level, gridSize: { cols: gridCols, rows: parseInt(e.target.value) || 5 } })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* Visual Grid Editor */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🗺️ Editor Grid (Klik untuk menempatkan)</label>

                {/* Tool Selection */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'start' ? null : 'start')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'start' ? 'bg-blue-600' : 'bg-[#1a1a35]'}`}
                    >
                        🤖 Start
                    </button>
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'goal' ? null : 'goal')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'goal' ? 'bg-green-600' : 'bg-[#1a1a35]'}`}
                    >
                        🏁 Goal
                    </button>
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'star' ? null : 'star')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'star' ? 'bg-yellow-600' : 'bg-[#1a1a35]'}`}
                    >
                        ⭐ Star
                    </button>
                </div>

                {/* Grid */}
                <div
                    className="inline-grid gap-1 p-2 bg-black/30 rounded-lg"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
                >
                    {Array.from({ length: gridCols * gridRows }).map((_, i) => {
                        const x = i % gridCols;
                        const y = Math.floor(i / gridCols);
                        const isStart = level.startPosition?.x === x && level.startPosition?.y === y;
                        const isGoal = level.goalPosition?.x === x && level.goalPosition?.y === y;
                        const isStar = level.stars?.some(s => s.x === x && s.y === y);

                        return (
                            <button
                                key={i}
                                onClick={() => handleGridClick(x, y)}
                                className={`w-10 h-10 rounded flex items-center justify-center text-lg transition-all hover:bg-white/10 ${isStart ? 'bg-blue-900/50 ring-2 ring-blue-500' :
                                        isGoal ? 'bg-green-900/50 ring-2 ring-green-500' :
                                            'bg-[#1a1a35]'
                                    }`}
                            >
                                {isStart && '🤖'}
                                {isGoal && !isStart && '🏁'}
                                {isStar && !isStart && !isGoal && '⭐'}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Start Direction */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Arah Awal Robot</label>
                <div className="flex gap-2">
                    {DIRECTIONS.map(dir => (
                        <button
                            key={dir.id}
                            onClick={() => onChange({ ...level, startDirection: dir.id as 'up' | 'down' | 'left' | 'right' })}
                            className={`px-3 py-2 rounded-lg ${level.startDirection === dir.id ? 'bg-purple-600' : 'bg-[#1a1a35]'}`}
                        >
                            {dir.name}
                        </button>
                    ))}
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

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={level.requireRun || false}
                        onChange={(e) => onChange({ ...level, requireRun: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">Wajib Jalankan Program</span>
                </label>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Min. Jumlah Blok</label>
                    <input
                        type="number"
                        min={0}
                        max={20}
                        value={level.requireBlockCount || 0}
                        onChange={(e) => onChange({ ...level, requireBlockCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
