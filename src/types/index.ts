/**
 * BlockyKids - Type Definitions
 * Definisi tipe data untuk seluruh aplikasi
 */

// ===================================
// Phase Types
// ===================================
export type PhaseId = 'tutorial' | 'robot' | 'pixelart' | 'animation' | 'math' | 'music' | 'building' | 'alchemist' | 'combat';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'free';

export interface Phase {
    id: PhaseId;
    name: string;
    icon: string;
    description: string;
    color: string;
    order: number;
}

// ===================================
// Level Types
// ===================================
export interface BaseLevel {
    id: number | string;
    name: string;
    difficulty: Difficulty;
    description: string;
    hint: string;
}

// Robot Phase Level
export interface RobotLevel extends BaseLevel {
    width: number;
    height: number;
    grid: GridTile[][];
    robot: RobotPosition;
    goal: Position;
    stars: Position[];
}

export interface GridTile {
    type: 'empty' | 'wall' | 'tree' | 'water' | 'key' | 'door';
}

export interface Position {
    x: number;
    y: number;
}

export interface RobotPosition extends Position {
    direction: 'north' | 'east' | 'south' | 'west';
}

// Pixel Art Level
export interface PixelArtLevel extends BaseLevel {
    target: [number, number][];
}

// Animation Level
export interface AnimationLevel extends BaseLevel {
    sprites: SpriteConfig[];
    goal: AnimationGoal;
}

export interface SpriteConfig {
    id: string;
    emoji?: string;
    image?: string;
    x: number;
    y: number;
}

export interface AnimationGoal {
    type: 'position' | 'action' | 'rotation' | 'scale' | 'speech' | 'story' | 'free';
    spriteId?: string;
    x?: number;
    y?: number;
    tolerance?: number;
    action?: string;
    degrees?: number;
}

// Math Level
export interface MathLevel extends BaseLevel {
    expectedOutput: string[];
}

// Music Level
export interface MusicLevel extends BaseLevel {
    goal: MusicGoal;
}

export interface MusicGoal {
    type: 'notes' | 'sequence' | 'repeat' | 'free';
    required?: string[];
    minNotes?: number;
}

// Building Level
export interface BuildingLevel extends BaseLevel {
    gridSize: { width: number; height: number; depth: number };
    targetStructure?: { x: number; y: number; z: number; color: string }[];
    availableColors: string[];
    requireBlockCount?: number;
}

// Alchemist Level (Sorting Game)
export interface AlchemistLevel extends BaseLevel {
    potions: number[];           // Array of potion values to sort
    sortOrder: 'ascending' | 'descending';
    maxSwaps: number;            // Maximum allowed swaps for efficiency
}

// Combat Level (OOP Strategy Game)
export interface CombatLevel extends BaseLevel {
    hero: CombatUnit;
    enemies: CombatUnit[];
    gridSize: { width: number; height: number };
    expectedTarget?: string;     // ID of correct target for validation
    testCases?: CombatTestCase[];
}

export interface CombatUnit {
    id: string;
    name: string;
    emoji: string;
    x: number;
    y: number;
    hp: number;
    attack: number;
    range: number;
}

export interface CombatTestCase {
    description: string;
    heroPosition: { x: number; y: number };
    enemies: { id: string; x: number; y: number; hp: number }[];
    expectedTargetId: string;
}

// ===================================
// Sprite Types
// ===================================
export interface Sprite {
    id: string;
    originalId?: string;
    emoji?: string;
    image?: string;
    name: string;
    x: number;
    y: number;
    initialX: number;
    initialY: number;
    rotation: number;
    scale: number;
    visible: boolean;
    speech: string | null;
    totalRotation: number;
}

export interface CustomSprite {
    id: string;
    name: string;
    image: string;
}

// ===================================
// Progress Types
// ===================================
export interface UserProgress {
    currentPhase: PhaseId;
    unlockedPhases: PhaseId[];
    completedLevels: Record<PhaseId, (number | string)[]>;
    isAdmin: boolean;
}

// ===================================
// Admin Types
// ===================================
export interface AdminChallenge {
    id: string;
    phaseId: PhaseId;
    level: BaseLevel;
    createdAt: string;
    updatedAt: string;
}

// ===================================
// Dual Mode Workspace Types
// ===================================
export type WorkspaceMode = 'block' | 'code';

export interface ExecutionResult {
    status: 'success' | 'error' | 'timeout' | 'pending' | 'compile_error';
    output?: string;
    error?: string;
    stderr?: string;
    time?: string;
    memory?: number;
    exitCode?: number;
}

export interface DualModeConfig {
    enableBlockMode: boolean;
    enableCodeMode: boolean;
    defaultMode: WorkspaceMode;
    pythonTemplate?: string;
}
