/**
 * BlockyKids - Blockly Utilities
 * Helper functions untuk Blockly integration
 */

declare global {
    interface Window {
        Blockly: typeof import('blockly');
    }
}

export const BLOCKLY_THEME_CONFIG = {
    base: 'dark' as const,
    componentStyles: {
        workspaceBackgroundColour: '#1e1e2e',
        toolboxBackgroundColour: '#252547',
        flyoutBackgroundColour: '#252547',
        flyoutForegroundColour: '#ccc',
        flyoutOpacity: 0.9,
        scrollbarColour: '#6c5ce7',
        scrollbarOpacity: 0.5,
    },
};

export const BLOCKLY_GRID_CONFIG = {
    spacing: 20,
    length: 3,
    colour: '#444',
    snap: true,
};

export type BlocklyCategory = {
    kind: 'category';
    name: string;
    colour: string;
    contents: Array<{ kind: 'block'; type: string }>;
};

export type BlocklyToolbox = {
    kind: 'categoryToolbox';
    contents: BlocklyCategory[];
};

// Define block colors by category
export const BLOCK_COLORS = {
    movement: '#4CAF50',
    appearance: '#9C27B0',
    communication: '#2196F3',
    timing: '#FF9800',
    control: '#FFEB3B',
    logic: '#FF5722',
    variables: '#FF6B6B',
    math: '#4ECDC4',
    output: '#45B7D1',
    music: '#E91E63',
    sprite: '#E91E63',
} as const;
