/**
 * BlockyKids - Blockly Workspace Component
 * Client-side only Blockly integration
 */

'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        Blockly: any;
    }
}

export interface BlocklyToolboxCategory {
    kind: 'category';
    name: string;
    colour: string;
    contents: Array<{ kind: 'block'; type: string }>;
}

interface BlocklyWorkspaceProps {
    toolbox: {
        kind: 'categoryToolbox';
        contents: BlocklyToolboxCategory[];
    };
    onWorkspaceChange?: (workspace: any) => void;
    onCodeChange?: (code: string) => void;
}

export default function BlocklyWorkspace({
    toolbox,
    onWorkspaceChange,
    onCodeChange,
}: BlocklyWorkspaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<any>(null);
    const [isBlocklyLoaded, setIsBlocklyLoaded] = useState(false);

    useEffect(() => {
        // Check if Blockly is loaded
        const checkBlockly = () => {
            if (window.Blockly) {
                setIsBlocklyLoaded(true);
                return true;
            }
            return false;
        };

        if (!checkBlockly()) {
            // Load Blockly script if not loaded
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/blockly/blockly.min.js';
            script.async = true;
            script.onload = () => {
                setTimeout(() => setIsBlocklyLoaded(true), 100);
            };
            document.head.appendChild(script);
        }

        return () => {
            if (workspaceRef.current) {
                workspaceRef.current.dispose();
                workspaceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isBlocklyLoaded || !containerRef.current || !window.Blockly) return;
        if (workspaceRef.current) return; // Already initialized

        try {
            // Define custom blocks if not defined
            defineCustomBlocks();

            // Create workspace
            workspaceRef.current = window.Blockly.inject(containerRef.current, {
                toolbox,
                theme: window.Blockly.Themes.Dark,
                grid: {
                    spacing: 20,
                    length: 3,
                    colour: '#444',
                    snap: true,
                },
                zoom: {
                    controls: true,
                    wheel: true,
                    startScale: 0.9,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2,
                },
                trashcan: true,
                move: {
                    scrollbars: true,
                    drag: true,
                    wheel: true,
                },
            });

            // Notify parent
            onWorkspaceChange?.(workspaceRef.current);

            // Listen for changes
            workspaceRef.current.addChangeListener(() => {
                if (onCodeChange && window.Blockly.JavaScript) {
                    const code = window.Blockly.JavaScript.workspaceToCode(workspaceRef.current);
                    onCodeChange(code);
                }
            });
        } catch (e) {
            console.error('Error initializing Blockly:', e);
        }
    }, [isBlocklyLoaded, toolbox, onWorkspaceChange, onCodeChange]);

    if (!isBlocklyLoaded) {
        return (
            <div className="h-full flex items-center justify-center bg-[#1e1e2e]">
                <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4 animate-spin">⚙️</div>
                    <p>Memuat Blockly...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    );
}

// Define custom blocks
function defineCustomBlocks() {
    if (!window.Blockly || window.Blockly.__blockskyDefined) return;
    window.Blockly.__blockskyDefined = true;

    const Blockly = window.Blockly;

    // ===== MOVEMENT BLOCKS =====
    Blockly.Blocks['move_forward'] = {
        init: function () {
            this.appendDummyInput().appendField('⬆️ Maju');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip('Robot bergerak maju satu langkah');
        }
    };

    Blockly.Blocks['turn_left'] = {
        init: function () {
            this.appendDummyInput().appendField('↩️ Belok Kiri');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['turn_right'] = {
        init: function () {
            this.appendDummyInput().appendField('↪️ Belok Kanan');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    // ===== CONTROL BLOCKS =====
    Blockly.Blocks['repeat_times'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔁 Ulangi')
                .appendField(new Blockly.FieldNumber(3, 1, 20), 'TIMES')
                .appendField('kali');
            this.appendStatementInput('DO').appendField('lakukan:');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(290);
        }
    };

    // ===== ACTION BLOCKS =====
    Blockly.Blocks['collect_star'] = {
        init: function () {
            this.appendDummyInput().appendField('⭐ Ambil Bintang');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(45);
        }
    };

    Blockly.Blocks['wait'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⏱️ Tunggu')
                .appendField(new Blockly.FieldNumber(1, 0.1, 10), 'SECONDS')
                .appendField('detik');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(45);
        }
    };

    // ===== ANIMATION BLOCKS =====
    Blockly.Blocks['anim_move_right'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('➡️ Gerak kanan')
                .appendField(new Blockly.FieldNumber(50, 1, 500), 'PIXELS')
                .appendField('pixel');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['anim_move_left'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⬅️ Gerak kiri')
                .appendField(new Blockly.FieldNumber(50, 1, 500), 'PIXELS')
                .appendField('pixel');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['anim_move_up'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⬆️ Gerak atas')
                .appendField(new Blockly.FieldNumber(50, 1, 500), 'PIXELS')
                .appendField('pixel');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['anim_move_down'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⬇️ Gerak bawah')
                .appendField(new Blockly.FieldNumber(50, 1, 500), 'PIXELS')
                .appendField('pixel');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['anim_jump'] = {
        init: function () {
            this.appendDummyInput().appendField('🦘 Lompat');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['anim_rotate'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔄 Putar')
                .appendField(new Blockly.FieldNumber(90, -360, 360), 'DEGREES')
                .appendField('derajat');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(290);
        }
    };

    Blockly.Blocks['anim_scale'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📏 Ubah ukuran')
                .appendField(new Blockly.FieldNumber(100, 10, 300), 'PERCENT')
                .appendField('%');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(290);
        }
    };

    Blockly.Blocks['anim_say'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('💬 Katakan')
                .appendField(new Blockly.FieldTextInput('Halo!'), 'TEXT');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    // ===== PIXEL ART BLOCKS =====
    Blockly.Blocks['pixel_draw'] = {
        init: function () {
            this.appendDummyInput().appendField('🎨 Gambar pixel');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
        }
    };

    Blockly.Blocks['pixel_move_right'] = {
        init: function () {
            this.appendDummyInput().appendField('➡️ Geser kanan');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['pixel_move_down'] = {
        init: function () {
            this.appendDummyInput().appendField('⬇️ Geser bawah');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['pixel_set_color'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎨 Warna')
                .appendField(new Blockly.FieldColour('#ff0000'), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
        }
    };

    // ===== MATH BLOCKS =====
    Blockly.Blocks['math_number'] = {
        init: function () {
            this.appendDummyInput()
                .appendField(new Blockly.FieldNumber(0), 'NUM');
            this.setOutput(true, 'Number');
            this.setColour(230);
        }
    };

    Blockly.Blocks['math_print'] = {
        init: function () {
            this.appendValueInput('VALUE')
                .setCheck('Number')
                .appendField('📤 Tampilkan');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['math_add'] = {
        init: function () {
            this.appendValueInput('A').setCheck('Number');
            this.appendValueInput('B').setCheck('Number').appendField('➕');
            this.setInputsInline(true);
            this.setOutput(true, 'Number');
            this.setColour(230);
        }
    };

    Blockly.Blocks['math_subtract'] = {
        init: function () {
            this.appendValueInput('A').setCheck('Number');
            this.appendValueInput('B').setCheck('Number').appendField('➖');
            this.setInputsInline(true);
            this.setOutput(true, 'Number');
            this.setColour(230);
        }
    };

    Blockly.Blocks['math_multiply'] = {
        init: function () {
            this.appendValueInput('A').setCheck('Number');
            this.appendValueInput('B').setCheck('Number').appendField('✖️');
            this.setInputsInline(true);
            this.setOutput(true, 'Number');
            this.setColour(230);
        }
    };

    Blockly.Blocks['math_set_var'] = {
        init: function () {
            this.appendValueInput('VALUE')
                .setCheck('Number')
                .appendField('📦 Set')
                .appendField(new Blockly.FieldTextInput('x'), 'VAR')
                .appendField('=');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
        }
    };

    // ===== MUSIC BLOCKS =====
    Blockly.Blocks['music_play_note'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎵 Mainkan')
                .appendField(new Blockly.FieldDropdown([
                    ['Do', 'C4'], ['Re', 'D4'], ['Mi', 'E4'], ['Fa', 'F4'],
                    ['Sol', 'G4'], ['La', 'A4'], ['Si', 'B4'], ['Do↑', 'C5']
                ]), 'NOTE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
        }
    };

    Blockly.Blocks['music_rest'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⏸️ Jeda')
                .appendField(new Blockly.FieldNumber(1, 0.5, 4, 0.5), 'BEATS')
                .appendField('ketuk');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
        }
    };

    // ===== CODE GENERATORS =====
    if (Blockly.JavaScript) {
        Blockly.JavaScript.forBlock['move_forward'] = () => 'await moveForward();\n';
        Blockly.JavaScript.forBlock['turn_left'] = () => 'await turnLeft();\n';
        Blockly.JavaScript.forBlock['turn_right'] = () => 'await turnRight();\n';
        Blockly.JavaScript.forBlock['collect_star'] = () => 'await collectStar();\n';
        Blockly.JavaScript.forBlock['wait'] = (block: any) => `await wait(${block.getFieldValue('SECONDS')});\n`;

        Blockly.JavaScript.forBlock['repeat_times'] = (block: any) => {
            const times = block.getFieldValue('TIMES');
            const branch = Blockly.JavaScript.statementToCode(block, 'DO');
            return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
        };

        Blockly.JavaScript.forBlock['anim_move_right'] = (block: any) => `await animMoveRight(${block.getFieldValue('PIXELS')});\n`;
        Blockly.JavaScript.forBlock['anim_move_left'] = (block: any) => `await animMoveLeft(${block.getFieldValue('PIXELS')});\n`;
        Blockly.JavaScript.forBlock['anim_move_up'] = (block: any) => `await animMoveUp(${block.getFieldValue('PIXELS')});\n`;
        Blockly.JavaScript.forBlock['anim_move_down'] = (block: any) => `await animMoveDown(${block.getFieldValue('PIXELS')});\n`;
        Blockly.JavaScript.forBlock['anim_jump'] = () => `await animJump();\n`;
        Blockly.JavaScript.forBlock['anim_rotate'] = (block: any) => `await animRotate(${block.getFieldValue('DEGREES')});\n`;
        Blockly.JavaScript.forBlock['anim_scale'] = (block: any) => `await animScale(${block.getFieldValue('PERCENT')});\n`;
        Blockly.JavaScript.forBlock['anim_say'] = (block: any) => `await animSay("${block.getFieldValue('TEXT')}");\n`;

        Blockly.JavaScript.forBlock['pixel_draw'] = () => 'pixelDraw();\n';
        Blockly.JavaScript.forBlock['pixel_move_right'] = () => 'pixelMoveRight();\n';
        Blockly.JavaScript.forBlock['pixel_move_down'] = () => 'pixelMoveDown();\n';
        Blockly.JavaScript.forBlock['pixel_set_color'] = (block: any) => `pixelSetColor("${block.getFieldValue('COLOR')}");\n`;

        Blockly.JavaScript.forBlock['math_number'] = (block: any) => [block.getFieldValue('NUM'), Blockly.JavaScript.ORDER_ATOMIC];
        Blockly.JavaScript.forBlock['math_print'] = (block: any) => {
            const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '0';
            return `mathPrint(${value});\n`;
        };
        Blockly.JavaScript.forBlock['math_add'] = (block: any) => {
            const a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_ADDITION) || '0';
            const b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_ADDITION) || '0';
            return [`(${a} + ${b})`, Blockly.JavaScript.ORDER_ADDITION];
        };
        Blockly.JavaScript.forBlock['math_subtract'] = (block: any) => {
            const a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';
            const b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';
            return [`(${a} - ${b})`, Blockly.JavaScript.ORDER_SUBTRACTION];
        };
        Blockly.JavaScript.forBlock['math_multiply'] = (block: any) => {
            const a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';
            const b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';
            return [`(${a} * ${b})`, Blockly.JavaScript.ORDER_MULTIPLICATION];
        };
        Blockly.JavaScript.forBlock['math_set_var'] = (block: any) => {
            const varName = block.getFieldValue('VAR');
            const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
            return `mathSetVar("${varName}", ${value});\n`;
        };

        Blockly.JavaScript.forBlock['music_play_note'] = (block: any) => `await musicPlayNote("${block.getFieldValue('NOTE')}");\n`;
        Blockly.JavaScript.forBlock['music_rest'] = (block: any) => `await musicRest(${block.getFieldValue('BEATS')});\n`;
    }
}
