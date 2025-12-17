/**
 * BlockyKids - Storage Utilities
 * Helper functions untuk localStorage
 */

import { PhaseId, UserProgress, CustomSprite, AdminChallenge } from '@/types';

const STORAGE_KEYS = {
    PROGRESS: 'blockykids_progress',
    CUSTOM_SPRITES: 'blockykids_custom_sprites',
    ADMIN_CHALLENGES: 'blockykids_admin_challenges',
    IS_ADMIN: 'blockykids_is_admin',
} as const;

// ===================================
// Progress Management
// ===================================
export const getDefaultProgress = (): UserProgress => ({
    currentPhase: 'tutorial',
    unlockedPhases: ['tutorial', 'robot', 'pixelart', 'animation', 'math', 'music'], // All unlocked for testing
    completedLevels: {},
    isAdmin: true, // Default admin mode for teachers
});

export const loadProgress = (): UserProgress => {
    if (typeof window === 'undefined') return getDefaultProgress();

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to ensure all phases are unlocked
            return {
                ...getDefaultProgress(),
                ...parsed,
                unlockedPhases: ['tutorial', 'robot', 'pixelart', 'animation', 'math', 'music'],
                isAdmin: true,
            };
        }
    } catch (e) {
        console.error('Error loading progress:', e);
    }

    return getDefaultProgress();
};

export const saveProgress = (progress: UserProgress): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
        console.error('Error saving progress:', e);
    }
};

export const completeLevel = (phaseId: PhaseId, levelId: number): void => {
    const progress = loadProgress();

    if (!progress.completedLevels[phaseId]) {
        progress.completedLevels[phaseId] = [];
    }

    if (!progress.completedLevels[phaseId].includes(levelId)) {
        progress.completedLevels[phaseId].push(levelId);
        saveProgress(progress);
    }
};

export const isLevelCompleted = (phaseId: PhaseId, levelId: number): boolean => {
    const progress = loadProgress();
    return progress.completedLevels[phaseId]?.includes(levelId) ?? false;
};

export const getCompletedCount = (phaseId: PhaseId): number => {
    const progress = loadProgress();
    return progress.completedLevels[phaseId]?.length ?? 0;
};

// ===================================
// Custom Sprites
// ===================================
export const loadCustomSprites = (): CustomSprite[] => {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_SPRITES);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Error loading custom sprites:', e);
        return [];
    }
};

export const saveCustomSprites = (sprites: CustomSprite[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SPRITES, JSON.stringify(sprites));
    } catch (e) {
        console.error('Error saving custom sprites:', e);
    }
};

export const addCustomSprite = (sprite: CustomSprite): void => {
    const sprites = loadCustomSprites();
    sprites.push(sprite);
    saveCustomSprites(sprites);
};

export const deleteCustomSprite = (id: string): void => {
    const sprites = loadCustomSprites().filter(s => s.id !== id);
    saveCustomSprites(sprites);
};

// ===================================
// Admin Challenges
// ===================================
export const loadAdminChallenges = (phaseId?: PhaseId): AdminChallenge[] => {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CHALLENGES);
        const all: AdminChallenge[] = saved ? JSON.parse(saved) : [];

        if (phaseId) {
            return all.filter(c => c.phaseId === phaseId);
        }

        return all;
    } catch (e) {
        console.error('Error loading admin challenges:', e);
        return [];
    }
};

export const saveAdminChallenge = (challenge: AdminChallenge): void => {
    if (typeof window === 'undefined') return;

    try {
        const all = loadAdminChallenges();
        const existingIndex = all.findIndex(c => c.id === challenge.id);

        if (existingIndex >= 0) {
            all[existingIndex] = { ...challenge, updatedAt: new Date().toISOString() };
        } else {
            all.push(challenge);
        }

        localStorage.setItem(STORAGE_KEYS.ADMIN_CHALLENGES, JSON.stringify(all));
    } catch (e) {
        console.error('Error saving admin challenge:', e);
    }
};

export const deleteAdminChallenge = (id: string): void => {
    if (typeof window === 'undefined') return;

    try {
        const all = loadAdminChallenges().filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.ADMIN_CHALLENGES, JSON.stringify(all));
    } catch (e) {
        console.error('Error deleting admin challenge:', e);
    }
};

// ===================================
// Admin Mode
// ===================================
export const isAdminMode = (): boolean => {
    if (typeof window === 'undefined') return true;

    // Default to admin mode for teachers
    const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    return saved !== 'false';
};

export const setAdminMode = (isAdmin: boolean): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(isAdmin));
};
