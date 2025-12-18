/**
 * BlockyKids - Animation Phase
 * With Dual Mode: Blockly blocks and Python code
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { AnimationLevel, Sprite } from '@/types';
import { executePythonAnimationCode, AnimationAction } from '@/services/codeExecutor';

interface AnimationPhaseProps {
    onLevelComplete: (levelId: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

// Extended AnimationLevel with allowedBlocks
interface ExtendedAnimationLevel extends AnimationLevel {
    allowedBlocks: string[];
}

// Block definitions with categories
const BLOCK_DEFINITIONS = {
    anim_move_right: { category: '🏃 Gerakan', colour: '#4CAF50' },
    anim_move_left: { category: '🏃 Gerakan', colour: '#4CAF50' },
    anim_move_up: { category: '🏃 Gerakan', colour: '#4CAF50' },
    anim_move_down: { category: '🏃 Gerakan', colour: '#4CAF50' },
    anim_jump: { category: '🏃 Gerakan', colour: '#4CAF50' },
    anim_rotate: { category: '🎨 Tampilan', colour: '#9C27B0' },
    anim_scale: { category: '🎨 Tampilan', colour: '#9C27B0' },
    anim_say: { category: '💬 Komunikasi', colour: '#2196F3' },
    repeat_times: { category: '🔁 Kontrol', colour: '#FF9800' },
    wait: { category: '🔁 Kontrol', colour: '#FF9800' },
};

// Generate toolbox based on allowed blocks
function generateToolbox(allowedBlocks: string[]) {
    // Get unique blocks
    const uniqueBlocks = [...new Set(allowedBlocks)];

    // Group blocks by category
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

const EXTENDED_LEVELS: ExtendedAnimationLevel[] = [
    {
        id: 1, name: 'Kucing Berjalan', difficulty: 'easy',
        description: 'Buat kucing berjalan ke kanan!',
        hint: 'Gunakan blok "Gerak Kanan" beberapa kali',
        sprites: [{ id: 'cat', emoji: '🐱', x: 50, y: 150 }],
        goal: { type: 'position', x: 400, tolerance: 50 },
        allowedBlocks: ['anim_move_right'],
    },
    {
        id: 2, name: 'Burung Terbang', difficulty: 'easy',
        description: 'Buat burung terbang ke atas!',
        hint: 'Gunakan blok "Gerak Atas"',
        sprites: [{ id: 'bird', emoji: '🐦', x: 250, y: 280 }],
        goal: { type: 'position', y: 50, tolerance: 50 },
        allowedBlocks: ['anim_move_up'],
    },
    {
        id: 3, name: 'Lompat!', difficulty: 'medium',
        description: 'Buat kelinci melompat!',
        hint: 'Gunakan blok "Lompat"',
        sprites: [{ id: 'rabbit', emoji: '🐰', x: 150, y: 200 }],
        goal: { type: 'action', action: 'jump' },
        allowedBlocks: ['anim_jump'],
    },
    {
        id: 4, name: 'Zig Zag', difficulty: 'medium',
        description: 'Buat lebah terbang zig-zag ke kanan!',
        hint: 'Kombinasikan gerak kanan dengan atas/bawah',
        sprites: [{ id: 'bee', emoji: '🐝', x: 50, y: 150 }],
        goal: { type: 'position', x: 400, tolerance: 100 },
        allowedBlocks: ['anim_move_right', 'anim_move_up', 'anim_move_down'],
    },
    {
        id: 5, name: 'Berputar', difficulty: 'medium',
        description: 'Buat bintang berputar 360 derajat!',
        hint: 'Gunakan blok "Putar" dengan 360',
        sprites: [{ id: 'star', emoji: '⭐', x: 250, y: 150 }],
        goal: { type: 'rotation', degrees: 360 },
        allowedBlocks: ['anim_rotate'],
    },
    {
        id: 6, name: 'Dialog', difficulty: 'hard',
        description: 'Buat kucing menyapa!',
        hint: 'Gunakan blok "Katakan"',
        sprites: [{ id: 'cat', emoji: '🐱', x: 250, y: 150 }],
        goal: { type: 'speech' },
        allowedBlocks: ['anim_say'],
    },
    {
        id: 9, name: '🎨 Sandbox', difficulty: 'free',
        description: 'Mode bebas! Berkreasi sesuka hati!',
        hint: 'Ekspresikan kreativitasmu!',
        sprites: [{ id: 'cat', emoji: '🐱', x: 100, y: 150 }, { id: 'dog', emoji: '🐕', x: 400, y: 150 }],
        goal: { type: 'free' },
        allowedBlocks: ['anim_move_right', 'anim_move_left', 'anim_move_up', 'anim_move_down', 'anim_jump', 'anim_rotate', 'anim_scale', 'anim_say', 'repeat_times', 'wait'], // All blocks available
    },
];

export default function AnimationPhase({ onLevelComplete, showToast }: AnimationPhaseProps) {
    const [levels] = useState(EXTENDED_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [sprites, setSprites] = useState<Sprite[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');
    const actionLogRef = useRef<string[]>([]);

    const level = levels[currentLevel];

    // Generate dynamic toolbox based on current level's allowed blocks
    const currentToolbox = useMemo(() => {
        return generateToolbox(level.allowedBlocks);
    }, [level.allowedBlocks]);

    // Python code template
    const pythonTemplate = useMemo(() => {
        return `# ${level.name}\n# ${level.description}\n\n# Fungsi yang tersedia:\n# moveRight(pixels), moveLeft(pixels), moveUp(pixels), moveDown(pixels)\n# jump(), rotate(degrees), scale(percent), say(text)\n\n`;
    }, [level.name, level.description]);

    // Initialize sprites when level changes
    const loadLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        const lvl = levels[idx];
        setSprites(lvl.sprites.map(s => ({
            ...s,
            name: s.id,
            initialX: s.x,
            initialY: s.y,
            rotation: 0,
            scale: 1,
            visible: true,
            speech: null,
            totalRotation: 0,
        })));
        actionLogRef.current = [];
    }, [levels]);

    // Load initial level
    useState(() => {
        loadLevel(0);
    });

    const handleRun = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        actionLogRef.current = [];

        // Reset sprites
        const lvl = levels[currentLevel];
        setSprites(lvl.sprites.map(s => ({
            ...s,
            name: s.id,
            initialX: s.x,
            initialY: s.y,
            rotation: 0,
            scale: 1,
            visible: true,
            speech: null,
            totalRotation: 0,
        })));

        await new Promise(r => setTimeout(r, 100));

        // Runtime functions
        const animMoveRight = async (pixels: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, x: s.x + pixels } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animMoveLeft = async (pixels: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, x: s.x - pixels } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animMoveUp = async (pixels: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, y: s.y - pixels } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animMoveDown = async (pixels: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, y: s.y + pixels } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animJump = async () => {
            actionLogRef.current.push('jump');
            for (let i = 0; i < 5; i++) {
                setSprites(prev => prev.map((s, idx) => idx === 0 ? { ...s, y: s.y - 10 } : s));
                await new Promise(r => setTimeout(r, 50));
            }
            for (let i = 0; i < 5; i++) {
                setSprites(prev => prev.map((s, idx) => idx === 0 ? { ...s, y: s.y + 10 } : s));
                await new Promise(r => setTimeout(r, 50));
            }
        };
        const animRotate = async (degrees: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, rotation: s.rotation + degrees, totalRotation: s.totalRotation + Math.abs(degrees) } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animScale = async (percent: number) => {
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, scale: percent / 100 } : s));
            await new Promise(r => setTimeout(r, 300));
        };
        const animSay = async (text: string) => {
            actionLogRef.current.push('speech');
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, speech: text } : s));
            await new Promise(r => setTimeout(r, 1500));
            setSprites(prev => prev.map((s, i) => i === 0 ? { ...s, speech: null } : s));
        };
        const wait = async (sec: number) => {
            await new Promise(r => setTimeout(r, sec * 1000));
        };

        try {
            if (workspaceMode === 'code') {
                // Python mode - execute via executor
                showToast('🐍 Menjalankan Python...', 'info');
                const result = await executePythonAnimationCode(currentCode);

                if (result.success && result.actions.length > 0) {
                    // Execute actions from Python
                    for (const action of result.actions) {
                        switch (action.type) {
                            case 'move_right': await animMoveRight(action.value || 50); break;
                            case 'move_left': await animMoveLeft(action.value || 50); break;
                            case 'move_up': await animMoveUp(action.value || 50); break;
                            case 'move_down': await animMoveDown(action.value || 50); break;
                            case 'jump': await animJump(); break;
                            case 'rotate': await animRotate(action.value || 90); break;
                            case 'scale': await animScale(action.value || 100); break;
                            case 'say': await animSay(action.text || ''); break;
                            case 'wait': await wait(action.value || 1); break;
                        }
                    }
                    showToast('✨ Animasi selesai!', 'success');
                } else if (!result.success) {
                    showToast('❌ Error Python: ' + result.error, 'error');
                    setIsRunning(false);
                    return;
                }
            } else {
                // Block mode - execute JavaScript locally
                // eslint-disable-next-line no-new-func
                const fn = new Function(
                    'animMoveRight', 'animMoveLeft', 'animMoveUp', 'animMoveDown',
                    'animJump', 'animRotate', 'animScale', 'animSay', 'wait',
                    `return (async () => { ${currentCode} })();`
                );
                await fn(animMoveRight, animMoveLeft, animMoveUp, animMoveDown, animJump, animRotate, animScale, animSay, wait);
                showToast('✨ Animasi selesai!', 'success');
            }
        } catch (e) {
            console.error('Error running animation:', e);
            showToast('Error: ' + (e as Error).message, 'error');
        }

        setIsRunning(false);
    }, [currentCode, currentLevel, isRunning, levels, showToast, workspaceMode]);

    const handleCheck = useCallback(() => {
        const goal = level.goal;
        let success = false;
        const sprite = sprites[0];

        if (!sprite) {
            showToast('Tidak ada sprite!', 'error');
            return;
        }

        switch (goal.type) {
            case 'position':
                if (goal.x !== undefined) {
                    success = Math.abs(sprite.x - goal.x) <= (goal.tolerance || 50);
                }
                if (goal.y !== undefined) {
                    success = Math.abs(sprite.y - goal.y) <= (goal.tolerance || 50);
                }
                break;
            case 'action':
                success = actionLogRef.current.includes(goal.action || '');
                break;
            case 'rotation':
                success = sprite.totalRotation >= (goal.degrees || 360);
                break;
            case 'speech':
                success = actionLogRef.current.includes('speech');
                break;
            case 'free':
                success = true;
                break;
        }

        if (success) {
            onLevelComplete(level.id);
            showToast('🎉 Berhasil!', 'success');
            if (currentLevel < levels.length - 1 && goal.type !== 'free') {
                setTimeout(() => loadLevel(currentLevel + 1), 1500);
            }
        } else {
            showToast('Belum tepat, coba lagi!', 'warning');
        }
    }, [currentLevel, level, levels.length, loadLevel, onLevelComplete, showToast, sprites]);

    const handleReset = useCallback(() => {
        loadLevel(currentLevel);
    }, [currentLevel, loadLevel]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🎬 Animasi</h3>
                <LevelList levels={levels} currentLevel={currentLevel} onSelect={loadLevel} />
            </div>

            {/* Main Stage */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Level {level.id}: {level.name}</h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Animation Stage */}
                <div className="flex-1 bg-gradient-to-b from-[#1a1a35] to-[#2d2d5a] rounded-xl relative overflow-hidden min-h-[300px]">
                    {sprites.map((sprite, idx) => (
                        <div
                            key={sprite.id + idx}
                            className="absolute transition-all duration-300 text-5xl"
                            style={{
                                left: sprite.x,
                                top: sprite.y,
                                transform: `rotate(${sprite.rotation}deg) scale(${sprite.scale})`,
                                opacity: sprite.visible ? 1 : 0,
                            }}
                        >
                            {sprite.emoji}
                            {sprite.speech && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white text-gray-800 px-3 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg mb-2">
                                    {sprite.speech}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 justify-center mt-4">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Berjalan...' : 'Jalankan'}
                    </Button>
                    <Button variant="warning" onClick={handleReset} icon="🔄">Reset</Button>
                    {level.goal.type !== 'free' && (
                        <Button variant="primary" onClick={handleCheck} icon="✓">Periksa</Button>
                    )}
                </div>

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
