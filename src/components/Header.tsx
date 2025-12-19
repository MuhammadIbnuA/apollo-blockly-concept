/**
 * BlockyKids - Header Component
 */

'use client';

import { useState } from 'react';
import { PhaseId } from '@/types';
import { PHASES } from '@/data/phases';
import { Button } from '@/components/ui';
import { useAdminMode } from '@/hooks';
import PhaseSelector from './PhaseSelector';
import ChallengeConfigScreen from './admin/ChallengeConfigScreen';

interface HeaderProps {
    currentPhase: PhaseId;
    onPhaseChange: (phaseId: PhaseId) => void;
}

export default function Header({ currentPhase, onPhaseChange }: HeaderProps) {
    const [showPhaseSelector, setShowPhaseSelector] = useState(false);
    const [showChallengeConfig, setShowChallengeConfig] = useState(false);
    const { isAdmin, toggleAdmin } = useAdminMode();
    const phase = PHASES[currentPhase];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-[70px] bg-secondary/95 backdrop-blur-xl border-b border-white/10 z-50">
                <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-6">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setShowPhaseSelector(true)}
                    >
                        <span className="text-3xl animate-bounce-slow">🧩</span>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                            BlockyKids
                        </h1>
                    </div>

                    {/* Current Phase */}
                    <button
                        onClick={() => setShowPhaseSelector(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl hover:bg-card-hover transition-colors"
                    >
                        <span className="text-xl">{phase.icon}</span>
                        <span className="font-semibold">{phase.name}</span>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Challenge Config - Admin Only */}
                        {isAdmin && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowChallengeConfig(true)}
                                icon="⚙️"
                            >
                                Kelola Tantangan
                            </Button>
                        )}

                        {/* Admin Toggle */}
                        <button
                            onClick={toggleAdmin}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isAdmin ? 'bg-success/20 text-success-light' : 'bg-card hover:bg-card-hover'
                                }`}
                            title={isAdmin ? 'Mode Guru (Admin)' : 'Mode Murid'}
                        >
                            <span>{isAdmin ? '👨‍🏫' : '🎓'}</span>
                            <span className="text-sm font-medium">{isAdmin ? 'Guru' : 'Murid'}</span>
                        </button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowPhaseSelector(true)}
                            icon="📚"
                        >
                            Pilih Fase
                        </Button>

                        <button
                            className="w-10 h-10 flex items-center justify-center bg-card rounded-xl hover:bg-card-hover transition-colors"
                            title="Bantuan"
                        >
                            ❓
                        </button>
                    </div>
                </div>
            </header>

            <PhaseSelector
                isOpen={showPhaseSelector}
                onClose={() => setShowPhaseSelector(false)}
                onSelect={(phaseId) => {
                    onPhaseChange(phaseId);
                    setShowPhaseSelector(false);
                }}
                currentPhase={currentPhase}
            />

            {/* Challenge Config Modal */}
            <ChallengeConfigScreen
                isOpen={showChallengeConfig}
                onClose={() => setShowChallengeConfig(false)}
            />
        </>
    );
}
