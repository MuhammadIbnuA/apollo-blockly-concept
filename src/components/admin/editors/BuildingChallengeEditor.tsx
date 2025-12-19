/**
 * BlockyKids - Building Challenge Editor
 * Visual editor for Building phase challenges
 */

'use client';

import { useState, useMemo } from 'react';
import { BuildingLevel } from '@/types';

interface BuildingChallengeEditorProps {
    level: Partial<BuildingLevel>;
    onChange: (level: Partial<BuildingLevel>) => void;
}

const AVAILABLE_COLORS = [
    { id: '#e74c3c', name: '🔴 Merah' },
    { id: '#e67e22', name: '🟠 Oranye' },
    { id: '#f1c40f', name: '🟡 Kuning' },
    { id: '#2ecc71', name: '🟢 Hijau' },
    { id: '#3498db', name: '🔵 Biru' },
    { id: '#9b59b6', name: '🟣 Ungu' },
    { id: '#ecf0f1', name: '⚪ Putih' },
    { id: '#795548', name: '🟤 Coklat' },
    { id: '#95a5a6', name: '⬛ Abu-abu' },
];

// Isometric helpers
const TILE_WIDTH = 30;
const TILE_HEIGHT = 15;

function toIsometric(x: number, y: number, z: number): { screenX: number; screenY: number } {
    const screenX = (x - z) * (TILE_WIDTH / 2);
    const screenY = (x + z) * (TILE_HEIGHT / 2) - y * TILE_HEIGHT;
    return { screenX, screenY };
}

export default function BuildingChallengeEditor({ level, onChange }: BuildingChallengeEditorProps) {
    const [selectedColor, setSelectedColor] = useState('#e74c3c');
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: 0 });

    const gridWidth = level.gridSize?.width || 5;
    const gridHeight = level.gridSize?.height || 5;
    const gridDepth = level.gridSize?.depth || 5;

    const targetStructure = level.targetStructure || [];

    const addBlock = () => {
        const exists = targetStructure.some(b =>
            b.x === cursorPos.x && b.y === cursorPos.y && b.z === cursorPos.z
        );
        if (!exists) {
            onChange({
                ...level,
                targetStructure: [...targetStructure, { ...cursorPos, color: selectedColor }]
            });
        }
    };

    const removeBlock = () => {
        onChange({
            ...level,
            targetStructure: targetStructure.filter(b =>
                !(b.x === cursorPos.x && b.y === cursorPos.y && b.z === cursorPos.z)
            )
        });
    };

    const clearAll = () => {
        if (confirm('Hapus semua blok target?')) {
            onChange({ ...level, targetStructure: [] });
        }
    };

    const toggleColor = (colorId: string) => {
        const available = level.availableColors || [];
        if (available.includes(colorId)) {
            onChange({ ...level, availableColors: available.filter(c => c !== colorId) });
        } else {
            onChange({ ...level, availableColors: [...available, colorId] });
        }
    };

    // Sorted blocks for rendering
    const sortedBlocks = useMemo(() => {
        return [...targetStructure].sort((a, b) => (a.x + a.z + a.y) - (b.x + b.z + b.y));
    }, [targetStructure]);

    const canvasWidth = 300;
    const canvasHeight = 220;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight - 60;

    return (
        <div className="space-y-6">
            {/* Grid Size */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Lebar (X)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={gridWidth}
                        onChange={(e) => onChange({ ...level, gridSize: { width: parseInt(e.target.value) || 5, height: gridHeight, depth: gridDepth } })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Tinggi (Y)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={gridHeight}
                        onChange={(e) => onChange({ ...level, gridSize: { width: gridWidth, height: parseInt(e.target.value) || 5, depth: gridDepth } })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Kedalaman (Z)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={gridDepth}
                        onChange={(e) => onChange({ ...level, gridSize: { width: gridWidth, height: gridHeight, depth: parseInt(e.target.value) || 5 } })}
                        className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                    />
                </div>
            </div>

            {/* 3D Builder */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🏗️ Target Struktur</label>

                {/* Cursor Controls */}
                <div className="flex gap-4 mb-3 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">X:</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, x: Math.max(0, p.x - 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">-</button>
                        <span className="w-6 text-center">{cursorPos.x}</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, x: Math.min(gridWidth - 1, p.x + 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">+</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Y:</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, y: Math.max(0, p.y - 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">-</button>
                        <span className="w-6 text-center">{cursorPos.y}</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, y: Math.min(gridHeight - 1, p.y + 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">+</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Z:</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, z: Math.max(0, p.z - 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">-</button>
                        <span className="w-6 text-center">{cursorPos.z}</span>
                        <button onClick={() => setCursorPos(p => ({ ...p, z: Math.min(gridDepth - 1, p.z + 1) }))} className="px-2 py-1 bg-[#1a1a35] rounded">+</button>
                    </div>
                </div>

                {/* Color picker */}
                <div className="flex gap-2 mb-3">
                    {AVAILABLE_COLORS.slice(0, 6).map(color => (
                        <button
                            key={color.id}
                            onClick={() => setSelectedColor(color.id)}
                            className={`w-8 h-8 rounded-lg border-2 ${selectedColor === color.id ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color.id }}
                            title={color.name}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-3">
                    <button onClick={addBlock} className="px-3 py-1 bg-green-600 rounded-lg text-sm">➕ Tambah</button>
                    <button onClick={removeBlock} className="px-3 py-1 bg-red-600 rounded-lg text-sm">🗑️ Hapus</button>
                    <button onClick={clearAll} className="px-3 py-1 bg-gray-600 rounded-lg text-sm">🔄 Clear</button>
                    <span className="ml-auto text-sm text-gray-400">Blok: {targetStructure.length}</span>
                </div>

                {/* Isometric Preview */}
                <div className="bg-black/40 rounded-xl overflow-hidden" style={{ width: canvasWidth, height: canvasHeight }}>
                    <svg width={canvasWidth} height={canvasHeight}>
                        {/* Floor grid */}
                        {Array.from({ length: 4 }).map((_, z) =>
                            Array.from({ length: 4 }).map((_, x) => {
                                const points = [
                                    toIsometric(x, 0, z),
                                    toIsometric(x + 1, 0, z),
                                    toIsometric(x + 1, 0, z + 1),
                                    toIsometric(x, 0, z + 1),
                                ];
                                return (
                                    <polygon
                                        key={`floor-${x}-${z}`}
                                        points={points.map(p => `${centerX + p.screenX},${centerY + p.screenY}`).join(' ')}
                                        fill="rgba(255,255,255,0.05)"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="1"
                                    />
                                );
                            })
                        )}

                        {/* Placed blocks */}
                        {sortedBlocks.map((block, i) => {
                            const { screenX, screenY } = toIsometric(block.x, block.y, block.z);
                            return (
                                <g key={`block-${i}`} transform={`translate(${centerX + screenX}, ${centerY + screenY})`}>
                                    <polygon
                                        points={`${-TILE_WIDTH / 2},0 0,${TILE_HEIGHT} 0,${TILE_HEIGHT * 2} ${-TILE_WIDTH / 2},${TILE_HEIGHT}`}
                                        fill={block.color}
                                        style={{ filter: 'brightness(0.7)' }}
                                    />
                                    <polygon
                                        points={`${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} 0,${TILE_HEIGHT * 2} ${TILE_WIDTH / 2},${TILE_HEIGHT}`}
                                        fill={block.color}
                                        style={{ filter: 'brightness(0.85)' }}
                                    />
                                    <polygon
                                        points={`0,${-TILE_HEIGHT} ${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} ${-TILE_WIDTH / 2},0`}
                                        fill={block.color}
                                    />
                                </g>
                            );
                        })}

                        {/* Cursor */}
                        {(() => {
                            const { screenX, screenY } = toIsometric(cursorPos.x, cursorPos.y, cursorPos.z);
                            return (
                                <polygon
                                    transform={`translate(${centerX + screenX}, ${centerY + screenY})`}
                                    points={`0,${-TILE_HEIGHT} ${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} ${-TILE_WIDTH / 2},0`}
                                    fill="rgba(0,206,201,0.3)"
                                    stroke="#00cec9"
                                    strokeWidth="2"
                                />
                            );
                        })()}
                    </svg>
                </div>
            </div>

            {/* Available Colors for Players */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">🎨 Warna yang Tersedia untuk Pemain</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map(color => (
                        <button
                            key={color.id}
                            onClick={() => toggleColor(color.id)}
                            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${level.availableColors?.includes(color.id) ? 'bg-cyan-600' : 'bg-[#1a1a35]'
                                }`}
                        >
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: color.id }} />
                            {color.name.split(' ')[1]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Min Block Count */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Minimum Jumlah Blok</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={level.requireBlockCount || 0}
                    onChange={(e) => onChange({ ...level, requireBlockCount: parseInt(e.target.value) || 0 })}
                    className="w-32 px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">0 = Gunakan target structure sebagai syarat</p>
            </div>
        </div>
    );
}
