/**
 * BlockyKids - Tutorial Phase
 * Fase pengenalan dasar block programming dengan grid-based challenges
 * Dengan Dual Mode: Block dan Python Code
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { BaseLevel } from '@/types';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { challengeService } from '@/services/challengeService';
import {
    executePythonRobotCode,
    getTutorialPythonTemplate,
    countPythonActions,
    RobotAction
} from '@/services/codeExecutor';
import { CustomChallenge } from '@prisma/client';

interface TutorialPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    initialLevel?: TutorialLevel;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface TutorialLevel extends BaseLevel {
    instruction: string;
    allowedBlocks: string[];
    // Grid configuration
    gridSize: { cols: number; rows: number };
    startPosition: { x: number; y: number };
    startDirection: Direction;
    goalPosition?: { x: number; y: number };
    stars?: { x: number; y: number }[];
    // Validation rules
    requireGoal?: boolean;
    requireAllStars?: boolean;
    requireBlockCount?: number;
    requireRun?: boolean;
}

// Block definitions with categories
const BLOCK_DEFINITIONS = {
    move_forward: { category: '🏃 Gerakan', colour: '#4CAF50' },
    turn_left: { category: '🏃 Gerakan', colour: '#4CAF50' },
    turn_right: { category: '🏃 Gerakan', colour: '#4CAF50' },
    repeat_times: { category: '🔁 Kontrol', colour: '#9C27B0' },
    collect_star: { category: '⭐ Aksi', colour: '#FF9800' },
};

// Generate toolbox based on allowed blocks
function generateToolbox(allowedBlocks: string[]) {
    if (allowedBlocks.length === 0) {
        // Show all blocks for free levels
        return {
            kind: 'categoryToolbox' as const,
            contents: [
                {
                    kind: 'category' as const,
                    name: '🏃 Gerakan',
                    colour: '#4CAF50',
                    contents: [
                        { kind: 'block' as const, type: 'move_forward' },
                        { kind: 'block' as const, type: 'turn_left' },
                        { kind: 'block' as const, type: 'turn_right' },
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
                {
                    kind: 'category' as const,
                    name: '⭐ Aksi',
                    colour: '#FF9800',
                    contents: [
                        { kind: 'block' as const, type: 'collect_star' },
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

// Tutorial Levels with proper grid-based challenges
const DEFAULT_LEVELS: TutorialLevel[] = [
    {
        id: 1,
        name: 'Seret Blok',
        difficulty: 'easy',
        description: 'Belajar menyeret blok dari toolbox ke area kerja',
        hint: 'Klik kategori "Gerakan", lalu seret blok "Maju" ke area kerja di kanan',
        instruction: '📌 Seret 1 blok "⬆️ Maju" ke area kerja!',
        allowedBlocks: ['move_forward'],
        gridSize: { cols: 3, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        requireBlockCount: 1,
    },
    {
        id: 2,
        name: 'Sambung Blok',
        difficulty: 'easy',
        description: 'Belajar menyambung blok menjadi program',
        hint: 'Seret blok kedua dan dekatkan ke blok pertama sampai menempel!',
        instruction: '📌 Pasang 2 blok "⬆️ Maju" yang tersambung!',
        allowedBlocks: ['move_forward'],
        gridSize: { cols: 3, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        requireBlockCount: 2,
    },
    {
        id: 3,
        name: 'Jalankan Program',
        difficulty: 'easy',
        description: 'Tekan tombol Jalankan dan lihat robot bergerak ke finish!',
        hint: 'Pasang blok Maju secukupnya, lalu tekan ▶️ Jalankan. Robot harus sampai 🏁',
        instruction: '📌 Buat robot sampai ke 🏁 finish!',
        allowedBlocks: ['move_forward'],
        gridSize: { cols: 4, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        goalPosition: { x: 3, y: 0 },
        requireGoal: true,
        requireRun: true,
    },
    {
        id: 4,
        name: 'Belok Kiri',
        difficulty: 'easy',
        description: 'Gunakan blok belok untuk mengubah arah robot',
        hint: 'Robot menghadap kanan. Belok Kiri → Robot menghadap atas. Lalu Maju ke goal!',
        instruction: '📌 Belok Kiri, lalu Maju ke 🏁 finish!',
        allowedBlocks: ['move_forward', 'turn_left'],
        gridSize: { cols: 2, rows: 2 },
        startPosition: { x: 0, y: 1 },
        startDirection: 'right',
        goalPosition: { x: 1, y: 0 },
        requireGoal: true,
        requireRun: true,
    },
    {
        id: 5,
        name: 'Ambil Bintang',
        difficulty: 'medium',
        description: 'Jalan ke bintang dan gunakan blok "Ambil Bintang"',
        hint: 'Maju ke posisi bintang, lalu gunakan blok "Ambil Bintang" untuk mengambilnya',
        instruction: '📌 Maju ke ⭐ dan ambil bintangnya!',
        allowedBlocks: ['move_forward', 'collect_star'],
        gridSize: { cols: 4, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        stars: [{ x: 2, y: 0 }],
        requireAllStars: true,
        requireRun: true,
    },
    {
        id: 6,
        name: 'Kombinasi Gerakan',
        difficulty: 'medium',
        description: 'Gabungkan maju dan belok untuk mencapai goal',
        hint: 'Susun: Maju → Maju → Belok Kiri → Maju → Maju untuk sampai ke finish',
        instruction: '📌 Navigasi ke 🏁 dengan kombinasi Maju dan Belok!',
        allowedBlocks: ['move_forward', 'turn_left', 'turn_right'],
        gridSize: { cols: 3, rows: 3 },
        startPosition: { x: 0, y: 2 },
        startDirection: 'right',
        goalPosition: { x: 2, y: 0 },
        requireGoal: true,
        requireRun: true,
    },
    {
        id: 7,
        name: 'Pengulangan',
        difficulty: 'medium',
        description: 'Gunakan blok Ulangi untuk efisiensi',
        hint: 'Daripada 5x blok Maju, gunakan "Ulangi 5 kali" dengan Maju di dalamnya!',
        instruction: '📌 Gunakan blok "Ulangi" untuk sampai ke 🏁!',
        allowedBlocks: ['move_forward', 'repeat_times'],
        gridSize: { cols: 6, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        goalPosition: { x: 5, y: 0 },
        requireGoal: true,
        requireRun: true,
    },
    {
        id: 8,
        name: 'Master Tutorial!',
        difficulty: 'hard',
        description: 'Ambil bintang DAN sampai ke finish!',
        hint: 'Kumpulkan semua bintang di jalan, lalu sampai ke finish',
        instruction: '📌 Ambil semua ⭐ dan sampai ke 🏁!',
        allowedBlocks: [], // All blocks available
        gridSize: { cols: 5, rows: 1 },
        startPosition: { x: 0, y: 0 },
        startDirection: 'right',
        goalPosition: { x: 4, y: 0 },
        stars: [{ x: 1, y: 0 }, { x: 3, y: 0 }],
        requireGoal: true,
        requireAllStars: true,
        requireRun: true,
    },
];

// Direction emoji mapping
const DIRECTION_EMOJI: Record<Direction, string> = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️',
};

export default function TutorialPhase({ onLevelComplete, showToast, initialLevel }: TutorialPhaseProps) {
    const [levels, setLevels] = useState<TutorialLevel[]>(initialLevel ? [initialLevel] : DEFAULT_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');

    // Robot state
    const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
    const [robotDirection, setRobotDirection] = useState<Direction>('right');
    const [collectedStars, setCollectedStars] = useState<{ x: number; y: number }[]>([]);
    const [hasRun, setHasRun] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // Python output state
    const [pythonOutput, setPythonOutput] = useState<string>('');
    const [pythonError, setPythonError] = useState<string>('');

    // Load custom levels on mount (only if not in single level mode)
    useEffect(() => {
        if (initialLevel) return;

        const fetchCustomChallenges = async () => {
            try {
                const challenges = await challengeService.getAll('tutorial');
                if (challenges.length > 0) {
                    const customLevels = challenges.map(c => ({
                        ...(c.config as unknown as TutorialLevel),
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

    const level = levels[currentLevel];

    // Generate dynamic toolbox
    const currentToolbox = useMemo(() => {
        return generateToolbox(level.allowedBlocks);
    }, [level.allowedBlocks]);

    // Python code template - updated with new service
    const pythonTemplate = useMemo(() => {
        return getTutorialPythonTemplate(level.id, level.name, level.instruction);
    }, [level.id, level.name, level.instruction]);

    // Reset level state
    const resetLevel = useCallback(() => {
        setRobotPosition({ ...level.startPosition });
        setRobotDirection(level.startDirection);
        setCollectedStars([]);
        setHasRun(false);
        setPythonOutput('');
        setPythonError('');
    }, [level]);

    // Count blocks in generated code (for Block mode)
    const countBlocksInCode = useCallback((code: string): number => {
        let count = 0;
        count += (code.match(/await moveForward\(\)/g) || []).length;
        count += (code.match(/await turnLeft\(\)/g) || []).length;
        count += (code.match(/await turnRight\(\)/g) || []).length;
        count += (code.match(/await collectStar\(\)/g) || []).length;
        count += (code.match(/for \(let i = 0/g) || []).length;
        return count;
    }, []);

    // Execute robot actions (shared by both modes)
    const executeActions = useCallback(async (actions: RobotAction[]) => {
        let currentDir = level.startDirection;
        let currentPos = { ...level.startPosition };
        const collected: { x: number; y: number }[] = [];

        for (const action of actions) {
            switch (action.type) {
                case 'move_forward': {
                    let newPos = { ...currentPos };
                    switch (currentDir) {
                        case 'up': newPos.y -= 1; break;
                        case 'down': newPos.y += 1; break;
                        case 'left': newPos.x -= 1; break;
                        case 'right': newPos.x += 1; break;
                    }
                    // Boundary check
                    newPos.x = Math.max(0, Math.min(level.gridSize.cols - 1, newPos.x));
                    newPos.y = Math.max(0, Math.min(level.gridSize.rows - 1, newPos.y));
                    currentPos = newPos;
                    setRobotPosition(newPos);
                    await new Promise(r => setTimeout(r, 400));
                    break;
                }
                case 'turn_left': {
                    const dirs: Direction[] = ['up', 'left', 'down', 'right'];
                    const idx = dirs.indexOf(currentDir);
                    currentDir = dirs[(idx + 1) % 4];
                    setRobotDirection(currentDir);
                    await new Promise(r => setTimeout(r, 300));
                    break;
                }
                case 'turn_right': {
                    const dirs: Direction[] = ['up', 'right', 'down', 'left'];
                    const idx = dirs.indexOf(currentDir);
                    currentDir = dirs[(idx + 1) % 4];
                    setRobotDirection(currentDir);
                    await new Promise(r => setTimeout(r, 300));
                    break;
                }
                case 'collect_star': {
                    if (level.stars) {
                        const starHere = level.stars.find(s => s.x === currentPos.x && s.y === currentPos.y);
                        if (starHere && !collected.some(c => c.x === starHere.x && c.y === starHere.y)) {
                            collected.push(starHere);
                            setCollectedStars([...collected]);
                            showToast('⭐ Bintang diambil!', 'success');
                        } else if (!starHere) {
                            showToast('❌ Tidak ada bintang di sini!', 'warning');
                        }
                    }
                    await new Promise(r => setTimeout(r, 300));
                    break;
                }
                case 'wait': {
                    const seconds = action.value || 1;
                    await new Promise(r => setTimeout(r, seconds * 1000));
                    break;
                }
            }
        }
    }, [level, showToast]);

    // Handle running the program - BLOCK MODE
    const runBlockMode = useCallback(async () => {
        let currentDir = level.startDirection;
        let currentPos = { ...level.startPosition };
        const collected: { x: number; y: number }[] = [];

        // Runtime functions
        const moveForward = async () => {
            let newPos = { ...currentPos };
            switch (currentDir) {
                case 'up': newPos.y -= 1; break;
                case 'down': newPos.y += 1; break;
                case 'left': newPos.x -= 1; break;
                case 'right': newPos.x += 1; break;
            }
            newPos.x = Math.max(0, Math.min(level.gridSize.cols - 1, newPos.x));
            newPos.y = Math.max(0, Math.min(level.gridSize.rows - 1, newPos.y));
            currentPos = newPos;
            setRobotPosition(newPos);
            await new Promise(r => setTimeout(r, 400));
        };

        const turnLeft = async () => {
            const dirs: Direction[] = ['up', 'left', 'down', 'right'];
            const idx = dirs.indexOf(currentDir);
            currentDir = dirs[(idx + 1) % 4];
            setRobotDirection(currentDir);
            await new Promise(r => setTimeout(r, 300));
        };

        const turnRight = async () => {
            const dirs: Direction[] = ['up', 'right', 'down', 'left'];
            const idx = dirs.indexOf(currentDir);
            currentDir = dirs[(idx + 1) % 4];
            setRobotDirection(currentDir);
            await new Promise(r => setTimeout(r, 300));
        };

        const collectStar = async () => {
            if (level.stars) {
                const starHere = level.stars.find(s => s.x === currentPos.x && s.y === currentPos.y);
                if (starHere && !collected.some(c => c.x === starHere.x && c.y === starHere.y)) {
                    collected.push(starHere);
                    setCollectedStars([...collected]);
                    showToast('⭐ Bintang diambil!', 'success');
                } else if (!starHere) {
                    showToast('❌ Tidak ada bintang di sini!', 'warning');
                }
            }
            await new Promise(r => setTimeout(r, 300));
        };

        // eslint-disable-next-line no-new-func
        const fn = new Function('moveForward', 'turnLeft', 'turnRight', 'collectStar', `
            return (async () => { ${currentCode} })();
        `);
        await fn(moveForward, turnLeft, turnRight, collectStar);
    }, [currentCode, level, showToast]);

    // Handle running the program - PYTHON MODE via Judge0
    const runPythonMode = useCallback(async () => {
        setPythonOutput('');
        setPythonError('');
        showToast('🐍 Menjalankan Python...', 'info');

        const result = await executePythonRobotCode(currentCode);

        if (result.success) {
            if (result.output) {
                setPythonOutput(result.output);
            }

            if (result.actions && result.actions.length > 0) {
                await executeActions(result.actions);
            } else {
                showToast('⚠️ Tidak ada aksi robot dalam kode', 'warning');
            }
        } else {
            setPythonError(result.error || 'Error tidak diketahui');
            showToast('❌ Error Python!', 'error');
            throw new Error(result.error);
        }
    }, [currentCode, executeActions, showToast]);

    // Main handleRun function
    const handleRun = useCallback(async () => {
        if (isRunning) return;

        // Validation based on mode
        if (workspaceMode === 'block') {
            const blockCount = countBlocksInCode(currentCode);
            if (blockCount === 0) {
                showToast('❌ Pasang blok dulu di area kerja!', 'warning');
                return;
            }
        } else {
            // Python mode - check for actions
            const actionCount = countPythonActions(currentCode);
            if (actionCount === 0) {
                showToast('❌ Tulis kode Python dengan fungsi robot! Contoh: maju()', 'warning');
                return;
            }
        }

        // Reset before running
        setRobotPosition({ ...level.startPosition });
        setRobotDirection(level.startDirection);
        setCollectedStars([]);
        setIsRunning(true);
        setPythonOutput('');
        setPythonError('');

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

        setHasRun(true);
        setIsRunning(false);
    }, [currentCode, countBlocksInCode, workspaceMode, isRunning, level, showToast, runBlockMode, runPythonMode]);

    // Handle checking completion
    const handleCheck = useCallback(() => {
        // Get action count based on mode
        const actionCount = workspaceMode === 'block'
            ? countBlocksInCode(currentCode)
            : countPythonActions(currentCode);

        // 1. Check block count requirement
        if (level.requireBlockCount && actionCount < level.requireBlockCount) {
            const term = workspaceMode === 'block' ? 'blok' : 'aksi';
            showToast(`❌ Kamu perlu ${level.requireBlockCount} ${term}. Saat ini: ${actionCount}`, 'warning');
            return;
        }

        // 2. Check if run is required
        if (level.requireRun && !hasRun) {
            showToast('❌ Tekan ▶️ Jalankan dulu untuk menjalankan programmu!', 'warning');
            return;
        }

        // 3. Check goal requirement
        if (level.requireGoal && level.goalPosition) {
            if (robotPosition.x !== level.goalPosition.x || robotPosition.y !== level.goalPosition.y) {
                showToast('❌ Robot belum sampai di 🏁 finish! Jalankan ulang programmu.', 'warning');
                return;
            }
        }

        // 4. Check stars requirement
        if (level.requireAllStars && level.stars) {
            const remaining = level.stars.filter(s =>
                !collectedStars.some(c => c.x === s.x && c.y === s.y)
            );
            if (remaining.length > 0) {
                showToast(`❌ Masih ada ${remaining.length} bintang ⭐ yang belum diambil!`, 'warning');
                return;
            }
        }

        // All validations passed!
        onLevelComplete(level.id);
        showToast('🎉 Level selesai! Bagus sekali!', 'success');

        // Auto-advance to next level
        if (currentLevel < levels.length - 1) {
            setTimeout(() => {
                const nextLevel = currentLevel + 1;
                setCurrentLevel(nextLevel);
                const next = levels[nextLevel];
                setRobotPosition({ ...next.startPosition });
                setRobotDirection(next.startDirection);
                setCollectedStars([]);
                setHasRun(false);
                setPythonOutput('');
                setPythonError('');
            }, 1200);
        }
    }, [currentCode, countBlocksInCode, workspaceMode, hasRun, robotPosition, collectedStars, level, levels, currentLevel, onLevelComplete, showToast]);

    // Handle level selection
    const handleSelectLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        const selected = levels[idx];
        setRobotPosition({ ...selected.startPosition });
        setRobotDirection(selected.startDirection);
        setCollectedStars([]);
        setHasRun(false);
        setPythonOutput('');
        setPythonError('');
    }, [levels]);

    // Check if a star is at position and not collected
    const isStarAt = useCallback((x: number, y: number): boolean => {
        if (!level.stars) return false;
        const starHere = level.stars.some(s => s.x === x && s.y === y);
        const collected = collectedStars.some(c => c.x === x && c.y === y);
        return starHere && !collected;
    }, [level.stars, collectedStars]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar - Level List */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🎓 Tutorial</h3>
                <LevelList
                    levels={levels}
                    currentLevel={currentLevel}
                    onSelect={handleSelectLevel}
                />
            </div>

            {/* Main - Tutorial Stage */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                        Level {level.id}: {level.name}
                    </h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Instruction Box */}
                <div className="bg-[#6c5ce7]/20 border-l-4 border-[#6c5ce7] p-4 rounded-r-xl mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎯</span>
                        <p className="text-lg font-medium">{level.instruction}</p>
                    </div>
                </div>

                {/* Grid Display */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-black/40 p-4 rounded-xl">
                        <div
                            className="grid gap-1"
                            style={{
                                gridTemplateColumns: `repeat(${level.gridSize.cols}, 1fr)`,
                            }}
                        >
                            {Array.from({ length: level.gridSize.cols * level.gridSize.rows }).map((_, i) => {
                                const x = i % level.gridSize.cols;
                                const y = Math.floor(i / level.gridSize.cols);
                                const isRobot = x === robotPosition.x && y === robotPosition.y;
                                const isGoal = level.goalPosition && x === level.goalPosition.x && y === level.goalPosition.y;
                                const isStar = isStarAt(x, y);

                                return (
                                    <div
                                        key={i}
                                        className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl transition-all relative
                                            ${isGoal && !isRobot ? 'bg-green-900/50 ring-2 ring-green-500' : 'bg-[#1a1a35]'}
                                            ${isRobot ? 'bg-[#6c5ce7]/30' : ''}
                                        `}
                                    >
                                        {isRobot && (
                                            <div className={`flex flex-col items-center justify-center ${isRunning ? 'animate-pulse' : 'animate-bounce'}`}>
                                                <span className="text-2xl leading-none">🤖</span>
                                                <span className="text-xs leading-none -mt-1">{DIRECTION_EMOJI[robotDirection]}</span>
                                            </div>
                                        )}
                                        {isGoal && !isRobot && <span className="text-2xl">🏁</span>}
                                        {isStar && !isRobot && <span className="animate-pulse text-2xl">⭐</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Status Display */}
                <div className="flex gap-4 justify-center my-3 text-sm">
                    {level.stars && level.stars.length > 0 && (
                        <span className="bg-yellow-900/30 px-3 py-1 rounded-full">
                            ⭐ {collectedStars.length}/{level.stars.length}
                        </span>
                    )}
                    {level.requireGoal && (
                        <span className={`px-3 py-1 rounded-full ${level.goalPosition &&
                            robotPosition.x === level.goalPosition.x &&
                            robotPosition.y === level.goalPosition.y
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-gray-900/30'
                            }`}>
                            🏁 {level.goalPosition &&
                                robotPosition.x === level.goalPosition.x &&
                                robotPosition.y === level.goalPosition.y
                                ? 'Sampai!' : 'Belum sampai'}
                        </span>
                    )}
                </div>

                {/* Python Output Panel - Only show in code mode */}
                {workspaceMode === 'code' && (pythonOutput || pythonError) && (
                    <div className={`mt-3 p-3 rounded-lg text-sm font-mono ${pythonError ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span>{pythonError ? '❌' : '📤'}</span>
                            <span className="font-semibold">{pythonError ? 'Error' : 'Output'}</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-xs">
                            {pythonError || pythonOutput}
                        </pre>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center mt-2">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Berjalan...' : 'Jalankan'}
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
                        <code className="block">maju() • belok_kiri() • belok_kanan() • ambil_bintang()</code>
                        <div className="mt-1 text-blue-300/70">Atau gunakan: move_forward() • turn_left() • turn_right() • collect_star()</div>
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
