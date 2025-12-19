/**
 * BlockyKids - Robot Challenge Editor
 * Visual editor for Robot phase challenges
 */

'use client';

import { useState, useCallback } from 'react';
import { BaseLevel } from '@/types';

interface RobotLevel extends BaseLevel {
    width: number;
    height: number;
    grid: any[][];
    robot: { x: number; y: number; direction: string };
    goal: { x: number; y: number };
    stars: { x: number; y: number }[];
    allowedBlocks: string[];
}

interface RobotChallengeEditorProps {
    level: Partial<RobotLevel>;
    onChange: (level: Partial<RobotLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'move_forward', name: '⬆️ Maju', category: 'Gerakan' },
    { id: 'turn_left', name: '↩️ Belok Kiri', category: 'Gerakan' },
    { id: 'turn_right', name: '↪️ Belok Kanan', category: 'Gerakan' },
    { id: 'collect_star', name: '⭐ Ambil Bintang', category: 'Aksi' },
    { id: 'repeat_times', name: '🔁 Ulangi', category: 'Kontrol' },
    { id: 'wait', name: '⏱️ Tunggu', category: 'Aksi' },
];

const DIRECTIONS = [
    { id: 'north', name: '⬆️ Utara' },
    { id: 'south', name: '⬇️ Selatan' },
    { id: 'west', name: '⬅️ Barat' },
    { id: 'east', name: '➡️ Timur' },
];

export default function RobotChallengeEditor({ level, onChange }: RobotChallengeEditorProps) {
    const [selectedTool, setSelectedTool] = useState<'robot' | 'goal' | 'star' | null>(null);

    const gridWidth = level.width || 5;
    const gridHeight = level.height || 3;

    // Initialize robot if missing
    if (!level.robot) {
        onChange({ ...level, robot: { x: 0, y: 0, direction: 'east' } });
    }
    // Initialize goal if missing
    if (!level.goal) {
        onChange({ ...level, goal: { x: gridWidth - 1, y: 0 } });
    }

    const handleGridClick = useCallback((x: number, y: number) => {
        if (selectedTool === 'robot') {
            onChange({ ...level, robot: { ...level.robot, x, y } as any });
        } else if (selectedTool === 'goal') {
            onChange({ ...level, goal: { x, y } });
        } else if (selectedTool === 'star') {
            const stars = level.stars || [];
            const existing = stars.findIndex(s => s.x === x && s.y === y);
            if (existing >= 0) {
                onChange({ ...level, stars: stars.filter((_, i) => i !== existing) });
            } else {
                onChange({ ...level, stars: [...stars, { x, y }] });
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
            {/* Grid Size */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Lebar (X)</label>
                    <input
                        type="number"
                        min={3}
                        max={10}
                        value={gridWidth}
                        onChange={(e) => onChange({ ...level, width: parseInt(e.target.value) || 5 })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Tinggi (Y)</label>
                    <input
                        type="number"
                        min={3}
                        max={10}
                        value={gridHeight}
                        onChange={(e) => onChange({ ...level, height: parseInt(e.target.value) || 3 })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* Visual Grid Editor */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🗺️ Editor Peta (Klik untuk menempatkan)</label>

                {/* Tool Selection */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'robot' ? null : 'robot')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'robot' ? 'bg-blue-600' : 'bg-[#1a1a35]'}`}
                    >
                        🤖 Robot
                    </button>
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'goal' ? null : 'goal')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'goal' ? 'bg-green-600' : 'bg-[#1a1a35]'}`}
                    >
                        🏁 Finish
                    </button>
                    <button
                        onClick={() => setSelectedTool(selectedTool === 'star' ? null : 'star')}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedTool === 'star' ? 'bg-yellow-600' : 'bg-[#1a1a35]'}`}
                    >
                        ⭐ Bintang
                    </button>
                </div>

                {/* Grid */}
                <div className="overflow-x-auto">
                    <div
                        className="inline-grid gap-1 p-2 bg-black/30 rounded-lg"
                        style={{ gridTemplateColumns: `repeat(${gridWidth}, 1fr)` }}
                    >
                        {Array.from({ length: gridHeight * gridWidth }).map((_, i) => {
                            const x = i % gridWidth;
                            const y = Math.floor(i / gridWidth);
                            const isRobot = level.robot?.x === x && level.robot?.y === y;
                            const isGoal = level.goal?.x === x && level.goal?.y === y;
                            const isStar = level.stars?.some(s => s.x === x && s.y === y);

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleGridClick(x, y)}
                                    className={`w-12 h-12 rounded flex items-center justify-center text-xl transition-all hover:bg-white/10 ${isRobot ? 'bg-blue-900/50 ring-2 ring-blue-500' :
                                            isGoal ? 'bg-green-900/50 ring-2 ring-green-500' :
                                                'bg-[#2d2d5a]'
                                        }`}
                                >
                                    {isRobot && <span style={{ transform: `rotate(${level.robot?.direction === 'north' ? -90 : level.robot?.direction === 'south' ? 90 : level.robot?.direction === 'west' ? 180 : 0}deg)` }}>🤖</span>}
                                    {isGoal && !isRobot && '🏁'}
                                    {isStar && !isRobot && !isGoal && '⭐'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Robot Direction */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Arah Awal Robot</label>
                <div className="flex gap-2">
                    {DIRECTIONS.map(dir => (
                        <button
                            key={dir.id}
                            onClick={() => onChange({ ...level, robot: { ...level.robot, direction: dir.id } as any })}
                            className={`px-3 py-2 rounded-lg ${level.robot?.direction === dir.id ? 'bg-purple-600' : 'bg-[#1a1a35]'}`}
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
        </div>
    );
}
