/**
 * BlockyKids - Alchemist Phase (Data Sorting)
 * Target: Ages 11-12 (Hybrid Phase)
 * Concept: Lists/Arrays, Indexing, If/Else, Variables
 */

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { AlchemistLevel } from '@/types';
import { executePythonAlchemistCode, AlchemistAction, getAlchemistPythonTemplate } from '@/services/codeExecutor';

interface AlchemistPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    initialLevel?: ExtendedAlchemistLevel;
}

interface ExtendedAlchemistLevel extends AlchemistLevel {
    allowedBlocks: string[];
}

// Potion colors for visualization
const POTION_COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e91e63', // Pink
    '#00bcd4', // Cyan
];

// Block definitions for Alchemist phase
const BLOCK_DEFINITIONS = {
    alchemist_swap: { category: '🔄 Operasi Array', colour: '#4CAF50' },
    alchemist_get: { category: '🔄 Operasi Array', colour: '#4CAF50' },
    alchemist_length: { category: '🔄 Operasi Array', colour: '#4CAF50' },
    alchemist_view: { category: '🔄 Operasi Array', colour: '#4CAF50' },
    for_loop: { category: '🔁 Kontrol', colour: '#9C27B0' },
    for_loop_nested: { category: '🔁 Kontrol', colour: '#9C27B0' },
    if_compare: { category: '🔀 Logika', colour: '#FF9800' },
    compare_values: { category: '🔀 Logika', colour: '#FF9800' },
    variables: { category: '📦 Variabel', colour: '#2196F3' },
    math_number: { category: '🔢 Angka', colour: '#607D8B' },
};

function generateToolbox(allowedBlocks: string[]) {
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

const DEFAULT_LEVELS: ExtendedAlchemistLevel[] = [
    {
        id: 1,
        name: 'Sortir Sederhana',
        difficulty: 'easy',
        description: 'Urutkan 3 ramuan dari kecil ke besar!',
        hint: 'Bandingkan dan tukar posisi yang salah',
        potions: [3, 1, 2],
        sortOrder: 'ascending',
        maxSwaps: 5,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'if_compare', 'compare_values', 'math_number'],
    },
    {
        id: 2,
        name: 'Empat Ramuan',
        difficulty: 'easy',
        description: 'Urutkan 4 ramuan dengan efisien!',
        hint: 'Gunakan pengulangan untuk membandingkan',
        potions: [4, 2, 3, 1],
        sortOrder: 'ascending',
        maxSwaps: 8,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'if_compare', 'compare_values', 'for_loop', 'math_number'],
    },
    {
        id: 3,
        name: 'Bubble Sort',
        difficulty: 'medium',
        description: 'Implementasikan algoritma Bubble Sort!',
        hint: 'Bandingkan elemen berdekatan, ulangi sampai terurut',
        potions: [5, 3, 1, 4, 2],
        sortOrder: 'ascending',
        maxSwaps: 15,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'if_compare', 'compare_values', 'for_loop', 'for_loop_nested', 'math_number'],
    },
    {
        id: 4,
        name: 'Urutan Menurun',
        difficulty: 'medium',
        description: 'Sortir ramuan dari besar ke kecil!',
        hint: 'Balik kondisi perbandingannya',
        potions: [1, 4, 2, 5, 3],
        sortOrder: 'descending',
        maxSwaps: 15,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'if_compare', 'compare_values', 'for_loop', 'for_loop_nested', 'math_number'],
    },
    {
        id: 5,
        name: 'Tantangan Master',
        difficulty: 'hard',
        description: 'Sortir 7 ramuan dengan minimal swap!',
        hint: 'Optimasi algoritma sorting kamu',
        potions: [7, 3, 5, 1, 6, 2, 4],
        sortOrder: 'ascending',
        maxSwaps: 21,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'if_compare', 'compare_values', 'for_loop', 'for_loop_nested', 'variables', 'math_number'],
    },
    {
        id: 6,
        name: '🧪 Laboratorium',
        difficulty: 'free',
        description: 'Mode sandbox - eksperimen bebas!',
        hint: 'Coba berbagai algoritma sorting',
        potions: [5, 2, 8, 1, 9, 3, 7, 4, 6],
        sortOrder: 'ascending',
        maxSwaps: 999,
        allowedBlocks: ['alchemist_swap', 'alchemist_get', 'alchemist_length', 'alchemist_view', 'if_compare', 'compare_values', 'for_loop', 'for_loop_nested', 'variables', 'math_number'],
    },
];

export default function AlchemistPhase({ onLevelComplete, showToast, initialLevel }: AlchemistPhaseProps) {
    const [levels] = useState(initialLevel ? [initialLevel] : DEFAULT_LEVELS);
    const isSingleLevelMode = !!initialLevel;
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [potions, setPotions] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');
    const [swapCount, setSwapCount] = useState(0);
    const [animatingSwap, setAnimatingSwap] = useState<{ from: number, to: number } | null>(null);
    const actionsQueueRef = useRef<AlchemistAction[]>([]);

    const level = useMemo(() => levels[currentLevel], [levels, currentLevel]);

    const currentToolbox = useMemo(() => {
        const blocks = level.allowedBlocks || Object.keys(BLOCK_DEFINITIONS);
        return generateToolbox(blocks);
    }, [level.allowedBlocks]);

    const pythonTemplate = useMemo(() => {
        return getAlchemistPythonTemplate(level.id, level.name, level.potions);
    }, [level.id, level.name, level.potions]);

    const loadLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        const lvl = levels[idx];
        setPotions([...lvl.potions]);
        setSwapCount(0);
        setAnimatingSwap(null);
        actionsQueueRef.current = [];
    }, [levels]);

    // Initialize on mount
    useEffect(() => {
        loadLevel(0);
    }, [loadLevel]);

    const animateSwap = useCallback(async (from: number, to: number) => {
        setAnimatingSwap({ from, to });
        await new Promise(r => setTimeout(r, 500));

        setPotions(prev => {
            const newPotions = [...prev];
            const temp = newPotions[from];
            newPotions[from] = newPotions[to];
            newPotions[to] = temp;
            return newPotions;
        });

        await new Promise(r => setTimeout(r, 300));
        setAnimatingSwap(null);
    }, []);

    const handleRun = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);

        // Reset to initial state
        setPotions([...level.potions]);
        setSwapCount(0);
        setAnimatingSwap(null);

        await new Promise(r => setTimeout(r, 100));

        try {
            if (workspaceMode === 'code') {
                showToast('🐍 Menjalankan Python...', 'info');
                const result = await executePythonAlchemistCode(currentCode, level.potions);

                if (result.success) {
                    // Animate each swap
                    for (const action of result.actions) {
                        if (action.type === 'swap') {
                            await animateSwap(action.from, action.to);
                            setSwapCount(prev => prev + 1);
                        }
                    }
                    showToast(`✨ Selesai! Total swap: ${result.swapCount}`, 'success');
                } else {
                    showToast('❌ Error: ' + result.error, 'error');
                }
            } else {
                // Block mode - execute JavaScript locally
                const localPotions = [...level.potions];
                let localSwapCount = 0;
                const swaps: AlchemistAction[] = [];

                const alchemistSwap = async (i: number, j: number) => {
                    if (i >= 0 && i < localPotions.length && j >= 0 && j < localPotions.length) {
                        const temp = localPotions[i];
                        localPotions[i] = localPotions[j];
                        localPotions[j] = temp;
                        localSwapCount++;
                        swaps.push({ type: 'swap', from: i, to: j });
                    }
                };

                const alchemistGet = (i: number) => {
                    if (i >= 0 && i < localPotions.length) {
                        return localPotions[i];
                    }
                    return null;
                };

                const alchemistLength = () => localPotions.length;

                try {
                    // eslint-disable-next-line no-new-func
                    const fn = new Function(
                        'alchemistSwap', 'alchemistGet', 'alchemistLength',
                        `return (async () => { ${currentCode} })();`
                    );
                    await fn(alchemistSwap, alchemistGet, alchemistLength);

                    // Animate swaps
                    for (const action of swaps) {
                        await animateSwap(action.from, action.to);
                        setSwapCount(prev => prev + 1);
                    }
                    showToast(`✨ Selesai! Total swap: ${localSwapCount}`, 'success');
                } catch (e) {
                    showToast('❌ Error: ' + (e as Error).message, 'error');
                }
            }
        } catch (error) {
            showToast('❌ Error: ' + (error as Error).message, 'error');
        }

        setIsRunning(false);
    }, [currentCode, isRunning, level.potions, showToast, workspaceMode, animateSwap]);

    const isSorted = useCallback((arr: number[], order: 'ascending' | 'descending') => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (order === 'ascending' && arr[i] > arr[i + 1]) return false;
            if (order === 'descending' && arr[i] < arr[i + 1]) return false;
        }
        return true;
    }, []);

    const handleCheck = useCallback(() => {
        const sorted = isSorted(potions, level.sortOrder);
        const efficient = swapCount <= level.maxSwaps;

        if (sorted && efficient) {
            onLevelComplete(level.id);
            showToast(`🎉 Berhasil! Efisiensi: ${swapCount}/${level.maxSwaps} swap`, 'success');
            if (currentLevel < levels.length - 1 && level.difficulty !== 'free') {
                setTimeout(() => loadLevel(currentLevel + 1), 1500);
            }
        } else if (sorted && !efficient) {
            showToast(`⚠️ Terurut tapi kurang efisien! Gunakan ${swapCount} swap (maks: ${level.maxSwaps})`, 'warning');
        } else {
            showToast('❌ Ramuan belum terurut dengan benar!', 'error');
        }
    }, [potions, level, swapCount, isSorted, onLevelComplete, showToast, currentLevel, levels.length, loadLevel]);

    const handleReset = useCallback(() => {
        loadLevel(currentLevel);
    }, [currentLevel, loadLevel]);

    const getPotionColor = (value: number) => {
        return POTION_COLORS[(value - 1) % POTION_COLORS.length];
    };

    return (
        <div className={`grid grid-cols-1 ${isSingleLevelMode ? 'lg:grid-cols-2' : 'lg:grid-cols-[220px_1fr_1fr]'} gap-5 min-h-[calc(100vh-94px)]`}>
            {/* Sidebar */}
            {!isSingleLevelMode && (
                <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">🧪 Data Alchemist</h3>
                    <LevelList levels={levels} currentLevel={currentLevel} onSelect={loadLevel} />
                </div>
            )}

            {/* Main Stage */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                        {isSingleLevelMode ? level.name : `Level ${level.id}: ${level.name}`}
                    </h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Potion Shelf Visualization */}
                <div className="flex-1 bg-gradient-to-b from-[#1a1a35] to-[#2d2d5a] rounded-xl relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
                    {/* Shelf */}
                    <div className="absolute bottom-20 left-0 right-0 h-4 bg-gradient-to-b from-amber-700 to-amber-900 shadow-lg" />

                    {/* Potions */}
                    <div className="flex gap-4 items-end mb-8">
                        {potions.map((value, idx) => {
                            const isAnimating = animatingSwap &&
                                (animatingSwap.from === idx || animatingSwap.to === idx);
                            const animateDirection = animatingSwap?.from === idx ? 1 : -1;

                            return (
                                <div
                                    key={idx}
                                    className={`flex flex-col items-center transition-all duration-300 ${isAnimating ? 'scale-110' : ''
                                        }`}
                                    style={{
                                        transform: isAnimating
                                            ? `translateX(${animateDirection * 80}px)`
                                            : 'translateX(0)',
                                    }}
                                >
                                    {/* Potion Bottle */}
                                    <div className="relative">
                                        <div
                                            className="w-12 h-20 rounded-b-xl relative overflow-hidden shadow-lg"
                                            style={{ backgroundColor: getPotionColor(value) }}
                                        >
                                            {/* Glass shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent w-1/3" />
                                            {/* Bubbles */}
                                            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                                            <div className="absolute bottom-4 right-3 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce delay-100" />
                                        </div>
                                        {/* Bottle neck */}
                                        <div
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-lg"
                                            style={{ backgroundColor: getPotionColor(value) }}
                                        />
                                        {/* Cork */}
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-5 h-3 bg-amber-600 rounded-t-lg" />
                                    </div>

                                    {/* Value label */}
                                    <div className="mt-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                                        {value}
                                    </div>

                                    {/* Index label */}
                                    <div className="text-xs text-gray-400 mt-1">
                                        [{idx}]
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats */}
                    <div className="absolute top-4 right-4 bg-black/30 rounded-lg p-3 text-sm">
                        <div>🔄 Swap: <span className={swapCount > level.maxSwaps ? 'text-red-400' : 'text-green-400'}>{swapCount}</span>/{level.maxSwaps}</div>
                        <div>📊 Urutan: {level.sortOrder === 'ascending' ? '⬆️ Naik' : '⬇️ Turun'}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center mt-4">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Berjalan...' : 'Jalankan'}
                    </Button>
                    <Button variant="warning" onClick={handleReset} icon="🔄">Reset</Button>
                    {level.difficulty !== 'free' && (
                        <Button variant="primary" onClick={handleCheck} icon="✓">Periksa</Button>
                    )}
                </div>

                {/* Hint */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
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
