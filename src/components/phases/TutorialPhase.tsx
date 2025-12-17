/**
 * BlockyKids - Tutorial Phase
 * Fase pengenalan dasar block programming
 */

'use client';

import { useState, useCallback } from 'react';
import { BaseLevel } from '@/types';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';

interface TutorialPhaseProps {
    onLevelComplete: (levelId: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface TutorialLevel extends BaseLevel {
    instruction: string;
    targetBlocks: string[];
}

const DEFAULT_LEVELS: TutorialLevel[] = [
    {
        id: 1,
        name: 'Seret Blok',
        difficulty: 'easy',
        description: 'Pelajari cara menyeret blok dari toolbox ke workspace',
        hint: 'Klik dan tahan blok, lalu geser ke area kerja',
        instruction: 'Seret blok "Maju" dari panel kiri ke area kerja!',
        targetBlocks: ['move_forward'],
    },
    {
        id: 2,
        name: 'Sambung Blok',
        difficulty: 'easy',
        description: 'Hubungkan dua blok menjadi satu program',
        hint: 'Blok akan menempel saat kamu dekatkan',
        instruction: 'Sambungkan blok "Maju" dengan "Maju" lagi!',
        targetBlocks: ['move_forward', 'move_forward'],
    },
    {
        id: 3,
        name: 'Tekan Jalankan',
        difficulty: 'easy',
        description: 'Jalankan programmu dan lihat hasilnya',
        hint: 'Tombol hijau di atas area kerja',
        instruction: 'Tekan tombol ▶️ Jalankan untuk melihat robot bergerak!',
        targetBlocks: ['move_forward'],
    },
    {
        id: 4,
        name: 'Blok Belok',
        difficulty: 'easy',
        description: 'Gunakan blok belok untuk mengubah arah',
        hint: 'Coba blok "Belok Kiri" atau "Belok Kanan"',
        instruction: 'Buat robot belok dengan blok "Belok Kiri"!',
        targetBlocks: ['turn_left'],
    },
    {
        id: 5,
        name: 'Kombinasi',
        difficulty: 'medium',
        description: 'Gabungkan maju dan belok',
        hint: 'Maju dulu, lalu belok, lalu maju lagi',
        instruction: 'Buat robot berjalan membentuk huruf L!',
        targetBlocks: ['move_forward', 'turn_left', 'move_forward'],
    },
    {
        id: 6,
        name: 'Pengulangan',
        difficulty: 'medium',
        description: 'Gunakan blok ulangi untuk efisiensi',
        hint: 'Blok "Ulangi" ada di kategori Kontrol',
        instruction: 'Gunakan "Ulangi 3 kali" dengan "Maju" di dalamnya!',
        targetBlocks: ['repeat_times'],
    },
    {
        id: 7,
        name: 'Ambil Bintang',
        difficulty: 'medium',
        description: 'Gunakan blok aksi untuk mengambil item',
        hint: 'Blok "Ambil Bintang" ada di kategori Aksi',
        instruction: 'Arahkan robot ke bintang dan gunakan "Ambil Bintang"!',
        targetBlocks: ['collect_star'],
    },
    {
        id: 8,
        name: 'Selesai!',
        difficulty: 'easy',
        description: 'Kamu sudah siap untuk petualangan!',
        hint: 'Lanjut ke fase Robot untuk tantangan lebih seru!',
        instruction: 'Selamat! Klik tombol Periksa untuk menyelesaikan tutorial!',
        targetBlocks: [],
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

export default function TutorialPhase({ onLevelComplete, showToast }: TutorialPhaseProps) {
    const [levels] = useState<TutorialLevel[]>(DEFAULT_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [robotPosition, setRobotPosition] = useState({ x: 2, y: 2 });
    const [currentCode, setCurrentCode] = useState('');

    const level = levels[currentLevel];

    const handleRun = useCallback(async () => {
        showToast('Program dijalankan!', 'info');

        // Define runtime functions
        const moveForward = async () => {
            setRobotPosition(prev => ({ ...prev, x: prev.x + 1 }));
            await new Promise(r => setTimeout(r, 500));
        };
        const turnLeft = async () => {
            await new Promise(r => setTimeout(r, 300));
        };
        const turnRight = async () => {
            await new Promise(r => setTimeout(r, 300));
        };
        const collectStar = async () => {
            showToast('⭐ Bintang diambil!', 'success');
            await new Promise(r => setTimeout(r, 300));
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
        } catch (e) {
            console.error('Error running code:', e);
        }
    }, [currentCode, showToast]);

    const handleCheck = useCallback(() => {
        onLevelComplete(level.id);
        showToast('🎉 Bagus sekali!', 'success');

        if (currentLevel < levels.length - 1) {
            setTimeout(() => setCurrentLevel(prev => prev + 1), 1000);
        }
    }, [currentLevel, level.id, levels.length, onLevelComplete, showToast]);

    const handleReset = useCallback(() => {
        setRobotPosition({ x: 2, y: 2 });
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar - Level List */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🎓 Tutorial</h3>
                <LevelList
                    levels={levels}
                    currentLevel={currentLevel}
                    onSelect={setCurrentLevel}
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

                {/* Instruction */}
                <div className="bg-[#6c5ce7]/20 border-l-4 border-[#6c5ce7] p-4 rounded-r-xl mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🤖</span>
                        <p className="text-lg">{level.instruction}</p>
                    </div>
                </div>

                {/* Mini Grid */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-black/30 p-2 rounded-xl">
                        <div className="grid grid-cols-5 gap-1">
                            {Array.from({ length: 25 }).map((_, i) => {
                                const x = i % 5;
                                const y = Math.floor(i / 5);
                                const isRobot = x === robotPosition.x && y === robotPosition.y;
                                const isGoal = x === 4 && y === 2;
                                const isStar = x === 3 && y === 2;

                                return (
                                    <div
                                        key={i}
                                        className="w-12 h-12 bg-[#1a1a35] rounded flex items-center justify-center text-2xl"
                                    >
                                        {isRobot && <span className="animate-bounce">🤖</span>}
                                        {isGoal && !isRobot && '🏁'}
                                        {isStar && !isRobot && '⭐'}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center mt-4">
                    <Button variant="success" onClick={handleRun} icon="▶️">
                        Jalankan
                    </Button>
                    <Button variant="warning" onClick={handleReset} icon="🔄">
                        Reset
                    </Button>
                    <Button variant="primary" onClick={handleCheck} icon="✓">
                        Periksa
                    </Button>
                </div>

                {/* Hint */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
            </div>

            {/* Blockly Workspace */}
            <div className="bg-[#252547] rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">🧩 Blok Kode</h3>
                </div>
                <div className="flex-1 min-h-[500px]">
                    <BlocklyWorkspace
                        toolbox={TOOLBOX}
                        onCodeChange={setCurrentCode}
                    />
                </div>
            </div>
        </div>
    );
}
