/**
 * BlockyKids - Python Code Executor Service
 * Service untuk menjalankan Python code via local executor dengan phase-specific APIs
 */

import { runPython, ExecutionResult } from './judge0';

// ========== ROBOT/TUTORIAL PHASE ==========

export interface RobotAction {
    type: 'move_forward' | 'turn_left' | 'turn_right' | 'collect_star' | 'wait';
    value?: number;
}

export interface PythonExecutionResult {
    success: boolean;
    actions: RobotAction[];
    output?: string;
    error?: string;
    rawOutput?: string;
}

const PYTHON_ROBOT_TEMPLATE = `# BlockyKids Robot API
import json

_actions = []
_output_lines = []

def maju():
    """Robot maju satu langkah"""
    _actions.append({"type": "move_forward"})

def belok_kiri():
    """Robot belok kiri 90 derajat"""
    _actions.append({"type": "turn_left"})

def belok_kanan():
    """Robot belok kanan 90 derajat"""
    _actions.append({"type": "turn_right"})

def ambil_bintang():
    """Ambil bintang di posisi saat ini"""
    _actions.append({"type": "collect_star"})

def tunggu(detik=1):
    """Tunggu beberapa detik"""
    _actions.append({"type": "wait", "value": detik})

def cetak(pesan):
    """Cetak pesan ke output"""
    _output_lines.append(str(pesan))

# English aliases (snake_case)
move_forward = maju
turn_left = belok_kiri
turn_right = belok_kanan
collect_star = ambil_bintang
wait = tunggu

# camelCase aliases (for Blockly compatibility)
moveForward = maju
turnLeft = belok_kiri
turnRight = belok_kanan
collectStar = ambil_bintang

# ========== KODE KAMU DI BAWAH INI ==========

__USER_CODE__

# ========== HASIL OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions, "output": _output_lines}))
`;

export async function executePythonRobotCode(userCode: string): Promise<PythonExecutionResult> {
    const fullCode = PYTHON_ROBOT_TEMPLATE.replace('__USER_CODE__', userCode);

    try {
        const result: ExecutionResult = await runPython(fullCode);

        if (result.status === 'success' && result.output) {
            const markerIndex = result.output.indexOf('###BLOCKYKIDS_RESULT###');
            if (markerIndex !== -1) {
                const jsonPart = result.output.substring(markerIndex + '###BLOCKYKIDS_RESULT###'.length).trim();
                try {
                    const parsed = JSON.parse(jsonPart);
                    return {
                        success: true,
                        actions: parsed.actions || [],
                        output: parsed.output?.join('\n') || '',
                        rawOutput: result.output,
                    };
                } catch {
                    return { success: false, actions: [], error: 'Gagal parse hasil eksekusi', rawOutput: result.output };
                }
            }
            return { success: true, actions: [], output: result.output, rawOutput: result.output };
        }

        if (result.status === 'compile_error') {
            return { success: false, actions: [], error: 'Syntax Error: ' + result.error, rawOutput: result.error };
        }

        if (result.status === 'timeout') {
            return { success: false, actions: [], error: 'Timeout! Kode berjalan terlalu lama.' };
        }

        return { success: false, actions: [], error: result.error || result.stderr || 'Terjadi error', rawOutput: result.error || result.stderr };
    } catch (error) {
        return { success: false, actions: [], error: error instanceof Error ? error.message : 'Error tidak diketahui' };
    }
}

export function getTutorialPythonTemplate(levelId: number, levelName: string, instruction: string): string {
    return `# Level ${levelId}: ${levelName}
# ${instruction}

# Fungsi yang tersedia:
# - maju()        : Robot maju satu langkah
# - belok_kiri()  : Robot belok kiri
# - belok_kanan() : Robot belok kanan
# - ambil_bintang(): Ambil bintang
# - cetak(pesan)  : Tampilkan pesan

# Tulis kode kamu di bawah ini:

`;
}

export function countPythonActions(code: string): number {
    const patterns = [
        /maju\s*\(\s*\)/g, /move_forward\s*\(\s*\)/g,
        /belok_kiri\s*\(\s*\)/g, /turn_left\s*\(\s*\)/g,
        /belok_kanan\s*\(\s*\)/g, /turn_right\s*\(\s*\)/g,
        /ambil_bintang\s*\(\s*\)/g, /collect_star\s*\(\s*\)/g,
    ];
    let count = 0;
    for (const pattern of patterns) {
        const matches = code.match(pattern);
        if (matches) count += matches.length;
    }
    const forLoops = code.match(/for\s+\w+\s+in\s+range\s*\(/g);
    if (forLoops) count += forLoops.length;
    return count;
}

// ========== ANIMATION PHASE ==========

export interface AnimationAction {
    type: 'move_right' | 'move_left' | 'move_up' | 'move_down' | 'jump' | 'rotate' | 'scale' | 'say' | 'wait';
    value?: number;
    text?: string;
}

export interface AnimationExecutionResult {
    success: boolean;
    actions: AnimationAction[];
    output?: string;
    error?: string;
}

const PYTHON_ANIMATION_TEMPLATE = `# BlockyKids Animation API
import json

_actions = []

def gerak_kanan(pixel=50):
    _actions.append({"type": "move_right", "value": pixel})

def gerak_kiri(pixel=50):
    _actions.append({"type": "move_left", "value": pixel})

def gerak_atas(pixel=50):
    _actions.append({"type": "move_up", "value": pixel})

def gerak_bawah(pixel=50):
    _actions.append({"type": "move_down", "value": pixel})

def lompat():
    _actions.append({"type": "jump"})

def putar(derajat=90):
    _actions.append({"type": "rotate", "value": derajat})

def skala(persen=100):
    _actions.append({"type": "scale", "value": persen})

def katakan(teks):
    _actions.append({"type": "say", "text": str(teks)})

def tunggu(detik=1):
    _actions.append({"type": "wait", "value": detik})

# English aliases (snake_case)
move_right = gerak_kanan
move_left = gerak_kiri
move_up = gerak_atas
move_down = gerak_bawah
jump = lompat
rotate = putar
scale = skala
say = katakan
wait = tunggu

# camelCase aliases (Blockly compatibility)
animMoveRight = gerak_kanan
animMoveLeft = gerak_kiri
animMoveUp = gerak_atas
animMoveDown = gerak_bawah
animJump = lompat
animRotate = putar
animScale = skala
animSay = katakan

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions}))
`;

export async function executePythonAnimationCode(userCode: string): Promise<AnimationExecutionResult> {
    const fullCode = PYTHON_ANIMATION_TEMPLATE.replace('__USER_CODE__', userCode);
    try {
        const result: ExecutionResult = await runPython(fullCode);
        if (result.status === 'success' && result.output) {
            const markerIndex = result.output.indexOf('###BLOCKYKIDS_RESULT###');
            if (markerIndex !== -1) {
                const jsonPart = result.output.substring(markerIndex + '###BLOCKYKIDS_RESULT###'.length).trim();
                try {
                    const parsed = JSON.parse(jsonPart);
                    return { success: true, actions: parsed.actions || [] };
                } catch {
                    return { success: false, actions: [], error: 'Gagal parse hasil' };
                }
            }
            return { success: true, actions: [] };
        }
        if (result.status === 'compile_error') {
            return { success: false, actions: [], error: 'Syntax Error: ' + result.error };
        }
        return { success: false, actions: [], error: result.error || result.stderr || 'Error' };
    } catch (error) {
        return { success: false, actions: [], error: error instanceof Error ? error.message : 'Error' };
    }
}

// ========== MUSIC PHASE ==========

export interface MusicAction {
    type: 'play_note' | 'rest';
    note?: string;
    beats?: number;
}

export interface MusicExecutionResult {
    success: boolean;
    actions: MusicAction[];
    error?: string;
}

const PYTHON_MUSIC_TEMPLATE = `# BlockyKids Music API
import json

_actions = []

def mainkan(nada):
    _actions.append({"type": "play_note", "note": nada})

def istirahat(ketukan=1):
    _actions.append({"type": "rest", "beats": ketukan})

# Shortcuts
play_note = mainkan
rest = istirahat
def do(): mainkan("C4")
def re(): mainkan("D4")
def mi(): mainkan("E4")
def fa(): mainkan("F4")
def sol(): mainkan("G4")
def la(): mainkan("A4")
def si(): mainkan("B4")
def do_tinggi(): mainkan("C5")

# camelCase aliases (Blockly compatibility)
musicPlayNote = mainkan
musicRest = istirahat

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions}))
`;

export async function executePythonMusicCode(userCode: string): Promise<MusicExecutionResult> {
    const fullCode = PYTHON_MUSIC_TEMPLATE.replace('__USER_CODE__', userCode);
    try {
        const result: ExecutionResult = await runPython(fullCode);
        if (result.status === 'success' && result.output) {
            const markerIndex = result.output.indexOf('###BLOCKYKIDS_RESULT###');
            if (markerIndex !== -1) {
                const jsonPart = result.output.substring(markerIndex + '###BLOCKYKIDS_RESULT###'.length).trim();
                try {
                    const parsed = JSON.parse(jsonPart);
                    return { success: true, actions: parsed.actions || [] };
                } catch {
                    return { success: false, actions: [], error: 'Gagal parse hasil' };
                }
            }
            return { success: true, actions: [] };
        }
        if (result.status === 'compile_error') {
            return { success: false, actions: [], error: 'Syntax Error: ' + result.error };
        }
        return { success: false, actions: [], error: result.error || result.stderr || 'Error' };
    } catch (error) {
        return { success: false, actions: [], error: error instanceof Error ? error.message : 'Error' };
    }
}

// ========== PIXEL ART PHASE ==========

export interface PixelAction {
    type: 'draw' | 'move_right' | 'move_down' | 'set_color';
    color?: string;
}

export interface PixelExecutionResult {
    success: boolean;
    actions: PixelAction[];
    error?: string;
}

const PYTHON_PIXEL_TEMPLATE = `# BlockyKids Pixel Art API
import json

_actions = []
_color = "#ff0000"

def gambar():
    _actions.append({"type": "draw", "color": _color})

def geser_kanan():
    _actions.append({"type": "move_right"})

def geser_bawah():
    _actions.append({"type": "move_down"})

def warna(c):
    global _color
    _color = c
    _actions.append({"type": "set_color", "color": c})

# Aliases
draw = gambar
move_right = geser_kanan
move_down = geser_bawah
set_color = warna

# Color shortcuts
def merah(): warna("#ff0000")
def hijau(): warna("#00ff00")
def biru(): warna("#0000ff")
def kuning(): warna("#ffff00")
def hitam(): warna("#000000")
def putih(): warna("#ffffff")

# camelCase aliases (Blockly compatibility)
pixelDraw = gambar
pixelMoveRight = geser_kanan
pixelMoveDown = geser_bawah
pixelSetColor = warna

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions}))
`;

export async function executePythonPixelCode(userCode: string): Promise<PixelExecutionResult> {
    const fullCode = PYTHON_PIXEL_TEMPLATE.replace('__USER_CODE__', userCode);
    try {
        const result: ExecutionResult = await runPython(fullCode);
        if (result.status === 'success' && result.output) {
            const markerIndex = result.output.indexOf('###BLOCKYKIDS_RESULT###');
            if (markerIndex !== -1) {
                const jsonPart = result.output.substring(markerIndex + '###BLOCKYKIDS_RESULT###'.length).trim();
                try {
                    const parsed = JSON.parse(jsonPart);
                    return { success: true, actions: parsed.actions || [] };
                } catch {
                    return { success: false, actions: [], error: 'Gagal parse hasil' };
                }
            }
            return { success: true, actions: [] };
        }
        if (result.status === 'compile_error') {
            return { success: false, actions: [], error: 'Syntax Error: ' + result.error };
        }
        return { success: false, actions: [], error: result.error || result.stderr || 'Error' };
    } catch (error) {
        return { success: false, actions: [], error: error instanceof Error ? error.message : 'Error' };
    }
}
