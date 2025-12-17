/**
 * BlockyKids - Robot Phase
 * With working Blockly integration
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';
import { RobotLevel } from '@/types';

interface RobotPhaseProps {
    onLevelComplete: (levelId: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type Direction = 'north' | 'east' | 'south' | 'west';

const DIRECTION_ARROWS: Record<Direction, string> = {
    north: '⬆️',
    east: '➡️',
    south: '⬇️',
    west: '⬅️',
};

const DEFAULT_LEVELS: RobotLevel[] = [
    {
        id: 1, name: 'Langkah Pertama', difficulty: 'easy',
        description: 'Buat robot bergerak ke tujuan!',
        hint: 'Gunakan blok "Maju" 4 kali',
        width: 5, height: 3,
        grid: Array(3).fill(null).map(() => Array(5).fill({ type: 'empty' })),
        robot: { x: 0, y: 1, direction: 'east' },
        goal: { x: 4, y: 1 },
        stars: [],
    },
    {
        id: 2, name: 'Belok Kiri', difficulty: 'easy',
        description: 'Robot perlu berbelok untuk mencapai tujuan!',
        hint: 'Maju, belok kiri, lalu maju lagi',
        width: 4, height: 4,
        grid: Array(4).fill(null).map(() => Array(4).fill({ type: 'empty' })),
        robot: { x: 0, y: 3, direction: 'east' },
        goal: { x: 3, y: 0 },
        stars: [],
    },
    {
        id: 3, name: 'Kumpulkan Bintang', difficulty: 'medium',
        description: 'Kumpulkan semua bintang lalu ke tujuan!',
        hint: 'Gunakan "Maju" dan "Ambil Bintang"',
        width: 5, height: 3,
        grid: Array(3).fill(null).map(() => Array(5).fill({ type: 'empty' })),
        robot: { x: 0, y: 1, direction: 'east' },
        goal: { x: 4, y: 1 },
        stars: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    },
    {
        id: 4, name: 'Pengulangan', difficulty: 'medium',
        description: 'Gunakan pengulangan untuk efisiensi!',
        hint: 'Ulangi "Maju" 4 kali',
        width: 5, height: 3,
        grid: Array(3).fill(null).map(() => Array(5).fill({ type: 'empty' })),
        robot: { x: 0, y: 1, direction: 'east' },
        goal: { x: 4, y: 1 },
        stars: [],
    },
];

const TOOLBOX = {
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
                { kind: 'block' as const, type: 'wait' },
            ],
        },
    ],
};

export default function RobotPhase({ onLevelComplete, showToast }: RobotPhaseProps) {
    const [levels] = useState(DEFAULT_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [robotPos, setRobotPos] = useState({ x: 0, y: 1 });
    const [robotDir, setRobotDir] = useState<Direction>('east');
    const [collectedStars, setCollectedStars] = useState<Set<string>>(new Set());
    const [isRunning, setIsRunning] = useState(false);

    const level = levels[currentLevel];

    const resetRobot = useCallback(() => {
        const lvl = levels[currentLevel];
        setRobotPos({ x: lvl.robot.x, y: lvl.robot.y });
        setRobotDir(lvl.robot.direction);
        setCollectedStars(new Set());
    }, [currentLevel, levels]);

    const loadLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        const lvl = levels[idx];
        setRobotPos({ x: lvl.robot.x, y: lvl.robot.y });
        setRobotDir(lvl.robot.direction);
        setCollectedStars(new Set());
    }, [levels]);

    const handleRun = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        resetRobot();

        await new Promise(r => setTimeout(r, 100));

        let pos = { x: level.robot.x, y: level.robot.y };
        let dir = level.robot.direction as Direction;
        const collected = new Set<string>();

        const moveForward = async () => {
            const dx = dir === 'east' ? 1 : dir === 'west' ? -1 : 0;
            const dy = dir === 'south' ? 1 : dir === 'north' ? -1 : 0;
            const newX = Math.max(0, Math.min(pos.x + dx, level.width - 1));
            const newY = Math.max(0, Math.min(pos.y + dy, level.height - 1));
            pos = { x: newX, y: newY };
            setRobotPos({ x: newX, y: newY });
            await new Promise(r => setTimeout(r, 400));
        };

        const turnLeft = async () => {
            const dirs: Direction[] = ['north', 'west', 'south', 'east'];
            dir = dirs[(dirs.indexOf(dir) + 1) % 4];
            setRobotDir(dir);
            await new Promise(r => setTimeout(r, 300));
        };

        const turnRight = async () => {
            const dirs: Direction[] = ['north', 'east', 'south', 'west'];
            dir = dirs[(dirs.indexOf(dir) + 1) % 4];
            setRobotDir(dir);
            await new Promise(r => setTimeout(r, 300));
        };

        const collectStar = async () => {
            const key = `${pos.x},${pos.y}`;
            if (level.stars.some(s => s.x === pos.x && s.y === pos.y)) {
                collected.add(key);
                setCollectedStars(new Set(collected));
                showToast('⭐ Bintang diambil!', 'success');
            }
            await new Promise(r => setTimeout(r, 200));
        };

        const wait = async (sec: number) => {
            await new Promise(r => setTimeout(r, sec * 1000));
        };

        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('moveForward', 'turnLeft', 'turnRight', 'collectStar', 'wait', `
        return (async () => { ${currentCode} })();
      `);
            await fn(moveForward, turnLeft, turnRight, collectStar, wait);

            // Check win condition
            const atGoal = pos.x === level.goal.x && pos.y === level.goal.y;
            const allStars = level.stars.every(s => collected.has(`${s.x},${s.y}`));

            if (atGoal && (level.stars.length === 0 || allStars)) {
                showToast('🎉 Berhasil!', 'success');
                onLevelComplete(level.id);
                if (currentLevel < levels.length - 1) {
                    setTimeout(() => loadLevel(currentLevel + 1), 1500);
                }
            } else if (!atGoal) {
                showToast('Robot belum sampai tujuan!', 'warning');
            } else {
                showToast('Ada bintang yang belum dikumpulkan!', 'warning');
            }
        } catch (e) {
            console.error('Error:', e);
            showToast('Error: ' + (e as Error).message, 'error');
        }

        setIsRunning(false);
    }, [currentCode, currentLevel, isRunning, level, levels.length, loadLevel, onLevelComplete, resetRobot, showToast]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🤖 Robot</h3>
                <LevelList levels={levels} currentLevel={currentLevel} onSelect={loadLevel} />
            </div>

            {/* Main */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Level {level.id}: {level.name}</h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Grid */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[#1a1a35] p-3 rounded-xl">
                        <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${level.width}, 1fr)` }}
                        >
                            {Array.from({ length: level.height }).map((_, y) =>
                                Array.from({ length: level.width }).map((_, x) => {
                                    const isRobot = robotPos.x === x && robotPos.y === y;
                                    const isGoal = level.goal.x === x && level.goal.y === y;
                                    const isStar = level.stars.some(s => s.x === x && s.y === y) && !collectedStars.has(`${x},${y}`);

                                    return (
                                        <div
                                            key={`${x}-${y}`}
                                            className="w-12 h-12 bg-[#2d2d5a] rounded flex items-center justify-center text-2xl"
                                        >
                                            {isRobot && (
                                                <span className="animate-bounce" style={{ transform: `rotate(${robotDir === 'north' ? -90 : robotDir === 'south' ? 90 : robotDir === 'west' ? 180 : 0}deg)` }}>
                                                    🤖
                                                </span>
                                            )}
                                            {!isRobot && isGoal && '🏁'}
                                            {!isRobot && isStar && '⭐'}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-4 my-2 text-sm text-gray-400">
                    <span>⭐ {collectedStars.size}/{level.stars.length}</span>
                    <span>🧭 {DIRECTION_ARROWS[robotDir]} {robotDir}</span>
                </div>

                <div className="flex gap-3 justify-center mt-2">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Berjalan...' : 'Jalankan'}
                    </Button>
                    <Button variant="warning" onClick={resetRobot} icon="🔄">Reset</Button>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
            </div>

            {/* Blockly */}
            <div className="bg-[#252547] rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">🧩 Blok Kode</h3>
                </div>
                <div className="flex-1 min-h-[500px]">
                    <BlocklyWorkspace toolbox={TOOLBOX} onCodeChange={setCurrentCode} />
                </div>
            </div>
        </div>
    );
}
