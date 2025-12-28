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

export function getTutorialPythonTemplate(levelId: number | string, levelName: string, instruction: string): string {
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
_color = "merah"

# Daftar warna yang tersedia
WARNA = {
    "merah": "#ff0000",
    "hijau": "#00ff00", 
    "biru": "#0000ff",
    "kuning": "#ffff00",
    "oranye": "#ff8800",
    "ungu": "#9900ff",
    "pink": "#ff69b4",
    "coklat": "#8b4513",
    "hitam": "#000000",
    "putih": "#ffffff",
    "abu": "#808080",
}

def gambar():
    """Gambar pixel di posisi saat ini"""
    color_hex = WARNA.get(_color, "#ff0000")
    _actions.append({"type": "draw", "color": color_hex})

def geser_kanan():
    """Geser kursor ke kanan"""
    _actions.append({"type": "move_right"})

def geser_bawah():
    """Geser kursor ke bawah"""
    _actions.append({"type": "move_down"})

def warna(nama_warna):
    """
    Pilih warna. Warna yang tersedia:
    merah, hijau, biru, kuning, oranye, ungu, pink, coklat, hitam, putih, abu
    """
    global _color
    
    # Handle if user passes function definition (e.g. setColor(hijau))
    if callable(nama_warna):
        nama_warna()
        return

    # Handle string input
    try:
        nama = str(nama_warna).lower()
        if nama in WARNA:
            _color = nama
            _actions.append({"type": "set_color", "color": WARNA[nama]})
        else:
            print(f"Warna '{nama_warna}' tidak dikenal! Gunakan: merah, hijau, biru, kuning, oranye, ungu, pink, coklat, hitam, putih, abu")
    except Exception as e:
        print(f"Error setting color: {e}")

# English aliases
draw = gambar
move_right = geser_kanan
move_down = geser_bawah
set_color = warna
setColor = warna
moveRight = geser_kanan
moveDown = geser_bawah

# Shortcut warna (langsung set warna)
def merah(): warna("merah")
def hijau(): warna("hijau")
def biru(): warna("biru")
def kuning(): warna("kuning")
def oranye(): warna("oranye")
def ungu(): warna("ungu")
def pink(): warna("pink")
def coklat(): warna("coklat")
def hitam(): warna("hitam")
def putih(): warna("putih")
def abu(): warna("abu")

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

// ========== BUILDING PHASE ==========

export interface BuildingAction {
    type: 'place' | 'remove' | 'move_x' | 'move_y' | 'move_z' | 'goto' | 'set_color';
    x?: number;
    y?: number;
    z?: number;
    color?: string;
}

export interface BuildingExecutionResult {
    success: boolean;
    actions: BuildingAction[];
    error?: string;
}

const PYTHON_BUILDING_TEMPLATE = `# BlockyKids Building API
import json

_actions = []
_color = "#e74c3c"

def taruh_blok():
    """Letakkan blok di posisi saat ini"""
    _actions.append({"type": "place", "color": _color})

def hapus_blok():
    """Hapus blok di posisi saat ini"""
    _actions.append({"type": "remove"})

def gerak_x(jarak=1):
    """Gerakkan kursor ke kiri/kanan"""
    _actions.append({"type": "move_x", "x": jarak})

def gerak_y(jarak=1):
    """Gerakkan kursor ke atas/bawah (tinggi)"""
    _actions.append({"type": "move_y", "y": jarak})

def gerak_z(jarak=1):
    """Gerakkan kursor ke depan/belakang"""
    _actions.append({"type": "move_z", "z": jarak})

def ke_posisi(x, y, z):
    """Pindah ke posisi tertentu"""
    _actions.append({"type": "goto", "x": x, "y": y, "z": z})

def warna(c):
    """Pilih warna blok"""
    global _color
    _color = c
    _actions.append({"type": "set_color", "color": c})

# English aliases (snake_case)
place_block = taruh_blok
remove_block = hapus_blok
move_x = gerak_x
move_y = gerak_y
move_z = gerak_z
goto = ke_posisi
set_color = warna

# camelCase aliases (Blockly compatibility)
buildPlaceBlock = taruh_blok
buildRemoveBlock = hapus_blok
buildMoveX = gerak_x
buildMoveY = gerak_y
buildMoveZ = gerak_z
buildGoto = ke_posisi
buildSetColor = warna

# Color shortcuts
def merah(): warna("#e74c3c")
def oranye(): warna("#e67e22")
def kuning(): warna("#f1c40f")
def hijau(): warna("#2ecc71")
def biru(): warna("#3498db")
def ungu(): warna("#9b59b6")
def putih(): warna("#ecf0f1")
def coklat(): warna("#795548")
def abu_abu(): warna("#95a5a6")

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions}))
`;

export async function executePythonBuildingCode(userCode: string): Promise<BuildingExecutionResult> {
    const fullCode = PYTHON_BUILDING_TEMPLATE.replace('__USER_CODE__', userCode);
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

export function getBuildingPythonTemplate(levelId: number | string, levelName: string, instruction: string): string {
    return `# Level ${levelId}: ${levelName}
# ${instruction}

# Fungsi yang tersedia:
# - taruh_blok()     : Letakkan blok di posisi saat ini
# - hapus_blok()     : Hapus blok di posisi saat ini  
# - gerak_x(jarak)   : Gerak ke kiri/kanan
# - gerak_y(jarak)   : Gerak ke atas/bawah (tinggi)
# - gerak_z(jarak)   : Gerak ke depan/belakang
# - ke_posisi(x,y,z) : Pindah ke posisi tertentu
# - warna(kode)      : Pilih warna (contoh: "#e74c3c")
#
# Shortcut warna: merah(), hijau(), biru(), kuning(), ungu()

# Tulis kode kamu di bawah ini:

`;
}

export function countBuildingActions(code: string): number {
    const patterns = [
        /taruh_blok\s*\(\s*\)/g, /place_block\s*\(\s*\)/g,
        /hapus_blok\s*\(\s*\)/g, /remove_block\s*\(\s*\)/g,
        /gerak_x\s*\(/g, /move_x\s*\(/g,
        /gerak_y\s*\(/g, /move_y\s*\(/g,
        /gerak_z\s*\(/g, /move_z\s*\(/g,
        /ke_posisi\s*\(/g, /goto\s*\(/g,
        /warna\s*\(/g, /set_color\s*\(/g,
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

// ========== ALCHEMIST PHASE (SORTING) ==========

export interface AlchemistAction {
    type: 'swap';
    from: number;
    to: number;
}

export interface AlchemistExecutionResult {
    success: boolean;
    actions: AlchemistAction[];
    finalArray: number[];
    swapCount: number;
    error?: string;
}

const PYTHON_ALCHEMIST_TEMPLATE = `# BlockyKids Alchemist API - Sortir Ramuan
import json

_actions = []
_swap_count = 0

# Array ramuan awal
ramuan = __POTIONS__

def tukar(i, j):
    """Tukar posisi ramuan ke-i dengan ramuan ke-j"""
    global _swap_count
    if 0 <= i < len(ramuan) and 0 <= j < len(ramuan):
        temp = ramuan[i]
        ramuan[i] = ramuan[j]
        ramuan[j] = temp
        _swap_count += 1
        _actions.append({"type": "swap", "from": i, "to": j})
        print(f"SWAP:{i},{j}")
    else:
        print(f"Error: Index {i} atau {j} di luar batas!")

def ambil(i):
    """Ambil nilai ramuan di posisi i"""
    if 0 <= i < len(ramuan):
        return ramuan[i]
    return None

def panjang():
    """Dapatkan jumlah ramuan"""
    return len(ramuan)

def lihat():
    """Lihat array ramuan saat ini"""
    print(f"Ramuan: {ramuan}")

# English aliases
swap = tukar
get = ambil
length = panjang
view = lihat
potions = ramuan

# Blockly compatibility
alchemistSwap = tukar
alchemistGet = ambil
alchemistLength = panjang

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"actions": _actions, "finalArray": ramuan, "swapCount": _swap_count}))
`;

export async function executePythonAlchemistCode(userCode: string, initialPotions: number[]): Promise<AlchemistExecutionResult> {
    const fullCode = PYTHON_ALCHEMIST_TEMPLATE
        .replace('__POTIONS__', JSON.stringify(initialPotions))
        .replace('__USER_CODE__', userCode);

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
                        finalArray: parsed.finalArray || [],
                        swapCount: parsed.swapCount || 0,
                    };
                } catch {
                    return { success: false, actions: [], finalArray: [], swapCount: 0, error: 'Gagal parse hasil' };
                }
            }
            return { success: true, actions: [], finalArray: initialPotions, swapCount: 0 };
        }
        if (result.status === 'compile_error') {
            return { success: false, actions: [], finalArray: [], swapCount: 0, error: 'Syntax Error: ' + result.error };
        }
        return { success: false, actions: [], finalArray: [], swapCount: 0, error: result.error || result.stderr || 'Error' };
    } catch (error) {
        return { success: false, actions: [], finalArray: [], swapCount: 0, error: error instanceof Error ? error.message : 'Error' };
    }
}

export function getAlchemistPythonTemplate(levelId: number | string, levelName: string, potions: number[]): string {
    return `# Level ${levelId}: ${levelName}
# Sortir ramuan dari kecil ke besar!

# Array ramuan: ${JSON.stringify(potions)}

# Fungsi yang tersedia:
# - tukar(i, j)  : Tukar posisi ramuan ke-i dan ke-j
# - ambil(i)     : Ambil nilai ramuan di posisi i
# - panjang()    : Dapatkan jumlah ramuan
# - lihat()      : Tampilkan array saat ini

# Tulis kode sorting kamu di bawah ini:

`;
}

// ========== COMBAT PHASE (OOP STRATEGY) ==========

export interface CombatAction {
    type: 'select_target' | 'attack' | 'move';
    targetId?: string;
    x?: number;
    y?: number;
}

export interface CombatExecutionResult {
    success: boolean;
    selectedTarget: string | null;
    actions: CombatAction[];
    testResult?: 'pass' | 'fail';
    testMessage?: string;
    error?: string;
}

export interface CombatUnitData {
    id: string;
    name: string;
    x: number;
    y: number;
    hp: number;
    attack: number;
    range: number;
}

const PYTHON_COMBAT_TEMPLATE = `# BlockyKids Combat API - Strategi Tempur
import json
import math

_selected_target = None
_actions = []

class Unit:
    """Kelas dasar untuk unit dalam arena"""
    def __init__(self, id, name, x, y, hp, attack, attack_range):
        self.id = id
        self.name = name
        self.x = x
        self.y = y
        self.hp = hp
        self.attack = attack
        self.range = attack_range
    
    def jarak_ke(self, unit_lain):
        """Hitung jarak ke unit lain"""
        return math.sqrt((self.x - unit_lain.x)**2 + (self.y - unit_lain.y)**2)
    
    def dalam_jangkauan(self, unit_lain):
        """Cek apakah unit lain dalam jangkauan serang"""
        return self.jarak_ke(unit_lain) <= self.range
    
    # English aliases
    distance_to = jarak_ke
    in_range = dalam_jangkauan

class Pahlawan(Unit):
    """Kelas untuk hero/pahlawan"""
    def __init__(self, x, y, hp=100, attack=20, attack_range=3):
        super().__init__("hero", "Pahlawan", x, y, hp, attack, attack_range)
    
    def serang(self, target):
        """Serang target musuh"""
        global _selected_target
        _selected_target = target.id
        _actions.append({"type": "attack", "targetId": target.id})
        print(f"TARGET:{target.id}")
        return target.id

class Musuh(Unit):
    """Kelas untuk musuh"""
    def __init__(self, id, name, x, y, hp=50, attack=10, attack_range=2):
        super().__init__(id, name, x, y, hp, attack, attack_range)

# English aliases
Hero = Pahlawan
Enemy = Musuh

# Setup arena
pahlawan = Pahlawan(__HERO_X__, __HERO_Y__, __HERO_HP__, __HERO_ATTACK__, __HERO_RANGE__)
hero = pahlawan

daftar_musuh = [
__ENEMIES__
]
enemies = daftar_musuh

def pilih_target(musuh):
    """Pilih musuh sebagai target serangan"""
    global _selected_target
    _selected_target = musuh.id
    _actions.append({"type": "select_target", "targetId": musuh.id})
    return musuh

def serang_target(target):
    """Serang target yang dipilih"""
    return pahlawan.serang(target)

# English aliases
select_target = pilih_target
attack_target = serang_target

# Blockly compatibility
combatSelectTarget = pilih_target
combatAttack = serang_target

# ========== KODE KAMU ==========

__USER_CODE__

# ========== OUTPUT ==========
print("###BLOCKYKIDS_RESULT###")
print(json.dumps({"selectedTarget": _selected_target, "actions": _actions}))
`;

export async function executePythonCombatCode(
    userCode: string,
    hero: CombatUnitData,
    enemies: CombatUnitData[]
): Promise<CombatExecutionResult> {
    const enemiesCode = enemies.map(e =>
        `    Musuh("${e.id}", "${e.name}", ${e.x}, ${e.y}, ${e.hp}, ${e.attack}, ${e.range}),`
    ).join('\n');

    const fullCode = PYTHON_COMBAT_TEMPLATE
        .replace('__HERO_X__', String(hero.x))
        .replace('__HERO_Y__', String(hero.y))
        .replace('__HERO_HP__', String(hero.hp))
        .replace('__HERO_ATTACK__', String(hero.attack))
        .replace('__HERO_RANGE__', String(hero.range))
        .replace('__ENEMIES__', enemiesCode)
        .replace('__USER_CODE__', userCode);

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
                        selectedTarget: parsed.selectedTarget || null,
                        actions: parsed.actions || [],
                    };
                } catch {
                    return { success: false, selectedTarget: null, actions: [], error: 'Gagal parse hasil' };
                }
            }
            return { success: true, selectedTarget: null, actions: [] };
        }
        if (result.status === 'compile_error') {
            return { success: false, selectedTarget: null, actions: [], error: 'Syntax Error: ' + result.error };
        }
        return { success: false, selectedTarget: null, actions: [], error: result.error || result.stderr || 'Error' };
    } catch (error) {
        return { success: false, selectedTarget: null, actions: [], error: error instanceof Error ? error.message : 'Error' };
    }
}

export function getCombatPythonTemplate(levelId: number | string, levelName: string, instruction: string): string {
    return `# Level ${levelId}: ${levelName}
# ${instruction}

# Kelas yang tersedia:
# - Pahlawan: hero kamu dengan x, y, hp, attack, range
# - Musuh: musuh dengan id, name, x, y, hp, attack, range

# Variabel yang tersedia:
# - pahlawan (atau hero): unit hero kamu
# - daftar_musuh (atau enemies): list semua musuh

# Method unit:
# - jarak_ke(unit): hitung jarak ke unit lain
# - dalam_jangkauan(unit): cek apakah unit dalam range

# Fungsi:
# - pilih_target(musuh): pilih musuh sebagai target
# - serang_target(musuh): serang musuh

# Tulis strategi kamu di bawah ini:

`;
}

