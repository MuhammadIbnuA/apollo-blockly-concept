/**
 * BlockyKids - Level List Component
 * Reusable component for displaying levels in any phase
 */

'use client';

import { BaseLevel, Difficulty } from '@/types';
import clsx from 'clsx';

interface LevelListProps<T extends BaseLevel> {
    levels: T[];
    currentLevel: number;
    onSelect: (index: number) => void;
    completedLevels?: (number | string)[];
    showDifficulty?: boolean;
}

export default function LevelList<T extends BaseLevel>({
    levels,
    currentLevel,
    onSelect,
    completedLevels = [],
    showDifficulty = true,
}: LevelListProps<T>) {
    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'text-success';
            case 'medium':
                return 'text-warning';
            case 'hard':
                return 'text-danger';
            case 'free':
                return 'text-primary-light';
            default:
                return 'text-muted';
        }
    };

    const getDifficultyLabel = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy':
                return '🟢 Mudah';
            case 'medium':
                return '🟡 Sedang';
            case 'hard':
                return '🔴 Sulit';
            case 'free':
                return '🎨 Bebas';
            default:
                return difficulty;
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {levels.map((level, idx) => {
                const isActive = idx === currentLevel;
                const isCompleted = completedLevels.includes(level.id);

                return (
                    <button
                        key={level.id}
                        onClick={() => onSelect(idx)}
                        className={clsx(
                            'flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
                            'border-2',
                            isActive
                                ? 'bg-primary/20 border-primary'
                                : isCompleted
                                    ? 'bg-secondary border-success/50 hover:bg-card-hover'
                                    : 'bg-secondary border-transparent hover:bg-card-hover'
                        )}
                    >
                        {/* Level Number */}
                        <div
                            className={clsx(
                                'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0',
                                isCompleted
                                    ? 'bg-success text-white'
                                    : 'bg-gradient-to-r from-primary to-primary-light text-white'
                            )}
                        >
                            {/* Use 'C' for custom levels if ID is large, otherwise show ID */}
                            {isCompleted ? '✓' : String(level.id).length > 3 ? 'C' : level.id}
                        </div>

                        {/* Level Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="font-medium truncate">{level.name}</div>
                                {String(level.id).length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-600 rounded text-white font-bold">
                                        CUSTOM
                                    </span>
                                )}
                            </div>
                            {showDifficulty && (
                                <div className={clsx('text-xs', getDifficultyColor(level.difficulty))}>
                                    {getDifficultyLabel(level.difficulty)}
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
