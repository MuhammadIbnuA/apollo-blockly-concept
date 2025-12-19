/**
 * BlockyKids - Animation Challenge Editor
 * Visual editor for Animation phase challenges
 */

'use client';

import { useState } from 'react';
import { BaseLevel, Sprite } from '@/types';

interface AnimationLevel extends BaseLevel {
    sprites: Sprite[];
    goal: {
        type: 'position' | 'action' | 'rotation' | 'speech' | 'free';
        x?: number;
        y?: number;
        tolerance?: number;
        action?: string;
        degrees?: number;
    };
    allowedBlocks: string[];
}

interface AnimationChallengeEditorProps {
    level: Partial<AnimationLevel>;
    onChange: (level: Partial<AnimationLevel>) => void;
}

const AVAILABLE_BLOCKS = [
    { id: 'anim_move_right', name: '➡️ Gerak Kanan', category: 'Gerakan' },
    { id: 'anim_move_left', name: '⬅️ Gerak Kiri', category: 'Gerakan' },
    { id: 'anim_move_up', name: '⬆️ Gerak Atas', category: 'Gerakan' },
    { id: 'anim_move_down', name: '⬇️ Gerak Bawah', category: 'Gerakan' },
    { id: 'anim_jump', name: '⬆️ Lompat', category: 'Gerakan' },
    { id: 'anim_rotate', name: '🔄 Putar', category: 'Tampilan' },
    { id: 'anim_scale', name: '🔍 Skala', category: 'Tampilan' },
    { id: 'anim_say', name: '💬 Bicara', category: 'Komunikasi' },
    { id: 'repeat_times', name: '🔁 Ulangi', category: 'Kontrol' },
    { id: 'wait', name: '⏱️ Tunggu', category: 'Kontrol' },
];

const AVAILABLE_SPRITES = [
    { id: 'cat', emoji: '🐱', name: 'Kucing' },
    { id: 'dog', emoji: '🐕', name: 'Anjing' },
    { id: 'bird', emoji: '🐦', name: 'Burung' },
    { id: 'rabbit', emoji: '🐰', name: 'Kelinci' },
    { id: 'star', emoji: '⭐', name: 'Bintang' },
    { id: 'bee', emoji: '🐝', name: 'Lebah' },
];

export default function AnimationChallengeEditor({ level, onChange }: AnimationChallengeEditorProps) {
    const handleAddSprite = () => {
        const sprites = level.sprites || [];
        // Add random sprite
        const newSprite: Sprite = {
            id: 'cat',
            name: 'Kucing',
            emoji: '🐱',
            x: 50 + (sprites.length * 50),
            y: 150,
            initialX: 50 + (sprites.length * 50),
            initialY: 150,
            rotation: 0,
            scale: 1,
            visible: true,
            speech: null,
            totalRotation: 0,
            originalId: 'cat',
            image: undefined
        };
        onChange({ ...level, sprites: [...sprites, newSprite] });
    };

    const updateSprite = (index: number, updates: Partial<Sprite>) => {
        const sprites = [...(level.sprites || [])];
        sprites[index] = { ...sprites[index], ...updates };
        onChange({ ...level, sprites });
    };

    const removeSprite = (index: number) => {
        const sprites = [...(level.sprites || [])];
        sprites.splice(index, 1);
        onChange({ ...level, sprites });
    };

    const updateGoal = (updates: Partial<AnimationLevel['goal']>) => {
        const baseGoal = level.goal || { type: 'free' };
        const newGoal = { ...baseGoal, ...updates };
        onChange({ ...level, goal: newGoal as AnimationLevel['goal'] });
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
            {/* Sprites Management */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🎭 Karakter (Sprite)</label>
                <div className="space-y-3">
                    {(level.sprites || []).map((sprite, idx) => (
                        <div key={idx} className="bg-[#1a1a35] p-3 rounded-lg flex items-center gap-3">
                            <select
                                value={sprite.id}
                                onChange={(e) => {
                                    const t = AVAILABLE_SPRITES.find(s => s.id === e.target.value);
                                    if (t) updateSprite(idx, { id: t.id, emoji: t.emoji });
                                }}
                                className="bg-[#252547] px-2 py-1 rounded border border-white/10"
                            >
                                {AVAILABLE_SPRITES.map(s => (
                                    <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">X:</span>
                                <input
                                    type="number"
                                    value={sprite.x}
                                    onChange={(e) => updateSprite(idx, { x: parseInt(e.target.value) || 0 })}
                                    className="w-16 bg-[#252547] px-2 py-1 rounded border border-white/10 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Y:</span>
                                <input
                                    type="number"
                                    value={sprite.y}
                                    onChange={(e) => updateSprite(idx, { y: parseInt(e.target.value) || 0 })}
                                    className="w-16 bg-[#252547] px-2 py-1 rounded border border-white/10 text-sm"
                                />
                            </div>

                            <button
                                onClick={() => removeSprite(idx)}
                                className="ml-auto text-red-400 hover:text-red-300 px-2"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddSprite}
                        className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
                    >
                        + Tambah Sprite
                    </button>
                </div>
            </div>

            {/* Goal Configuration */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🎯 Target / Tujuan</label>
                <div className="bg-[#1a1a35] p-3 rounded-lg space-y-3">
                    <select
                        value={level.goal?.type || 'free'}
                        onChange={(e) => updateGoal({ type: e.target.value as 'position' | 'action' | 'rotation' | 'speech' | 'free' })}
                        className="w-full bg-[#252547] px-3 py-2 rounded-lg border border-white/10 mb-2"
                    >
                        <option value="free">⚪ Bebas (Sandbox)</option>
                        <option value="position">📍 Capai Posisi</option>
                        <option value="action">🎬 Lakukan Aksi</option>
                        <option value="rotation">🔄 Rotasi Tertentu</option>
                        <option value="speech">💬 Harus Bicara</option>
                    </select>

                    {level.goal?.type === 'position' && (
                        <div className="flex gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Target X</label>
                                <input
                                    type="number"
                                    value={level.goal.x || 0}
                                    onChange={(e) => updateGoal({ x: parseInt(e.target.value) })}
                                    className="w-full bg-[#252547] px-2 py-1 rounded border border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Target Y</label>
                                <input
                                    type="number"
                                    value={level.goal.y || 0}
                                    onChange={(e) => updateGoal({ y: parseInt(e.target.value) })}
                                    className="w-full bg-[#252547] px-2 py-1 rounded border border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Toleransi</label>
                                <input
                                    type="number"
                                    value={level.goal.tolerance || 50}
                                    onChange={(e) => updateGoal({ tolerance: parseInt(e.target.value) })}
                                    className="w-full bg-[#252547] px-2 py-1 rounded border border-white/10"
                                />
                            </div>
                        </div>
                    )}

                    {level.goal?.type === 'action' && (
                        <div>
                            <label className="text-xs text-gray-500">Aksi Wajib</label>
                            <select
                                value={level.goal.action || 'jump'}
                                onChange={(e) => updateGoal({ action: e.target.value })}
                                className="w-full bg-[#252547] px-2 py-1 rounded border border-white/10"
                            >
                                <option value="jump">Lompat</option>
                                <option value="speech">Bicara</option>
                            </select>
                        </div>
                    )}

                    {level.goal?.type === 'rotation' && (
                        <div>
                            <label className="text-xs text-gray-500">Derajat Rotasi (Total)</label>
                            <input
                                type="number"
                                value={level.goal.degrees || 360}
                                onChange={(e) => updateGoal({ degrees: parseInt(e.target.value) })}
                                className="w-full bg-[#252547] px-2 py-1 rounded border border-white/10"
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
