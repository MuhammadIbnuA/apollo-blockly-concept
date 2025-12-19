/**
 * BlockyKids - Blockly Workspace Component
 * Client-side only Blockly integration using npm package
 */

'use client';

import { useEffect, useRef, useState } from 'react';

// Blockly and JavaScript generator - will be dynamically imported
let Blockly: any = null;
let javascriptGenerator: any = null;
let Order: any = null;

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
        // Dynamically import Blockly (client-side only)
        const loadBlockly = async () => {
            if (Blockly && javascriptGenerator) {
                setIsBlocklyLoaded(true);
                return;
            }

            try {
                const blocklyModule = await import('blockly');
                const javascriptModule = await import('blockly/javascript');

                Blockly = blocklyModule.default || blocklyModule;
                javascriptGenerator = javascriptModule.javascriptGenerator;
                Order = javascriptModule.Order;

                setIsBlocklyLoaded(true);
            } catch (error) {
                console.error('Failed to load Blockly:', error);
            }
        };

        loadBlockly();

        return () => {
            if (workspaceRef.current) {
                workspaceRef.current.dispose();
                workspaceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isBlocklyLoaded || !containerRef.current || !Blockly) return;

        // Dispose previous workspace if exists (to recreate with new toolbox)
        if (workspaceRef.current) {
            workspaceRef.current.dispose();
            workspaceRef.current = null;
        }

        try {
            // Define custom blocks if not defined
            defineCustomBlocks();

            // Create workspace with current toolbox
            workspaceRef.current = Blockly.inject(containerRef.current, {
                toolbox,
                theme: Blockly.Themes.Dark,
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
                if (onCodeChange && javascriptGenerator) {
                    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
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
        <div className="blockly-wrapper" style={{ minHeight: '500px' }}>
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}

// Track if custom blocks are defined
let blocksDefinedFlag = false;
let generatorsDefinedFlag = false;

// Define custom blocks
function defineCustomBlocks() {
    if (!Blockly || blocksDefinedFlag) return;
    blocksDefinedFlag = true;

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
                .appendField(new Blockly.FieldDropdown([
                    ['🔴 Merah', 'merah'],
                    ['🟠 Oranye', 'oranye'],
                    ['🟡 Kuning', 'kuning'],
                    ['🟢 Hijau', 'hijau'],
                    ['🔵 Biru', 'biru'],
                    ['🟣 Ungu', 'ungu'],
                    ['⚫ Hitam', 'hitam'],
                    ['⚪ Putih', 'putih'],
                    ['🟤 Coklat', 'coklat'],
                    ['💗 Pink', 'pink'],
                    ['⬜ Abu-abu', 'abu']
                ]), 'COLOR');
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

    // ===== BUILDING BLOCKS =====
    Blockly.Blocks['build_place_block'] = {
        init: function () {
            this.appendDummyInput().appendField('🧱 Taruh Blok');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip('Letakkan blok di posisi saat ini');
        }
    };

    Blockly.Blocks['build_remove_block'] = {
        init: function () {
            this.appendDummyInput().appendField('🗑️ Hapus Blok');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip('Hapus blok di posisi saat ini');
        }
    };

    Blockly.Blocks['build_move_x'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('➡️ Gerak X')
                .appendField(new Blockly.FieldNumber(1, -10, 10), 'DISTANCE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip('Gerakkan kursor ke kiri/kanan');
        }
    };

    Blockly.Blocks['build_move_y'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⬆️ Gerak Y')
                .appendField(new Blockly.FieldNumber(1, -10, 10), 'DISTANCE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip('Gerakkan kursor ke atas/bawah (tinggi)');
        }
    };

    Blockly.Blocks['build_move_z'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('↗️ Gerak Z')
                .appendField(new Blockly.FieldNumber(1, -10, 10), 'DISTANCE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip('Gerakkan kursor ke depan/belakang');
        }
    };

    Blockly.Blocks['build_set_color'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎨 Warna')
                .appendField(new Blockly.FieldDropdown([
                    ['🔴 Merah', '#e74c3c'],
                    ['🟠 Oranye', '#e67e22'],
                    ['🟡 Kuning', '#f1c40f'],
                    ['🟢 Hijau', '#2ecc71'],
                    ['🔵 Biru', '#3498db'],
                    ['🟣 Ungu', '#9b59b6'],
                    ['⚪ Putih', '#ecf0f1'],
                    ['🟤 Coklat', '#795548'],
                    ['⬛ Abu-abu', '#95a5a6']
                ]), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('Pilih warna blok');
        }
    };

    Blockly.Blocks['build_goto'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📍 Ke posisi X')
                .appendField(new Blockly.FieldNumber(0, 0, 10), 'X')
                .appendField('Y')
                .appendField(new Blockly.FieldNumber(0, 0, 10), 'Y')
                .appendField('Z')
                .appendField(new Blockly.FieldNumber(0, 0, 10), 'Z');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(260);
            this.setTooltip('Pindah ke posisi tertentu');
        }
    };

    // Register code generators
    registerCodeGenerators();
}

// Register code generators separately to handle timing issues
function registerCodeGenerators() {
    if (!javascriptGenerator || generatorsDefinedFlag) return;
    generatorsDefinedFlag = true;

    javascriptGenerator.forBlock['move_forward'] = () => 'await moveForward();\n';
    javascriptGenerator.forBlock['turn_left'] = () => 'await turnLeft();\n';
    javascriptGenerator.forBlock['turn_right'] = () => 'await turnRight();\n';
    javascriptGenerator.forBlock['collect_star'] = () => 'await collectStar();\n';
    javascriptGenerator.forBlock['wait'] = (block: any) => `await wait(${block.getFieldValue('SECONDS')});\n`;

    javascriptGenerator.forBlock['repeat_times'] = (block: any) => {
        const times = block.getFieldValue('TIMES');
        const branch = javascriptGenerator.statementToCode(block, 'DO');
        return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
    };

    javascriptGenerator.forBlock['anim_move_right'] = (block: any) => `await animMoveRight(${block.getFieldValue('PIXELS')});\n`;
    javascriptGenerator.forBlock['anim_move_left'] = (block: any) => `await animMoveLeft(${block.getFieldValue('PIXELS')});\n`;
    javascriptGenerator.forBlock['anim_move_up'] = (block: any) => `await animMoveUp(${block.getFieldValue('PIXELS')});\n`;
    javascriptGenerator.forBlock['anim_move_down'] = (block: any) => `await animMoveDown(${block.getFieldValue('PIXELS')});\n`;
    javascriptGenerator.forBlock['anim_jump'] = () => `await animJump();\n`;
    javascriptGenerator.forBlock['anim_rotate'] = (block: any) => `await animRotate(${block.getFieldValue('DEGREES')});\n`;
    javascriptGenerator.forBlock['anim_scale'] = (block: any) => `await animScale(${block.getFieldValue('PERCENT')});\n`;
    javascriptGenerator.forBlock['anim_say'] = (block: any) => `await animSay("${block.getFieldValue('TEXT')}");\n`;

    javascriptGenerator.forBlock['pixel_draw'] = () => 'pixelDraw();\n';
    javascriptGenerator.forBlock['pixel_move_right'] = () => 'pixelMoveRight();\n';
    javascriptGenerator.forBlock['pixel_move_down'] = () => 'pixelMoveDown();\n';
    javascriptGenerator.forBlock['pixel_set_color'] = (block: any) => `pixelSetColor("${block.getFieldValue('COLOR')}");\n`;

    javascriptGenerator.forBlock['math_number'] = (block: any) => [block.getFieldValue('NUM'), Order.ATOMIC];
    javascriptGenerator.forBlock['math_print'] = (block: any) => {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
        return `mathPrint(${value});\n`;
    };
    javascriptGenerator.forBlock['math_add'] = (block: any) => {
        const a = javascriptGenerator.valueToCode(block, 'A', Order.ADDITION) || '0';
        const b = javascriptGenerator.valueToCode(block, 'B', Order.ADDITION) || '0';
        return [`(${a} + ${b})`, Order.ADDITION];
    };
    javascriptGenerator.forBlock['math_subtract'] = (block: any) => {
        const a = javascriptGenerator.valueToCode(block, 'A', Order.SUBTRACTION) || '0';
        const b = javascriptGenerator.valueToCode(block, 'B', Order.SUBTRACTION) || '0';
        return [`(${a} - ${b})`, Order.SUBTRACTION];
    };
    javascriptGenerator.forBlock['math_multiply'] = (block: any) => {
        const a = javascriptGenerator.valueToCode(block, 'A', Order.MULTIPLICATION) || '0';
        const b = javascriptGenerator.valueToCode(block, 'B', Order.MULTIPLICATION) || '0';
        return [`(${a} * ${b})`, Order.MULTIPLICATION];
    };
    javascriptGenerator.forBlock['math_set_var'] = (block: any) => {
        const varName = block.getFieldValue('VAR');
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
        return `mathSetVar("${varName}", ${value});\n`;
    };

    javascriptGenerator.forBlock['music_play_note'] = (block: any) => `await musicPlayNote("${block.getFieldValue('NOTE')}");\n`;
    javascriptGenerator.forBlock['music_rest'] = (block: any) => `await musicRest(${block.getFieldValue('BEATS')});\n`;

    // Building generators
    javascriptGenerator.forBlock['build_place_block'] = () => 'buildPlaceBlock();\n';
    javascriptGenerator.forBlock['build_remove_block'] = () => 'buildRemoveBlock();\n';
    javascriptGenerator.forBlock['build_move_x'] = (block: any) => `buildMoveX(${block.getFieldValue('DISTANCE')});\n`;
    javascriptGenerator.forBlock['build_move_y'] = (block: any) => `buildMoveY(${block.getFieldValue('DISTANCE')});\n`;
    javascriptGenerator.forBlock['build_move_z'] = (block: any) => `buildMoveZ(${block.getFieldValue('DISTANCE')});\n`;
    javascriptGenerator.forBlock['build_set_color'] = (block: any) => `buildSetColor("${block.getFieldValue('COLOR')}");\n`;
    javascriptGenerator.forBlock['build_goto'] = (block: any) => `buildGoto(${block.getFieldValue('X')}, ${block.getFieldValue('Y')}, ${block.getFieldValue('Z')});\n`;
}

