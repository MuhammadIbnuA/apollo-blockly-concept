/**
 * BlockyKids - Pixel Art Phase
 * With Dual Mode: Blockly blocks and Python code
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { PixelArtLevel } from '@/types';
import { executePythonPixelCode, PixelAction } from '@/services/codeExecutor';

interface PixelArtPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    initialLevel?: ExtendedPixelArtLevel;
}

const GRID_SIZE = 8;

// Extended PixelArtLevel with allowedBlocks
interface ExtendedPixelArtLevel extends PixelArtLevel {
    allowedBlocks: string[];
}

// Block definitions with categories
const BLOCK_DEFINITIONS = {
    pixel_set_color: { category: '🎨 Gambar', colour: '#E91E63' },
    pixel_draw: { category: '🎨 Gambar', colour: '#E91E63' },
    pixel_move_right: { category: '➡️ Gerakan', colour: '#4CAF50' },
    pixel_move_down: { category: '➡️ Gerakan', colour: '#4CAF50' },
    repeat_times: { category: '🔁 Kontrol', colour: '#FF9800' },
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

const EXTENDED_LEVELS: ExtendedPixelArtLevel[] = [
    {
        id: 1, name: 'Garis Horizontal', difficulty: 'easy',
        description: 'Gambar garis dari kiri ke kanan (5 pixel)!',
        hint: 'Gunakan "Gambar" lalu "Geser Kanan" berulang',
        target: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        allowedBlocks: ['pixel_draw', 'pixel_move_right'],
    },
    {
        id: 2, name: 'Garis Vertikal', difficulty: 'easy',
        description: 'Gambar garis dari atas ke bawah!',
        hint: 'Gunakan "Gambar" dan "Geser Bawah"',
        target: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        allowedBlocks: ['pixel_draw', 'pixel_move_down'],
    },
    {
        id: 3, name: 'Huruf L', difficulty: 'medium',
        description: 'Gambar huruf L!',
        hint: 'Garis vertikal lalu garis horizontal',
        target: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3]],
        allowedBlocks: ['pixel_draw', 'pixel_move_right', 'pixel_move_down'],
    },
    {
        id: 4, name: 'Kotak', difficulty: 'medium',
        description: 'Gambar kotak 3x3!',
        hint: 'Gunakan pengulangan untuk efisiensi',
        target: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
        allowedBlocks: ['pixel_draw', 'pixel_move_right', 'pixel_move_down', 'repeat_times'],
    },
    {
        id: 8, name: 'Seni Bebas', difficulty: 'free',
        description: 'Gambar apapun yang kamu mau!',
        hint: 'Ekspresikan kreativitasmu!',
        target: [],
        allowedBlocks: ['pixel_set_color', 'pixel_draw', 'pixel_move_right', 'pixel_move_down', 'repeat_times'], // All blocks available
    },
];

export default function PixelArtPhase({ onLevelComplete, showToast, initialLevel }: PixelArtPhaseProps) {
    const [levels] = useState(initialLevel ? [initialLevel] : EXTENDED_LEVELS);
    const isSingleLevelMode = !!initialLevel;
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [grid, setGrid] = useState<string[][]>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
    );
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [currentColor, setCurrentColor] = useState('#ff0000');
    const [isRunning, setIsRunning] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');
    const drawnPixelsRef = useRef<Set<string>>(new Set());

    const level = useMemo(() => {
        const lvl = levels[currentLevel];
        // Provide defaults for custom challenges that may not have all fields
        return {
            ...lvl,
            target: lvl.target || [],
        };
    }, [levels, currentLevel]);

    // Generate dynamic toolbox based on current level's allowed blocks
    const currentToolbox = useMemo(() => {
        // Use allowedBlocks from level, or default to all blocks for custom challenges
        const blocks = level.allowedBlocks || ['pixel_set_color', 'pixel_draw', 'pixel_move_right', 'pixel_move_down', 'repeat_times'];
        return generateToolbox(blocks);
    }, [level.allowedBlocks]);

    // Python code template
    const pythonTemplate = useMemo(() => {
        return `# ${level.name}\n# ${level.description}\n\n# Fungsi yang tersedia:\n# draw() - Gambar pixel\n# moveRight() - Geser kanan\n# moveDown() - Geser bawah\n# setColor(color) - Set warna\n\n`;
    }, [level.name, level.description]);

    const resetGrid = useCallback(() => {
        setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
        setCursorPos({ x: 0, y: 0 });
        setCurrentColor('#ff0000');
        drawnPixelsRef.current = new Set();
    }, []);

    const handleRun = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        resetGrid();
        drawnPixelsRef.current = new Set();

        await new Promise(r => setTimeout(r, 100));

        // Use a mutable grid to collect all drawing operations
        const tempGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        let cx = 0, cy = 0;
        let color = '#ff0000';

        // Color name to hex mapping
        const COLOR_MAP: Record<string, string> = {
            merah: '#ff0000',
            hijau: '#00ff00',
            biru: '#0000ff',
            kuning: '#ffff00',
            oranye: '#ff8800',
            ungu: '#9900ff',
            pink: '#ff69b4',
            coklat: '#8b4513',
            hitam: '#000000',
            putih: '#ffffff',
            abu: '#808080',
        };

        const pixelDraw = () => {
            if (cx >= 0 && cx < GRID_SIZE && cy >= 0 && cy < GRID_SIZE) {
                tempGrid[cy][cx] = color;
                drawnPixelsRef.current.add(`${cx},${cy}`);
            }
        };

        const pixelMoveRight = () => {
            cx = Math.min(cx + 1, GRID_SIZE - 1);
        };

        const pixelMoveDown = () => {
            cy = Math.min(cy + 1, GRID_SIZE - 1);
        };

        const pixelSetColor = (c: string) => {
            // Support both hex codes and Indonesian color names
            if (c.startsWith('#')) {
                color = c;
            } else {
                color = COLOR_MAP[c.toLowerCase()] || '#ff0000';
            }
        };

        try {
            if (workspaceMode === 'code') {
                // Python mode
                showToast('🐍 Menjalankan Python...', 'info');
                const result = await executePythonPixelCode(currentCode);

                if (result.success && result.actions.length > 0) {
                    for (const action of result.actions) {
                        switch (action.type) {
                            case 'draw':
                                if (action.color) color = action.color;
                                pixelDraw();
                                break;
                            case 'move_right': pixelMoveRight(); break;
                            case 'move_down': pixelMoveDown(); break;
                            case 'set_color':
                                if (action.color) pixelSetColor(action.color);
                                break;
                        }
                    }
                    setGrid(tempGrid.map(row => [...row]));
                    setCursorPos({ x: cx, y: cy });
                    setCurrentColor(color);
                    showToast('🎨 Gambar selesai!', 'success');
                } else if (!result.success) {
                    showToast('❌ Error Python: ' + result.error, 'error');
                    setIsRunning(false);
                    return;
                }
            } else {
                // Block mode - JavaScript
                // eslint-disable-next-line no-new-func
                const fn = new Function('pixelDraw', 'pixelMoveRight', 'pixelMoveDown', 'pixelSetColor', currentCode);
                fn(pixelDraw, pixelMoveRight, pixelMoveDown, pixelSetColor);
                setGrid(tempGrid.map(row => [...row]));
                setCursorPos({ x: cx, y: cy });
                setCurrentColor(color);
                showToast('🎨 Gambar selesai!', 'success');
            }
        } catch (e) {
            console.error('Error:', e);
            showToast('Error: ' + (e as Error).message, 'error');
        }

        setIsRunning(false);
    }, [currentCode, isRunning, resetGrid, showToast, workspaceMode]);

    const handleCheck = useCallback(() => {
        const target = level.target;

        // Free mode
        if (target.length === 0) {
            if (drawnPixelsRef.current.size > 0) {
                onLevelComplete(level.id);
                showToast('🎉 Karya yang bagus!', 'success');
            } else {
                showToast('Gambar sesuatu dulu!', 'warning');
            }
            return;
        }

        // Check all target pixels are drawn
        const allDrawn = target.every(([x, y]) => drawnPixelsRef.current.has(`${x},${y}`));

        if (allDrawn) {
            onLevelComplete(level.id);
            showToast('🎉 Sempurna!', 'success');
            if (currentLevel < levels.length - 1) {
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    resetGrid();
                }, 1500);
            }
        } else {
            showToast('Belum lengkap, coba lagi!', 'warning');
        }
    }, [currentLevel, level, levels.length, onLevelComplete, resetGrid, showToast]);

    // Render target preview
    const renderTarget = () => {
        const targetGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        level.target.forEach(([x, y]) => {
            if (x < GRID_SIZE && y < GRID_SIZE) {
                targetGrid[y][x] = '#888';
            }
        });
        return targetGrid;
    };

    return (
        <div className={`grid grid-cols-1 ${isSingleLevelMode ? 'lg:grid-cols-2' : 'lg:grid-cols-[220px_1fr_1fr]'} gap-5 min-h-[calc(100vh-94px)]`}>
            {/* Sidebar - only show when not in single level mode */}
            {!isSingleLevelMode && (
                <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">🎨 Pixel Art</h3>
                    <LevelList levels={levels} currentLevel={currentLevel} onSelect={(idx) => { setCurrentLevel(idx); resetGrid(); }} />
                </div>
            )}

            {/* Main */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">{isSingleLevelMode ? level.name : `Level ${level.id}: ${level.name}`}</h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Canvases */}
                <div className="flex-1 flex justify-center items-center gap-8 flex-wrap">
                    {/* Target */}
                    {level.target.length > 0 && (
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">Target</p>
                            <div className="bg-[#1a1a35] p-2 rounded-xl">
                                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                                    {renderTarget().flat().map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-sm"
                                            style={{ backgroundColor: color || '#2d2d5a' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Canvas */}
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">Gambarmu</p>
                        <div className="bg-[#1a1a35] p-2 rounded-xl">
                            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                                {grid.flat().map((color, i) => {
                                    const x = i % GRID_SIZE;
                                    const y = Math.floor(i / GRID_SIZE);
                                    const isCursor = x === cursorPos.x && y === cursorPos.y;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-6 h-6 rounded-sm transition-colors ${isCursor ? 'ring-2 ring-yellow-400' : ''}`}
                                            style={{ backgroundColor: color || '#2d2d5a' }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-center items-center mt-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a35] rounded-lg">
                        <span className="text-sm text-gray-400">Warna:</span>
                        <div
                            className="w-6 h-6 rounded-md border-2 border-white/30"
                            style={{ backgroundColor: currentColor }}
                            title={`Warna saat ini: ${currentColor}`}
                        />
                    </div>
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Menggambar...' : 'Jalankan'}
                    </Button>
                    <Button variant="warning" onClick={resetGrid} icon="🔄">Reset</Button>
                    <Button variant="primary" onClick={handleCheck} icon="✓">Periksa</Button>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 p-2 bg-[#00cec9]/10 border-l-4 border-[#00cec9] rounded-r-xl text-gray-400 text-sm">
                    <span>🎨</span>
                    <span>Tip: Pasang blok "Warna" sebelum "Gambar pixel" untuk mengubah warna!</span>
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
                        maxBlocks={level.maxBlocks}
                    />
                </div>
            </div>
        </div>
    );
}
