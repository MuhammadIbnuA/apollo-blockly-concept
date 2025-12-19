/**
 * BlockyKids - Math Phase
 * With Dual Mode: Blockly blocks and Python code
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { MathLevel } from '@/types';
import { runPython } from '@/services/judge0';

interface MathPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

// Extended MathLevel with allowedBlocks
interface ExtendedMathLevel extends MathLevel {
    allowedBlocks: string[];
}

// Block definitions with categories
const BLOCK_DEFINITIONS = {
    math_number: { category: '🔢 Angka', colour: '#4ECDC4' },
    math_add: { category: '🔢 Angka', colour: '#4ECDC4' },
    math_subtract: { category: '🔢 Angka', colour: '#4ECDC4' },
    math_multiply: { category: '🔢 Angka', colour: '#4ECDC4' },
    math_set_var: { category: '📦 Variabel', colour: '#FF6B6B' },
    math_print: { category: '📤 Output', colour: '#45B7D1' },
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

const EXTENDED_LEVELS: ExtendedMathLevel[] = [
    {
        id: 1, name: 'Penjumlahan', difficulty: 'easy',
        description: 'Hitung 5 + 3 dan tampilkan hasilnya!',
        hint: 'Gunakan blok penjumlahan dan tampilkan',
        expectedOutput: ['8'],
        allowedBlocks: ['math_number', 'math_add', 'math_print'],
    },
    {
        id: 2, name: 'Pengurangan', difficulty: 'easy',
        description: 'Hitung 10 - 4!',
        hint: 'Gunakan blok pengurangan',
        expectedOutput: ['6'],
        allowedBlocks: ['math_number', 'math_subtract', 'math_print'],
    },
    {
        id: 3, name: 'Perkalian', difficulty: 'medium',
        description: 'Hitung 6 × 7!',
        hint: 'Gunakan blok perkalian',
        expectedOutput: ['42'],
        allowedBlocks: ['math_number', 'math_multiply', 'math_print'],
    },
    {
        id: 4, name: 'Variabel', difficulty: 'medium',
        description: 'Buat variabel "x" dengan nilai 10 dan tampilkan!',
        hint: 'Set variabel lalu tampilkan',
        expectedOutput: ['10'],
        allowedBlocks: ['math_number', 'math_set_var'],
    },
    {
        id: 5, name: 'Hitung Keliling', difficulty: 'hard',
        description: 'Keliling persegi dengan sisi 5 adalah?',
        hint: 'Keliling = 4 × sisi',
        expectedOutput: ['20'],
        allowedBlocks: ['math_number', 'math_multiply', 'math_print'],
    },
    {
        id: 10, name: 'Kalkulator Bebas', difficulty: 'free',
        description: 'Buat perhitunganmu sendiri!',
        hint: 'Gunakan semua blok matematika',
        expectedOutput: [],
        allowedBlocks: ['math_number', 'math_add', 'math_subtract', 'math_multiply', 'math_set_var', 'math_print'], // All blocks available
    },
];

export default function MathPhase({ onLevelComplete, showToast }: MathPhaseProps) {
    const [levels] = useState(EXTENDED_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [output, setOutput] = useState<string[]>([]);
    const [variables, setVariables] = useState<Record<string, number>>({});
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');
    const [isRunning, setIsRunning] = useState(false);

    const level = levels[currentLevel];

    // Generate dynamic toolbox based on current level's allowed blocks
    const currentToolbox = useMemo(() => {
        return generateToolbox(level.allowedBlocks);
    }, [level.allowedBlocks]);

    // Python code template for the level
    const pythonTemplate = useMemo(() => {
        return `# ${level.name}\n# ${level.description}\n\n# Tulis kode Python kamu di sini\n# Gunakan print() untuk menampilkan output\n\n`;
    }, [level.name, level.description]);

    const handleRun = useCallback(async () => {
        setOutput([]);
        setVariables({});
        setIsRunning(true);

        if (workspaceMode === 'block') {
            // Block mode - run JavaScript locally
            const localVars: Record<string, number> = {};

            const mathPrint = (value: number) => {
                setOutput(prev => [...prev, String(value)]);
            };

            const mathSetVar = (name: string, value: number) => {
                localVars[name] = value;
                setVariables(prev => ({ ...prev, [name]: value }));
                mathPrint(value);
            };

            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('mathPrint', 'mathSetVar', currentCode);
                fn(mathPrint, mathSetVar);
                showToast('Program dijalankan!', 'info');
            } catch (e) {
                console.error('Error:', e);
                showToast('Error: ' + (e as Error).message, 'error');
            }
        } else {
            // Code mode - run Python via Judge0
            try {
                showToast('Menjalankan kode Python...', 'info');
                const result = await runPython(currentCode);

                if (result.status === 'success' && result.output) {
                    const lines = result.output.split('\n').filter(l => l.trim());
                    setOutput(lines);
                    showToast('✨ Program Python selesai!', 'success');
                } else if (result.status === 'compile_error') {
                    showToast('❌ Syntax Error: ' + result.error, 'error');
                } else if (result.status === 'error') {
                    showToast('❌ Error: ' + result.error, 'error');
                } else if (result.status === 'timeout') {
                    showToast('⏱️ Timeout: Program terlalu lama', 'warning');
                }
            } catch (e) {
                console.error('Judge0 Error:', e);
                showToast('❌ Gagal menjalankan kode. Pastikan Judge0 server aktif.', 'error');
            }
        }

        setIsRunning(false);
    }, [currentCode, workspaceMode, showToast]);

    const handleCheck = useCallback(() => {
        const expected = level.expectedOutput;

        // Free mode
        if (expected.length === 0) {
            if (output.length > 0) {
                onLevelComplete(level.id);
                showToast('🎉 Bagus! Lanjutkan eksplorasi!', 'success');
            } else {
                showToast('Jalankan program dulu!', 'warning');
            }
            return;
        }

        // Check output matches expected
        const isCorrect = expected.every((exp, idx) => output[idx] === exp);

        if (isCorrect) {
            onLevelComplete(level.id);
            showToast('🎉 Benar!', 'success');
            if (currentLevel < levels.length - 1) {
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    setOutput([]);
                    setVariables({});
                }, 1500);
            }
        } else {
            showToast(`Jawabanmu: ${output.join(', ')} - Yang benar: ${expected.join(', ')}`, 'warning');
        }
    }, [currentLevel, level, levels.length, onLevelComplete, output, showToast]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🧮 Math Quest</h3>
                <LevelList levels={levels} currentLevel={currentLevel} onSelect={(idx) => { setCurrentLevel(idx); setOutput([]); setVariables({}); }} />
            </div>

            {/* Main */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Level {level.id}: {level.name}</h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Output Panel */}
                <div className="bg-[#1a1a35] rounded-xl mb-4">
                    <div className="flex justify-between items-center p-3 border-b border-white/10">
                        <span className="font-semibold">📤 Output</span>
                        <Button variant="secondary" size="sm" onClick={() => setOutput([])}>Bersihkan</Button>
                    </div>
                    <div className="p-4 min-h-[100px] font-mono">
                        {output.length === 0 ? (
                            <p className="text-gray-500 italic">Output akan muncul di sini...</p>
                        ) : (
                            output.map((o, i) => (
                                <div key={i} className="text-green-400 text-xl">→ {o}</div>
                            ))
                        )}
                    </div>
                </div>

                {/* Variables Panel */}
                <div className="bg-[#1a1a35] rounded-xl mb-4 flex-1">
                    <div className="p-3 border-b border-white/10 font-semibold">📦 Variabel</div>
                    <div className="p-4">
                        {Object.keys(variables).length === 0 ? (
                            <p className="text-gray-500 italic text-sm">Belum ada variabel</p>
                        ) : (
                            Object.entries(variables).map(([name, value]) => (
                                <div key={name} className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-purple-400 font-semibold">{name}</span>
                                    <span className="text-green-400">{value}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button variant="success" onClick={handleRun} disabled={isRunning} icon="▶️">
                        {isRunning ? 'Menjalankan...' : 'Jalankan'}
                    </Button>
                    <Button variant="primary" onClick={handleCheck} disabled={isRunning} icon="✓">Periksa</Button>
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
