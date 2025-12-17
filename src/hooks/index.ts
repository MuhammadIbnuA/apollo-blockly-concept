/**
 * BlockyKids - Custom Hooks
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhaseId, UserProgress, CustomSprite } from '@/types';
import {
    loadProgress,
    saveProgress,
    loadCustomSprites,
    saveCustomSprites,
    isAdminMode as getAdminMode,
    setAdminMode as saveAdminMode
} from '@/lib/storage';

// ===================================
// Progress Hook
// ===================================
export function useProgress() {
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setProgress(loadProgress());
        setIsLoading(false);
    }, []);

    const updateProgress = useCallback((updates: Partial<UserProgress>) => {
        setProgress(prev => {
            if (!prev) return prev;
            const newProgress = { ...prev, ...updates };
            saveProgress(newProgress);
            return newProgress;
        });
    }, []);

    const setCurrentPhase = useCallback((phaseId: PhaseId) => {
        updateProgress({ currentPhase: phaseId });
    }, [updateProgress]);

    const completeLevel = useCallback((phaseId: PhaseId, levelId: number) => {
        setProgress(prev => {
            if (!prev) return prev;

            const completedLevels = { ...prev.completedLevels };
            if (!completedLevels[phaseId]) {
                completedLevels[phaseId] = [];
            }

            if (!completedLevels[phaseId].includes(levelId)) {
                completedLevels[phaseId] = [...completedLevels[phaseId], levelId];
            }

            const newProgress = { ...prev, completedLevels };
            saveProgress(newProgress);
            return newProgress;
        });
    }, []);

    return {
        progress,
        isLoading,
        setCurrentPhase,
        completeLevel,
        isPhaseUnlocked: () => true, // All phases unlocked for teachers
        getCompletedCount: (phaseId: PhaseId) =>
            progress?.completedLevels[phaseId]?.length ?? 0,
    };
}

// ===================================
// Admin Mode Hook
// ===================================
export function useAdminMode() {
    const [isAdmin, setIsAdmin] = useState(true);

    useEffect(() => {
        setIsAdmin(getAdminMode());
    }, []);

    const toggleAdmin = useCallback(() => {
        setIsAdmin(prev => {
            const newValue = !prev;
            saveAdminMode(newValue);
            return newValue;
        });
    }, []);

    return { isAdmin, toggleAdmin, setIsAdmin };
}

// ===================================
// Custom Sprites Hook
// ===================================
export function useCustomSprites() {
    const [sprites, setSprites] = useState<CustomSprite[]>([]);

    useEffect(() => {
        setSprites(loadCustomSprites());
    }, []);

    const addSprite = useCallback((sprite: CustomSprite) => {
        setSprites(prev => {
            const newSprites = [...prev, sprite];
            saveCustomSprites(newSprites);
            return newSprites;
        });
    }, []);

    const removeSprite = useCallback((id: string) => {
        setSprites(prev => {
            const newSprites = prev.filter(s => s.id !== id);
            saveCustomSprites(newSprites);
            return newSprites;
        });
    }, []);

    return { sprites, addSprite, removeSprite };
}

// ===================================
// Toast Hook
// ===================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}
