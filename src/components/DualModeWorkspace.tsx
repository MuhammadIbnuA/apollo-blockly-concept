/**
 * BlockyKids - Dual Mode Workspace Component
 * Component yang menggabungkan Blockly dan Code Editor dengan toggle mode
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import BlocklyWorkspace from './BlocklyWorkspace';
import CodeEditor from './CodeEditor';
import { checkJudge0Health } from '@/services/judge0';

export type WorkspaceMode = 'block' | 'code';

interface BlocklyToolboxCategory {
    kind: 'category';
    name: string;
    colour: string;
    contents: Array<{ kind: 'block'; type: string }>;
}

export interface DualModeWorkspaceProps {
    toolbox: {
        kind: 'categoryToolbox';
        contents: BlocklyToolboxCategory[];
    };
    onCodeChange: (code: string) => void;
    onModeChange?: (mode: WorkspaceMode) => void;
    initialMode?: WorkspaceMode;
    starterPythonCode?: string;
    pythonCodeTemplate?: string;
    showModeToggle?: boolean;
    maxBlocks?: number;
}

export default function DualModeWorkspace({
    toolbox,
    onCodeChange,
    onModeChange,
    initialMode = 'block',
    starterPythonCode = '',
    pythonCodeTemplate = '# Write your Python code here\n\n',
    showModeToggle = true,
    maxBlocks,
}: DualModeWorkspaceProps) {
    const [mode, setMode] = useState<WorkspaceMode>(initialMode);
    const [blocklyCode, setBlocklyCode] = useState('');
    const [pythonCode, setPythonCode] = useState(starterPythonCode || pythonCodeTemplate);
    const [isJudge0Available, setIsJudge0Available] = useState<boolean | null>(null);
    const workspaceRef = useRef<any>(null);

    // Check Judge0 availability on mount
    useEffect(() => {
        const checkHealth = async () => {
            const isAvailable = await checkJudge0Health();
            setIsJudge0Available(isAvailable);
        };
        checkHealth();
    }, []);

    // Handle Blockly code change
    const handleBlocklyCodeChange = useCallback((code: string) => {
        setBlocklyCode(code);
        if (mode === 'block') {
            onCodeChange(code);
        }
    }, [mode, onCodeChange]);

    // Handle Python code change
    const handlePythonCodeChange = useCallback((code: string) => {
        setPythonCode(code);
        if (mode === 'code') {
            onCodeChange(code);
        }
    }, [mode, onCodeChange]);

    // Convert Blockly JavaScript code to Python hint code
    const convertBlockCodeToPython = useCallback((jsCode: string): string => {
        if (!jsCode || jsCode.trim() === '') {
            return pythonCodeTemplate;
        }

        // Parse the JavaScript code and convert to Python equivalents
        let pythonHint = '# 🎯 Kode Python berdasarkan blok kamu:\n\n';

        // Replace JavaScript robot commands with Python equivalents
        const conversions = [
            { js: /await moveForward\(\);?/g, py: 'maju()  # moveForward()' },
            { js: /await turnLeft\(\);?/g, py: 'belok_kiri()  # turnLeft()' },
            { js: /await turnRight\(\);?/g, py: 'belok_kanan()  # turnRight()' },
            { js: /await collectStar\(\);?/g, py: 'ambil_bintang()  # collectStar()' },
            { js: /await wait\((\d+)\);?/g, py: 'tunggu($1)  # wait($1)' },
            // Pixel art commands
            { js: /pixelDraw\(\);?/g, py: 'gambar()  # draw()' },
            { js: /pixelSetColor\(['"](.+?)['"]\);?/g, py: 'warna("$1")' },
            { js: /pixelMoveRight\(\);?/g, py: 'geser_kanan()  # moveRight()' },
            { js: /pixelMoveDown\(\);?/g, py: 'geser_bawah()  # moveDown()' },
            // Legacy/Robot commands
            { js: /await draw\(\);?/g, py: 'gambar()  # draw()' },
            // Animation commands
            { js: /await moveUp\((\d+)\);?/g, py: 'gerak_atas($1)  # moveUp($1)' },
            { js: /await jump\(\);?/g, py: 'lompat()  # jump()' },
            { js: /await rotate\((\d+)\);?/g, py: 'putar($1)  # rotate($1)' },
            { js: /await scale\((\d+)\);?/g, py: 'skala($1)  # scale($1)' },
            { js: /await say\(['"](.+?)['"]\);?/g, py: 'katakan("$1")  # say("$1")' },
            // Music commands
            { js: /await playNote\(['"](.+?)['"]\);?/g, py: 'mainkan_nada("$1")  # playNote("$1")' },
            { js: /await rest\((\d+)\);?/g, py: 'istirahat($1)  # rest($1)' },
            // Math commands
            { js: /console\.log\((.+?)\);?/g, py: 'print($1)' },
        ];

        // Handle loops
        let processedCode = jsCode;

        // Convert for loops
        const loopMatch = processedCode.match(/for \(let i = 0; i < (\d+); i\+\+\) \{([^}]+)\}/g);
        if (loopMatch) {
            loopMatch.forEach(loop => {
                const countMatch = loop.match(/i < (\d+)/);
                const count = countMatch ? countMatch[1] : '1';
                const bodyMatch = loop.match(/\{([^}]+)\}/);
                let body = bodyMatch ? bodyMatch[1] : '';

                // Convert body commands
                conversions.forEach(conv => {
                    body = body.replace(conv.js, conv.py);
                });

                pythonHint += `for i in range(${count}):\n`;
                const lines = body.trim().split('\n').filter(l => l.trim());
                lines.forEach(line => {
                    pythonHint += `    ${line.trim()}\n`;
                });
                pythonHint += '\n';
            });

            // Remove loops from processing
            processedCode = processedCode.replace(/for \(let i = 0; i < \d+; i\+\+\) \{[^}]+\}/g, '');
        }

        // Convert remaining single commands
        conversions.forEach(conv => {
            const matches = processedCode.match(conv.js);
            if (matches) {
                matches.forEach(() => {
                    pythonHint += processedCode.replace(conv.js, conv.py).trim() + '\n';
                });
            }
        });

        // If no commands found, show the template with hint
        if (pythonHint === '# 🎯 Kode Python berdasarkan blok kamu:\n\n') {
            return pythonCodeTemplate + '\n# Tambahkan blok di mode Blok untuk melihat contoh kode Python';
        }

        return pythonHint;
    }, [pythonCodeTemplate]);

    // Handle mode change
    const handleModeChange = useCallback((newMode: WorkspaceMode) => {
        setMode(newMode);
        onModeChange?.(newMode);

        // Emit the appropriate code based on mode
        if (newMode === 'block') {
            onCodeChange(blocklyCode);
        } else {
            // When switching to code mode, generate Python hints from blocks if available
            if (blocklyCode && blocklyCode.trim() !== '') {
                const pythonHintCode = convertBlockCodeToPython(blocklyCode);
                setPythonCode(pythonHintCode);
                onCodeChange(pythonHintCode);
            } else {
                onCodeChange(pythonCode);
            }
        }
    }, [blocklyCode, pythonCode, onCodeChange, onModeChange, convertBlockCodeToPython]);

    // Reset Python code when starter code changes
    useEffect(() => {
        if (starterPythonCode) {
            setPythonCode(starterPythonCode);
        }
    }, [starterPythonCode]);

    return (
        <div className="flex flex-col h-full">
            {/* Mode Toggle Header */}
            {showModeToggle && (
                <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#1a1a35]">
                    <div className="flex items-center gap-2">
                        {/* Block Mode Button */}
                        <button
                            onClick={() => handleModeChange('block')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'block'
                                ? 'bg-[#6c5ce7] text-white shadow-lg shadow-purple-500/30'
                                : 'bg-[#252547] text-gray-400 hover:bg-[#2a2a50] hover:text-white'
                                }`}
                        >
                            <span>🧩</span>
                            <span>Blok</span>
                        </button>

                        {/* Code Mode Button */}
                        <button
                            onClick={() => handleModeChange('code')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'code'
                                ? 'bg-[#00b894] text-white shadow-lg shadow-green-500/30'
                                : 'bg-[#252547] text-gray-400 hover:bg-[#2a2a50] hover:text-white'
                                }`}
                        >
                            <span>💻</span>
                            <span>Kode Python</span>
                        </button>
                    </div>

                    {/* Judge0 Status Indicator */}
                    {mode === 'code' && (
                        <div className="flex items-center gap-2 text-sm">
                            <span
                                className={`w-2 h-2 rounded-full ${isJudge0Available === null
                                    ? 'bg-yellow-500 animate-pulse'
                                    : isJudge0Available
                                        ? 'bg-green-500'
                                        : 'bg-red-500'
                                    }`}
                            />
                            <span className="text-gray-400">
                                {isJudge0Available === null
                                    ? 'Checking...'
                                    : isJudge0Available
                                        ? 'Judge0 Ready'
                                        : 'Judge0 Offline'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Workspace Content */}
            <div className="flex-1 relative overflow-hidden">
                {/* Block Mode - Blockly Workspace */}
                <div
                    className={`absolute inset-0 transition-opacity duration-200 ${mode === 'block' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                >
                    <BlocklyWorkspace
                        toolbox={toolbox}
                        onCodeChange={handleBlocklyCodeChange}
                        onWorkspaceChange={(ws) => {
                            workspaceRef.current = ws;
                            // Just update ref, code change handled by onCodeChange prop passed to BlocklyWorkspace
                            // Wait, BlocklyWorkspace actually calls onCodeChange already.
                            // But here we might want to capture ws reference if needed.
                            // Actually setBlocklyCode is called in handleBlocklyCodeChange which is passed to onCodeChange.
                        }}
                        maxBlocks={maxBlocks}
                    />
                </div>

                {/* Code Mode - Monaco Editor */}
                <div
                    className={`absolute inset-0 transition-opacity duration-200 ${mode === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                >
                    <CodeEditor
                        value={pythonCode}
                        onChange={handlePythonCodeChange}
                        language="python"
                    />
                </div>
            </div>

            {/* Mode Indicator Footer */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-[#1a1a35] text-xs text-gray-500">
                <span>
                    Mode: {mode === 'block' ? '🧩 Block (JavaScript)' : '💻 Code (Python)'}
                </span>
                {mode === 'code' && !isJudge0Available && (
                    <span className="text-yellow-500">
                        ⚠️ Judge0 offline - code execution unavailable
                    </span>
                )}
            </div>
        </div>
    );
}
