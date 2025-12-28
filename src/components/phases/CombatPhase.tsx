/**
 * BlockyKids - Combat Phase (OOP Strategy)
 * Target: Ages 13-14 (Full Text Phase)
 * Concept: Object Oriented Programming, Methods, API usage
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import DualModeWorkspace, { WorkspaceMode } from '@/components/DualModeWorkspace';
import { CombatLevel, CombatUnit } from '@/types';
import { executePythonCombatCode, getCombatPythonTemplate, CombatUnitData } from '@/services/codeExecutor';

interface CombatPhaseProps {
    onLevelComplete: (levelId: number | string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    initialLevel?: ExtendedCombatLevel;
}

interface ExtendedCombatLevel extends CombatLevel {
    allowedBlocks: string[];
}

// Block definitions for Combat phase
const BLOCK_DEFINITIONS = {
    combat_select_target: { category: '⚔️ Aksi', colour: '#e74c3c' },
    combat_attack: { category: '⚔️ Aksi', colour: '#e74c3c' },
    combat_distance: { category: '📏 Pengukuran', colour: '#3498db' },
    combat_in_range: { category: '📏 Pengukuran', colour: '#3498db' },
    combat_get_hp: { category: '❤️ Status', colour: '#e91e63' },
    combat_get_position: { category: '❤️ Status', colour: '#e91e63' },
    for_each_enemy: { category: '🔁 Kontrol', colour: '#9C27B0' },
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

const DEFAULT_HERO: CombatUnit = {
    id: 'hero',
    name: 'Pahlawan',
    emoji: '🦸',
    x: 2,
    y: 4,
    hp: 100,
    attack: 25,
    range: 3,
};

const DEFAULT_LEVELS: ExtendedCombatLevel[] = [
    {
        id: 1,
        name: 'Serang Terdekat',
        difficulty: 'easy',
        description: 'Serang musuh yang paling dekat!',
        hint: 'Gunakan jarak_ke() untuk menghitung jarak',
        hero: { ...DEFAULT_HERO },
        enemies: [
            { id: 'goblin1', name: 'Goblin', emoji: '👺', x: 6, y: 4, hp: 30, attack: 10, range: 1 },
            { id: 'goblin2', name: 'Goblin', emoji: '👺', x: 4, y: 2, hp: 30, attack: 10, range: 1 },
        ],
        gridSize: { width: 8, height: 8 },
        expectedTarget: 'goblin2',
        allowedBlocks: ['combat_select_target', 'combat_attack', 'combat_distance', 'for_each_enemy', 'if_compare', 'compare_values', 'variables'],
    },
    {
        id: 2,
        name: 'Prioritas HP Rendah',
        difficulty: 'easy',
        description: 'Serang musuh dengan HP terendah!',
        hint: 'Bandingkan HP setiap musuh',
        hero: { ...DEFAULT_HERO },
        enemies: [
            { id: 'orc1', name: 'Orc', emoji: '👹', x: 5, y: 3, hp: 80, attack: 15, range: 1 },
            { id: 'orc2', name: 'Orc Lemah', emoji: '👹', x: 5, y: 5, hp: 20, attack: 15, range: 1 },
            { id: 'orc3', name: 'Orc', emoji: '👹', x: 3, y: 1, hp: 60, attack: 15, range: 1 },
        ],
        gridSize: { width: 8, height: 8 },
        expectedTarget: 'orc2',
        allowedBlocks: ['combat_select_target', 'combat_attack', 'combat_get_hp', 'for_each_enemy', 'if_compare', 'compare_values', 'variables'],
    },
    {
        id: 3,
        name: 'Dalam Jangkauan',
        difficulty: 'medium',
        description: 'Serang musuh terdekat yang dalam jangkauan!',
        hint: 'Gunakan dalam_jangkauan() untuk cek range',
        hero: { ...DEFAULT_HERO, range: 2 },
        enemies: [
            { id: 'skeleton1', name: 'Skeleton', emoji: '💀', x: 1, y: 4, hp: 40, attack: 12, range: 1 },
            { id: 'skeleton2', name: 'Skeleton', emoji: '💀', x: 6, y: 4, hp: 40, attack: 12, range: 1 },
            { id: 'skeleton3', name: 'Skeleton', emoji: '💀', x: 4, y: 4, hp: 40, attack: 12, range: 1 },
        ],
        gridSize: { width: 8, height: 8 },
        expectedTarget: 'skeleton3',
        allowedBlocks: ['combat_select_target', 'combat_attack', 'combat_distance', 'combat_in_range', 'for_each_enemy', 'if_compare', 'compare_values', 'variables'],
    },
    {
        id: 4,
        name: 'Strategi Kompleks',
        difficulty: 'hard',
        description: 'Serang musuh dengan damage tertinggi yang dalam jangkauan!',
        hint: 'Kombinasikan cek range dan perbandingan attack',
        hero: { ...DEFAULT_HERO, range: 4 },
        enemies: [
            { id: 'dragon1', name: 'Dragon', emoji: '🐉', x: 1, y: 1, hp: 100, attack: 50, range: 3 },
            { id: 'wolf1', name: 'Wolf', emoji: '🐺', x: 4, y: 3, hp: 30, attack: 20, range: 1 },
            { id: 'wolf2', name: 'Wolf', emoji: '🐺', x: 5, y: 5, hp: 30, attack: 35, range: 1 },
            { id: 'bat1', name: 'Bat', emoji: '🦇', x: 0, y: 4, hp: 15, attack: 8, range: 1 },
        ],
        gridSize: { width: 8, height: 8 },
        expectedTarget: 'wolf2',
        allowedBlocks: ['combat_select_target', 'combat_attack', 'combat_distance', 'combat_in_range', 'combat_get_hp', 'combat_get_position', 'for_each_enemy', 'if_compare', 'compare_values', 'variables'],
    },
    {
        id: 5,
        name: '⚔️ Arena Bebas',
        difficulty: 'free',
        description: 'Mode sandbox - buat strategi unikmu!',
        hint: 'Eksperimen dengan berbagai algoritma',
        hero: { ...DEFAULT_HERO, range: 5 },
        enemies: [
            { id: 'boss', name: 'Boss', emoji: '👿', x: 6, y: 1, hp: 200, attack: 40, range: 2 },
            { id: 'minion1', name: 'Minion', emoji: '👾', x: 5, y: 2, hp: 25, attack: 15, range: 1 },
            { id: 'minion2', name: 'Minion', emoji: '👾', x: 7, y: 2, hp: 25, attack: 15, range: 1 },
            { id: 'archer', name: 'Archer', emoji: '🏹', x: 7, y: 6, hp: 35, attack: 25, range: 4 },
            { id: 'mage', name: 'Mage', emoji: '🧙', x: 1, y: 7, hp: 40, attack: 30, range: 5 },
        ],
        gridSize: { width: 8, height: 8 },
        allowedBlocks: Object.keys(BLOCK_DEFINITIONS),
    },
];

export default function CombatPhase({ onLevelComplete, showToast, initialLevel }: CombatPhaseProps) {
    const [levels] = useState(initialLevel ? [initialLevel] : DEFAULT_LEVELS);
    const isSingleLevelMode = !!initialLevel;
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('block');
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [attackAnimation, setAttackAnimation] = useState<string | null>(null);
    const [failCount, setFailCount] = useState(0);
    const [parsonsMode, setParsonsMode] = useState(false);
    const [parsonsLines, setParsonsLines] = useState<string[]>([]);
    const dragItemRef = useRef<number | null>(null);

    const level = useMemo(() => levels[currentLevel], [levels, currentLevel]);

    const currentToolbox = useMemo(() => {
        const blocks = level.allowedBlocks || Object.keys(BLOCK_DEFINITIONS);
        return generateToolbox(blocks);
    }, [level.allowedBlocks]);

    const pythonTemplate = useMemo(() => {
        return getCombatPythonTemplate(level.id, level.name, level.description);
    }, [level.id, level.name, level.description]);

    // Auto-activate Parsons mode after 3 failures
    useEffect(() => {
        if (failCount >= 3 && !parsonsMode) {
            setParsonsMode(true);
            showToast('💡 Mode Parsons aktif! Susun baris kode yang benar', 'info');
            initializeParsonsMode();
        }
    }, [failCount, parsonsMode, showToast]);

    const initializeParsonsMode = useCallback(() => {
        // Generate scrambled code lines for the current level
        const correctLines = getCorrectCodeLines(level);
        const shuffled = [...correctLines].sort(() => Math.random() - 0.5);
        setParsonsLines(shuffled);
    }, [level]);

    const getCorrectCodeLines = (lvl: ExtendedCombatLevel): string[] => {
        // Generate correct solution lines based on level
        if (lvl.id === 1) {
            return [
                'target_terdekat = None',
                'jarak_min = 9999',
                'for musuh in daftar_musuh:',
                '    jarak = pahlawan.jarak_ke(musuh)',
                '    if jarak < jarak_min:',
                '        jarak_min = jarak',
                '        target_terdekat = musuh',
                'serang_target(target_terdekat)',
            ];
        } else if (lvl.id === 2) {
            return [
                'target_hp_rendah = None',
                'hp_min = 9999',
                'for musuh in daftar_musuh:',
                '    if musuh.hp < hp_min:',
                '        hp_min = musuh.hp',
                '        target_hp_rendah = musuh',
                'serang_target(target_hp_rendah)',
            ];
        }
        return [
            '# Tulis logika kamu di sini',
            'for musuh in daftar_musuh:',
            '    serang_target(musuh)',
            '    break',
        ];
    };

    const loadLevel = useCallback((idx: number) => {
        setCurrentLevel(idx);
        setSelectedTarget(null);
        setAttackAnimation(null);
        setFailCount(0);
        setParsonsMode(false);
    }, []);

    useEffect(() => {
        loadLevel(0);
    }, [loadLevel]);

    const handleRun = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        setSelectedTarget(null);
        setAttackAnimation(null);

        try {
            let codeToRun = currentCode;

            // If in Parsons mode, use the ordered lines
            if (parsonsMode) {
                codeToRun = parsonsLines.join('\n');
            }

            if (workspaceMode === 'code' || parsonsMode) {
                showToast('🐍 Menjalankan strategi...', 'info');

                const heroData: CombatUnitData = {
                    id: level.hero.id,
                    name: level.hero.name,
                    x: level.hero.x,
                    y: level.hero.y,
                    hp: level.hero.hp,
                    attack: level.hero.attack,
                    range: level.hero.range,
                };

                const enemiesData: CombatUnitData[] = level.enemies.map(e => ({
                    id: e.id,
                    name: e.name,
                    x: e.x,
                    y: e.y,
                    hp: e.hp,
                    attack: e.attack,
                    range: e.range,
                }));

                const result = await executePythonCombatCode(codeToRun, heroData, enemiesData);

                if (result.success && result.selectedTarget) {
                    setSelectedTarget(result.selectedTarget);
                    setAttackAnimation(result.selectedTarget);

                    await new Promise(r => setTimeout(r, 1000));
                    setAttackAnimation(null);

                    showToast(`⚔️ Target: ${result.selectedTarget}`, 'info');
                } else if (!result.success) {
                    showToast('❌ Error: ' + result.error, 'error');
                    setFailCount(prev => prev + 1);
                } else {
                    showToast('⚠️ Tidak ada target yang dipilih!', 'warning');
                    setFailCount(prev => prev + 1);
                }
            } else {
                // Block mode execution
                let targetId: string | null = null;
                const heroUnit = level.hero;
                const enemyUnits = level.enemies;

                const combatSelectTarget = (enemy: CombatUnit) => {
                    targetId = enemy.id;
                    return enemy;
                };

                const combatAttack = (enemy: CombatUnit) => {
                    targetId = enemy.id;
                    return enemy.id;
                };

                const combatDistance = (unit1: CombatUnit, unit2: CombatUnit) => {
                    return Math.sqrt(Math.pow(unit1.x - unit2.x, 2) + Math.pow(unit1.y - unit2.y, 2));
                };

                const combatInRange = (fromUnit: CombatUnit, toUnit: CombatUnit) => {
                    return combatDistance(fromUnit, toUnit) <= fromUnit.range;
                };

                try {
                    // eslint-disable-next-line no-new-func
                    const fn = new Function(
                        'hero', 'enemies', 'combatSelectTarget', 'combatAttack', 'combatDistance', 'combatInRange',
                        `return (async () => { ${currentCode} })();`
                    );
                    await fn(heroUnit, enemyUnits, combatSelectTarget, combatAttack, combatDistance, combatInRange);

                    if (targetId) {
                        setSelectedTarget(targetId);
                        setAttackAnimation(targetId);
                        await new Promise(r => setTimeout(r, 1000));
                        setAttackAnimation(null);
                        showToast(`⚔️ Target: ${targetId}`, 'info');
                    } else {
                        showToast('⚠️ Tidak ada target yang dipilih!', 'warning');
                        setFailCount(prev => prev + 1);
                    }
                } catch (e) {
                    showToast('❌ Error: ' + (e as Error).message, 'error');
                    setFailCount(prev => prev + 1);
                }
            }
        } catch (error) {
            showToast('❌ Error: ' + (error as Error).message, 'error');
            setFailCount(prev => prev + 1);
        }

        setIsRunning(false);
    }, [currentCode, isRunning, level, parsonsLines, parsonsMode, showToast, workspaceMode]);

    const handleCheck = useCallback(() => {
        if (!selectedTarget) {
            showToast('⚠️ Jalankan kode dulu!', 'warning');
            return;
        }

        if (level.expectedTarget && selectedTarget === level.expectedTarget) {
            onLevelComplete(level.id);
            showToast('🎉 Strategi benar! Target tepat!', 'success');
            setFailCount(0);
            if (currentLevel < levels.length - 1 && level.difficulty !== 'free') {
                setTimeout(() => loadLevel(currentLevel + 1), 1500);
            }
        } else if (!level.expectedTarget) {
            // Free mode
            showToast('✨ Mode bebas - kode berhasil dijalankan!', 'success');
        } else {
            showToast(`❌ Target salah! Kamu menyerang ${selectedTarget}, seharusnya ${level.expectedTarget}`, 'error');
            setFailCount(prev => prev + 1);
        }
    }, [selectedTarget, level, onLevelComplete, showToast, currentLevel, levels.length, loadLevel]);

    const handleReset = useCallback(() => {
        loadLevel(currentLevel);
    }, [currentLevel, loadLevel]);

    // Parsons mode drag handlers
    const handleDragStart = (index: number) => {
        dragItemRef.current = index;
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragItemRef.current === null) return;

        const newLines = [...parsonsLines];
        const draggedItem = newLines[dragItemRef.current];
        newLines.splice(dragItemRef.current, 1);
        newLines.splice(index, 0, draggedItem);

        dragItemRef.current = index;
        setParsonsLines(newLines);
    };

    const handleDragEnd = () => {
        dragItemRef.current = null;
    };

    return (
        <div className={`grid grid-cols-1 ${isSingleLevelMode ? 'lg:grid-cols-2' : 'lg:grid-cols-[220px_1fr_1fr]'} gap-5 min-h-[calc(100vh-94px)]`}>
            {/* Sidebar */}
            {!isSingleLevelMode && (
                <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">⚔️ Code Combat</h3>
                    <LevelList levels={levels} currentLevel={currentLevel} onSelect={loadLevel} />
                </div>
            )}

            {/* Main Stage - Tactical Grid */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                        {isSingleLevelMode ? level.name : `Level ${level.id}: ${level.name}`}
                    </h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Tactical Grid */}
                <div className="flex-1 bg-gradient-to-b from-[#1a1a35] to-[#2d2d5a] rounded-xl relative overflow-hidden min-h-[400px] p-4">
                    <div
                        className="grid gap-1 mx-auto"
                        style={{
                            gridTemplateColumns: `repeat(${level.gridSize.width}, 40px)`,
                            gridTemplateRows: `repeat(${level.gridSize.height}, 40px)`,
                        }}
                    >
                        {Array.from({ length: level.gridSize.height }).map((_, y) =>
                            Array.from({ length: level.gridSize.width }).map((_, x) => {
                                const isHero = level.hero.x === x && level.hero.y === y;
                                const enemy = level.enemies.find(e => e.x === x && e.y === y);
                                const isSelected = enemy && selectedTarget === enemy.id;
                                const isAttacking = enemy && attackAnimation === enemy.id;

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className={`
                                            w-10 h-10 rounded flex items-center justify-center text-2xl
                                            ${isHero ? 'bg-blue-500/30 ring-2 ring-blue-400' : ''}
                                            ${enemy ? 'bg-red-500/20' : ''}
                                            ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                                            ${isAttacking ? 'animate-pulse bg-red-500/50' : ''}
                                            ${!isHero && !enemy ? 'bg-gray-800/30' : ''}
                                        `}
                                    >
                                        {isHero && level.hero.emoji}
                                        {enemy && (
                                            <div className="relative">
                                                <span className={isAttacking ? 'animate-bounce' : ''}>
                                                    {enemy.emoji}
                                                </span>
                                                {/* HP bar */}
                                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded">
                                                    <div
                                                        className="h-full bg-red-500 rounded"
                                                        style={{ width: `${(enemy.hp / 100) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Hero Stats */}
                    <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span>{level.hero.emoji}</span>
                            <span className="font-semibold">{level.hero.name}</span>
                        </div>
                        <div>❤️ HP: {level.hero.hp}</div>
                        <div>⚔️ ATK: {level.hero.attack}</div>
                        <div>🎯 Range: {level.hero.range}</div>
                    </div>

                    {/* Enemy List */}
                    <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 text-sm max-h-[200px] overflow-y-auto">
                        <div className="font-semibold mb-2">Musuh:</div>
                        {level.enemies.map(enemy => (
                            <div
                                key={enemy.id}
                                className={`flex items-center gap-2 mb-1 ${selectedTarget === enemy.id ? 'text-yellow-400' : ''
                                    }`}
                            >
                                <span>{enemy.emoji}</span>
                                <span>{enemy.name}</span>
                                <span className="text-gray-400 text-xs">HP:{enemy.hp}</span>
                            </div>
                        ))}
                    </div>

                    {/* Fail Counter */}
                    {failCount > 0 && (
                        <div className="absolute bottom-4 left-4 bg-red-500/20 rounded-lg p-2 text-sm">
                            ❌ Gagal: {failCount}/3
                            {failCount >= 2 && failCount < 3 && (
                                <div className="text-xs text-gray-400">Mode Parsons akan aktif...</div>
                            )}
                        </div>
                    )}
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
                    {parsonsMode && (
                        <Button
                            variant="secondary"
                            onClick={() => setParsonsMode(false)}
                            icon="📝"
                        >
                            Mode Normal
                        </Button>
                    )}
                </div>

                {/* Hint */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
            </div>

            {/* Workspace - Code or Parsons Mode */}
            <div className="bg-[#252547] rounded-2xl overflow-hidden flex flex-col">
                {parsonsMode ? (
                    /* Parsons Problem Mode */
                    <div className="flex-1 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">🧩 Mode Parsons</h4>
                            <span className="text-sm text-gray-400">Seret baris untuk mengurutkan</span>
                        </div>
                        <div className="flex-1 bg-[#1a1a35] rounded-lg p-4 font-mono text-sm overflow-y-auto">
                            {parsonsLines.map((line, index) => (
                                <div
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                                        p-2 mb-2 rounded cursor-move border border-transparent
                                        hover:border-blue-400 hover:bg-blue-500/10
                                        ${line.startsWith('    ') ? 'ml-8' : ''}
                                        ${line.startsWith('        ') ? 'ml-12' : ''}
                                        bg-gray-800/50
                                    `}
                                >
                                    <span className="text-gray-500 mr-2">{index + 1}.</span>
                                    <span className="text-green-400">{line}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Normal Dual Mode Workspace */
                    <div className="flex-1 min-h-[500px]">
                        <DualModeWorkspace
                            toolbox={currentToolbox}
                            onCodeChange={setCurrentCode}
                            onModeChange={setWorkspaceMode}
                            initialMode="block"
                            pythonCodeTemplate={pythonTemplate}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
