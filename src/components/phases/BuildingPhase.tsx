/**
 * BlockyKids - Building Phase
 * Fase membangun struktur 3D dengan kode
 * Dengan Dual Mode: Block dan Python Code
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { BuildingLevel } from '@/types';
import { Button } from '@/components/ui';
import { challengeService } from '@/services/challengeService';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import {
    executePythonBuildingCode,
    getBuildingPythonTemplate,
    countBuildingActions,
    BuildingAction
} from '@/services/codeExecutor';

interface BuildingPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    initialLevel?: BuildingLevel;
}

// Block structure for placed blocks
interface PlacedBlock {
    x: number;
    y: number;
    z: number;
    color: string;
}

// Block definitions for toolbox
const BLOCK_DEFINITIONS = {
    build_place_block: { category: '🧱 Blok', colour: '#00cec9' },
    build_remove_block: { category: '🧱 Blok', colour: '#00cec9' },
    build_set_color: { category: '🎨 Warna', colour: '#e67e22' },
    build_move_x: { category: '📍 Posisi', colour: '#6c5ce7' },
    build_move_y: { category: '📍 Posisi', colour: '#6c5ce7' },
    build_move_z: { category: '📍 Posisi', colour: '#6c5ce7' },
    build_goto: { category: '📍 Posisi', colour: '#6c5ce7' },
    repeat_times: { category: '🔁 Kontrol', colour: '#9C27B0' },
};

// Generate toolbox
function generateToolbox(allowedBlocks: string[]) {
    if (allowedBlocks.length === 0) {
        // Show all blocks
        return {
            kind: 'categoryToolbox' as const,
            contents: [
                {
                    kind: 'category' as const,
                    name: '🧱 Blok',
                    colour: '#00cec9',
                    contents: [
                        { kind: 'block' as const, type: 'build_place_block' },
                        { kind: 'block' as const, type: 'build_remove_block' },
                    ],
                },
                {
                    kind: 'category' as const,
                    name: '🎨 Warna',
                    colour: '#e67e22',
                    contents: [
                        { kind: 'block' as const, type: 'build_set_color' },
                    ],
                },
                {
                    kind: 'category' as const,
                    name: '📍 Posisi',
                    colour: '#6c5ce7',
                    contents: [
                        { kind: 'block' as const, type: 'build_move_x' },
                        { kind: 'block' as const, type: 'build_move_y' },
                        { kind: 'block' as const, type: 'build_move_z' },
                        { kind: 'block' as const, type: 'build_goto' },
                    ],
                },
                {
                    kind: 'category' as const,
                    name: '🔁 Kontrol',
                    colour: '#9C27B0',
                    contents: [
                        { kind: 'block' as const, type: 'repeat_times' },
                    ],
                },
            ],
        };
    }

    const uniqueBlocks = [...new Set(allowedBlocks)];
    const categories: Record<string, { colour: string; blocks: string[] }> = {};

    uniqueBlocks.forEach(blockType => {
        const def = BLOCK_DEFINITIONS[blockType as keyof typeof BLOCK_DEFINITIONS];
        if (def) {
            if (!categories[def.category]) {
                categories[def.category] = { colour: def.colour, blocks: [] };
            }
            categories[def.category].blocks.push(blockType);
        }
    });

    return {
        kind: 'categoryToolbox' as const,
        contents: Object.entries(categories).map(([name, data]) => ({
            kind: 'category' as const,
            name,
            colour: data.colour,
            contents: data.blocks.map(type => ({ kind: 'block' as const, type })),
        })),
    };
}

// Building Levels
const DEFAULT_LEVELS: BuildingLevel[] = [
    {
        id: 1,
        name: 'Letakkan Blok',
        difficulty: 'easy',
        description: 'Belajar meletakkan blok pertamamu',
        hint: 'Seret blok "Taruh Blok" ke area kerja dan jalankan!',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#e74c3c'],
        requireBlockCount: 1,
    },
    {
        id: 2,
        name: 'Menara Kecil',
        difficulty: 'easy',
        description: 'Bangun menara 3 blok ke atas',
        hint: 'Gunakan "Gerak Y" untuk naik, lalu "Taruh Blok"',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#e74c3c', '#3498db'],
        targetStructure: [
            { x: 0, y: 0, z: 0, color: '#e74c3c' },
            { x: 0, y: 1, z: 0, color: '#e74c3c' },
            { x: 0, y: 2, z: 0, color: '#e74c3c' },
        ],
    },
    {
        id: 3,
        name: 'Baris Blok',
        difficulty: 'easy',
        description: 'Buat baris 4 blok horizontal',
        hint: 'Taruh blok, gerak X, taruh lagi - ulangi!',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#2ecc71'],
        targetStructure: [
            { x: 0, y: 0, z: 0, color: '#2ecc71' },
            { x: 1, y: 0, z: 0, color: '#2ecc71' },
            { x: 2, y: 0, z: 0, color: '#2ecc71' },
            { x: 3, y: 0, z: 0, color: '#2ecc71' },
        ],
    },
    {
        id: 4,
        name: 'Warna Warni',
        difficulty: 'easy',
        description: 'Gunakan warna berbeda untuk setiap blok',
        hint: 'Pilih warna dengan "Set Warna" sebelum taruh blok',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'],
        requireBlockCount: 4,
    },
    {
        id: 5,
        name: 'Tangga',
        difficulty: 'medium',
        description: 'Bangun tangga naik 4 level',
        hint: 'Setiap langkahnya: taruh blok, gerak X, gerak Y',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#795548'],
        targetStructure: [
            { x: 0, y: 0, z: 0, color: '#795548' },
            { x: 1, y: 1, z: 0, color: '#795548' },
            { x: 2, y: 2, z: 0, color: '#795548' },
            { x: 3, y: 3, z: 0, color: '#795548' },
        ],
    },
    {
        id: 6,
        name: 'Tembok',
        difficulty: 'medium',
        description: 'Bangun tembok 3x3',
        hint: 'Gunakan "Ulangi" untuk efisiensi! Buat baris dulu, lalu naik.',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#95a5a6'],
        targetStructure: [
            // Row 0
            { x: 0, y: 0, z: 0, color: '#95a5a6' },
            { x: 1, y: 0, z: 0, color: '#95a5a6' },
            { x: 2, y: 0, z: 0, color: '#95a5a6' },
            // Row 1
            { x: 0, y: 1, z: 0, color: '#95a5a6' },
            { x: 1, y: 1, z: 0, color: '#95a5a6' },
            { x: 2, y: 1, z: 0, color: '#95a5a6' },
            // Row 2
            { x: 0, y: 2, z: 0, color: '#95a5a6' },
            { x: 1, y: 2, z: 0, color: '#95a5a6' },
            { x: 2, y: 2, z: 0, color: '#95a5a6' },
        ],
    },
    {
        id: 7,
        name: 'Piramida',
        difficulty: 'hard',
        description: 'Bangun piramida 3 tingkat',
        hint: 'Level bawah 3x3, tengah 2x2, atas 1 blok',
        gridSize: { width: 5, height: 5, depth: 5 },
        availableColors: ['#f1c40f'],
        targetStructure: [
            // Level 0 (3x3)
            { x: 0, y: 0, z: 0, color: '#f1c40f' },
            { x: 1, y: 0, z: 0, color: '#f1c40f' },
            { x: 2, y: 0, z: 0, color: '#f1c40f' },
            { x: 0, y: 0, z: 1, color: '#f1c40f' },
            { x: 1, y: 0, z: 1, color: '#f1c40f' },
            { x: 2, y: 0, z: 1, color: '#f1c40f' },
            { x: 0, y: 0, z: 2, color: '#f1c40f' },
            { x: 1, y: 0, z: 2, color: '#f1c40f' },
            { x: 2, y: 0, z: 2, color: '#f1c40f' },
            // Level 1 (center 2x2) - offset by 0.5
            { x: 0, y: 1, z: 0, color: '#f1c40f' },
            { x: 1, y: 1, z: 0, color: '#f1c40f' },
            { x: 0, y: 1, z: 1, color: '#f1c40f' },
            { x: 1, y: 1, z: 1, color: '#f1c40f' },
            // Level 2 (top 1)
            { x: 0, y: 2, z: 0, color: '#f1c40f' },
        ],
    },
    {
        id: 8,
        name: 'Kreasi Bebas',
        difficulty: 'free',
        description: 'Bebas berkreasi! Bangun apapun yang kamu mau.',
        hint: 'Gunakan semua blok dan warna yang tersedia',
        gridSize: { width: 8, height: 8, depth: 8 },
        availableColors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#ecf0f1', '#795548', '#95a5a6'],
    },
];

// Isometric rendering helper
const TILE_WIDTH = 40;
const TILE_HEIGHT = 20;

function toIsometric(x: number, y: number, z: number): { screenX: number; screenY: number } {
    const screenX = (x - z) * (TILE_WIDTH / 2);
    const screenY = (x + z) * (TILE_HEIGHT / 2) - y * TILE_HEIGHT;
    return { screenX, screenY };
}

export default function BuildingPhase({ onLevelComplete, showToast, initialLevel }: BuildingPhaseProps) {
    const [levels, setLevels] = useState<BuildingLevel[]>(initialLevel ? [initialLevel] : DEFAULT_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);

    // Load custom levels on mount (only if not in single level mode)
    useEffect(() => {
        if (initialLevel) return;

        const fetchCustomChallenges = async () => {
            try {
                const challenges = await challengeService.getAll('building');
                if (challenges.length > 0) {
                    const customLevels = challenges.map(c => ({
                        ...(c.config as unknown as BuildingLevel),
                        id: c.id, // Use DB ID
                        name: c.title,
                        difficulty: c.difficulty as any,
                        description: c.description || '',
                    }));
                    setLevels([...DEFAULT_LEVELS, ...customLevels]);
                }
            } catch (error) {
                console.error('Failed to load custom challenges:', error);
            }
        };

        fetchCustomChallenges();
    }, []);
    const [currentCode, setCurrentCode] = useState('');
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');

    // Building state
    const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: 0 });
    const [currentColor, setCurrentColor] = useState('#e74c3c');
    const [isRunning, setIsRunning] = useState(false);

    // Python output
    const [pythonError, setPythonError] = useState<string>('');

    const level = levels[currentLevel];

    // Allowed blocks based on level
    const allowedBlocks = useMemo(() => {
        if (level.difficulty === 'free') return [];
        if (level.id === 1) return ['build_place_block'];
        if (level.id === 2) return ['build_place_block', 'build_move_y'];
        if (level.id === 3) return ['build_place_block', 'build_move_x'];
        if (level.id === 4) return ['build_place_block', 'build_set_color', 'build_move_x'];
        return ['build_place_block', 'build_remove_block', 'build_set_color', 'build_move_x', 'build_move_y', 'build_move_z', 'build_goto', 'repeat_times'];
    }, [level]);

    const currentToolbox = useMemo(() => generateToolbox(allowedBlocks), [allowedBlocks]);

    const pythonTemplate = useMemo(() => {
        return getBuildingPythonTemplate(level.id, level.name, level.description);
    }, [level.id, level.name, level.description]);

    // Reset level
    const resetLevel = useCallback(() => {
        setPlacedBlocks([]);
        setCursorPos({ x: 0, y: 0, z: 0 });
        setCurrentColor('#e74c3c');
        setPythonError('');
    }, []);

    // Count blocks in code (Block mode)
    const countBlocksInCode = useCallback((code: string): number => {
        let count = 0;
        count += (code.match(/buildPlaceBlock\(\)/g) || []).length;
        count += (code.match(/buildRemoveBlock\(\)/g) || []).length;
        count += (code.match(/buildMoveX\(/g) || []).length;
        count += (code.match(/buildMoveY\(/g) || []).length;
        count += (code.match(/buildMoveZ\(/g) || []).length;
        count += (code.match(/buildSetColor\(/g) || []).length;
        count += (code.match(/buildGoto\(/g) || []).length;
        count += (code.match(/for \(let i = 0/g) || []).length;
        return count;
    }, []);

    // Execute actions (shared by both modes)
    const executeActions = useCallback(async (actions: BuildingAction[]) => {
        let pos = { x: 0, y: 0, z: 0 };
        let color = '#e74c3c';
        const blocks: PlacedBlock[] = [];

        for (const action of actions) {
            switch (action.type) {
                case 'place':
                    const newBlock = { x: pos.x, y: pos.y, z: pos.z, color: action.color || color };
                    // Don't add duplicate at same position
                    if (!blocks.some(b => b.x === newBlock.x && b.y === newBlock.y && b.z === newBlock.z)) {
                        blocks.push(newBlock);
                        setPlacedBlocks([...blocks]);
                    }
                    await new Promise(r => setTimeout(r, 150));
                    break;
                case 'remove':
                    const idx = blocks.findIndex(b => b.x === pos.x && b.y === pos.y && b.z === pos.z);
                    if (idx !== -1) {
                        blocks.splice(idx, 1);
                        setPlacedBlocks([...blocks]);
                    }
                    await new Promise(r => setTimeout(r, 100));
                    break;
                case 'move_x':
                    pos.x += action.x || 1;
                    pos.x = Math.max(0, Math.min(level.gridSize.width - 1, pos.x));
                    setCursorPos({ ...pos });
                    await new Promise(r => setTimeout(r, 80));
                    break;
                case 'move_y':
                    pos.y += action.y || 1;
                    pos.y = Math.max(0, Math.min(level.gridSize.height - 1, pos.y));
                    setCursorPos({ ...pos });
                    await new Promise(r => setTimeout(r, 80));
                    break;
                case 'move_z':
                    pos.z += action.z || 1;
                    pos.z = Math.max(0, Math.min(level.gridSize.depth - 1, pos.z));
                    setCursorPos({ ...pos });
                    await new Promise(r => setTimeout(r, 80));
                    break;
                case 'goto':
                    pos = {
                        x: Math.max(0, Math.min(level.gridSize.width - 1, action.x || 0)),
                        y: Math.max(0, Math.min(level.gridSize.height - 1, action.y || 0)),
                        z: Math.max(0, Math.min(level.gridSize.depth - 1, action.z || 0)),
                    };
                    setCursorPos({ ...pos });
                    await new Promise(r => setTimeout(r, 100));
                    break;
                case 'set_color':
                    color = action.color || '#e74c3c';
                    setCurrentColor(color);
                    await new Promise(r => setTimeout(r, 50));
                    break;
            }
        }

        return blocks;
    }, [level.gridSize]);

    // Run Block mode
    const runBlockMode = useCallback(async () => {
        const actions: BuildingAction[] = [];
        let color = '#e74c3c';
        let pos = { x: 0, y: 0, z: 0 };

        const buildPlaceBlock = () => actions.push({ type: 'place', color });
        const buildRemoveBlock = () => actions.push({ type: 'remove' });
        const buildMoveX = (d: number) => { pos.x += d; actions.push({ type: 'move_x', x: d }); };
        const buildMoveY = (d: number) => { pos.y += d; actions.push({ type: 'move_y', y: d }); };
        const buildMoveZ = (d: number) => { pos.z += d; actions.push({ type: 'move_z', z: d }); };
        const buildSetColor = (c: string) => { color = c; actions.push({ type: 'set_color', color: c }); };
        const buildGoto = (x: number, y: number, z: number) => { pos = { x, y, z }; actions.push({ type: 'goto', x, y, z }); };

        // eslint-disable-next-line no-new-func
        const fn = new Function('buildPlaceBlock', 'buildRemoveBlock', 'buildMoveX', 'buildMoveY', 'buildMoveZ', 'buildSetColor', 'buildGoto', `
            ${currentCode}
        `);
        fn(buildPlaceBlock, buildRemoveBlock, buildMoveX, buildMoveY, buildMoveZ, buildSetColor, buildGoto);

        return await executeActions(actions);
    }, [currentCode, executeActions]);

    // Run Python mode
    const runPythonMode = useCallback(async () => {
        setPythonError('');
        showToast('🐍 Menjalankan Python...', 'info');

        const result = await executePythonBuildingCode(currentCode);

        if (result.success) {
            if (result.actions && result.actions.length > 0) {
                return await executeActions(result.actions);
            } else {
                showToast('⚠️ Tidak ada aksi building dalam kode', 'warning');
                return [];
            }
        } else {
            setPythonError(result.error || 'Error tidak diketahui');
            showToast('❌ Error Python!', 'error');
            throw new Error(result.error);
        }
    }, [currentCode, executeActions, showToast]);

    // Main handleRun
    const handleRun = useCallback(async () => {
        if (isRunning) return;

        // Validation
        if (workspaceMode === 'block') {
            const blockCount = countBlocksInCode(currentCode);
            if (blockCount === 0) {
                showToast('❌ Pasang blok dulu di area kerja!', 'warning');
                return;
            }
        } else {
            const actionCount = countBuildingActions(currentCode);
            if (actionCount === 0) {
                showToast('❌ Tulis kode Python dengan fungsi building! Contoh: taruh_blok()', 'warning');
                return;
            }
        }

        // Reset
        setPlacedBlocks([]);
        setCursorPos({ x: 0, y: 0, z: 0 });
        setCurrentColor('#e74c3c');
        setPythonError('');
        setIsRunning(true);

        try {
            if (workspaceMode === 'block') {
                await runBlockMode();
            } else {
                await runPythonMode();
            }
            showToast('✨ Program selesai!', 'info');
        } catch (e) {
            console.error('Error:', e);
            if (workspaceMode === 'block') {
                showToast('❌ Error: ' + (e as Error).message, 'error');
            }
        }

        setIsRunning(false);
    }, [currentCode, countBlocksInCode, workspaceMode, isRunning, showToast, runBlockMode, runPythonMode]);

    // Check completion
    const handleCheck = useCallback(() => {
        // Check block count
        if (level.requireBlockCount && placedBlocks.length < level.requireBlockCount) {
            showToast(`❌ Kamu perlu ${level.requireBlockCount} blok. Saat ini: ${placedBlocks.length}`, 'warning');
            return;
        }

        // Check target structure
        if (level.targetStructure) {
            const missing = level.targetStructure.filter(target =>
                !placedBlocks.some(b => b.x === target.x && b.y === target.y && b.z === target.z)
            );
            if (missing.length > 0) {
                showToast(`❌ Strukturnya belum sesuai! ${missing.length} blok kurang tepat.`, 'warning');
                return;
            }
        }

        // Success!
        onLevelComplete(level.id);
        showToast('🎉 Level selesai! Struktur sempurna!', 'success');

        // Auto-advance
        if (currentLevel < levels.length - 1) {
            setTimeout(() => {
                const nextLevel = currentLevel + 1;
                setCurrentLevel(nextLevel);
                setPlacedBlocks([]);
                setCursorPos({ x: 0, y: 0, z: 0 });
                setCurrentColor('#e74c3c');
                setPythonError('');
            }, 1200);
        }
    }, [level, placedBlocks, onLevelComplete, currentLevel, levels.length, showToast]);

    // Level select
    const handleSelectLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        setPlacedBlocks([]);
        setCursorPos({ x: 0, y: 0, z: 0 });
        setCurrentColor('#e74c3c');
        setPythonError('');
    }, []);

    // Render isometric canvas
    const canvasWidth = 400;
    const canvasHeight = 300;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight - 80;

    // Sort blocks for proper isometric rendering (back to front)
    const sortedBlocks = useMemo(() => {
        return [...placedBlocks].sort((a, b) => {
            return (a.x + a.z + a.y) - (b.x + b.z + b.y);
        });
    }, [placedBlocks]);

    // Ghost blocks for target structure
    const ghostBlocks = useMemo(() => {
        if (!level.targetStructure) return [];
        return level.targetStructure.filter(target =>
            !placedBlocks.some(b => b.x === target.x && b.y === target.y && b.z === target.z)
        );
    }, [level.targetStructure, placedBlocks]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar - Level List */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🏗️ Building Craft</h3>
                <LevelList
                    levels={levels}
                    currentLevel={currentLevel}
                    onSelect={handleSelectLevel}
                />
            </div>

            {/* Main - Building Stage */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                        Level {level.id}: {level.name}
                    </h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Isometric Canvas */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative bg-black/40 rounded-xl overflow-hidden" style={{ width: canvasWidth, height: canvasHeight }}>
                        <svg width={canvasWidth} height={canvasHeight}>
                            {/* Grid floor */}
                            {Array.from({ length: 5 }).map((_, z) =>
                                Array.from({ length: 5 }).map((_, x) => {
                                    const { screenX, screenY } = toIsometric(x, 0, z);
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

                            {/* Ghost blocks (target) */}
                            {ghostBlocks.map((block, i) => {
                                const { screenX, screenY } = toIsometric(block.x, block.y, block.z);
                                return (
                                    <g key={`ghost-${i}`} transform={`translate(${centerX + screenX}, ${centerY + screenY})`}>
                                        {/* Top face */}
                                        <polygon
                                            points={`0,${-TILE_HEIGHT} ${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} ${-TILE_WIDTH / 2},0`}
                                            fill="rgba(255,255,255,0.1)"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="1"
                                            strokeDasharray="3,3"
                                        />
                                    </g>
                                );
                            })}

                            {/* Placed blocks */}
                            {sortedBlocks.map((block, i) => {
                                const { screenX, screenY } = toIsometric(block.x, block.y, block.z);
                                return (
                                    <g key={`block-${i}`} transform={`translate(${centerX + screenX}, ${centerY + screenY})`}>
                                        {/* Left face */}
                                        <polygon
                                            points={`${-TILE_WIDTH / 2},0 0,${TILE_HEIGHT} 0,${TILE_HEIGHT * 2} ${-TILE_WIDTH / 2},${TILE_HEIGHT}`}
                                            fill={block.color}
                                            style={{ filter: 'brightness(0.7)' }}
                                        />
                                        {/* Right face */}
                                        <polygon
                                            points={`${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} 0,${TILE_HEIGHT * 2} ${TILE_WIDTH / 2},${TILE_HEIGHT}`}
                                            fill={block.color}
                                            style={{ filter: 'brightness(0.85)' }}
                                        />
                                        {/* Top face */}
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
                                    <g transform={`translate(${centerX + screenX}, ${centerY + screenY})`}>
                                        <polygon
                                            points={`0,${-TILE_HEIGHT} ${TILE_WIDTH / 2},0 0,${TILE_HEIGHT} ${-TILE_WIDTH / 2},0`}
                                            fill="rgba(108, 92, 231, 0.3)"
                                            stroke="#6c5ce7"
                                            strokeWidth="2"
                                            className="animate-pulse"
                                        />
                                        <text x="0" y="-25" textAnchor="middle" fill="#6c5ce7" fontSize="10">
                                            📍 ({cursorPos.x},{cursorPos.y},{cursorPos.z})
                                        </text>
                                    </g>
                                );
                            })()}
                        </svg>
                    </div>
                </div>

                {/* Status */}
                <div className="flex gap-4 justify-center my-3 text-sm">
                    <span className="bg-cyan-900/30 px-3 py-1 rounded-full">
                        🧱 Blok: {placedBlocks.length}
                        {level.requireBlockCount && ` / ${level.requireBlockCount}`}
                        {level.targetStructure && ` / ${level.targetStructure.length}`}
                    </span>
                    <span className="px-3 py-1 rounded-full flex items-center gap-2">
                        🎨 <span className="w-4 h-4 rounded" style={{ backgroundColor: currentColor }}></span>
                    </span>
                </div>

                {/* Python Error */}
                {workspaceMode === 'code' && pythonError && (
                    <div className="mt-3 p-3 rounded-lg text-sm font-mono bg-red-900/30 border border-red-500/50">
                        <div className="flex items-center gap-2 mb-2">
                            <span>❌</span>
                            <span className="font-semibold">Error</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-xs">{pythonError}</pre>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center mt-2">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Building...' : 'Jalankan'}
                    </Button>
                    <Button variant="warning" onClick={resetLevel} disabled={isRunning} icon="🔄">
                        Reset
                    </Button>
                    <Button variant="primary" onClick={handleCheck} disabled={isRunning} icon="✓">
                        Periksa
                    </Button>
                </div>

                {/* Hint */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span className="text-sm">{level.hint}</span>
                </div>

                {/* Python Mode Help */}
                {workspaceMode === 'code' && (
                    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-200">
                        <div className="font-semibold mb-1">🐍 Fungsi Python yang tersedia:</div>
                        <code className="block">taruh_blok() • hapus_blok() • gerak_x(n) • gerak_y(n) • gerak_z(n)</code>
                        <code className="block mt-1">ke_posisi(x,y,z) • warna(&quot;#hex&quot;) • merah() • biru() • hijau()</code>
                    </div>
                )}
            </div>

            {/* Dual Mode Workspace */}
            <div className="bg-[#252547] rounded-2xl overflow-hidden flex flex-col">
                <div className="flex-1 min-h-[500px]">
                    <DualModeWorkspace
                        toolbox={currentToolbox}
                        onCodeChange={setCurrentCode}
                        onModeChange={setWorkspaceMode}
                        initialMode="block"
                        pythonCodeTemplate={pythonTemplate}
                    />
                </div>
            </div>
        </div>
    );
}
