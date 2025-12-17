/**
 * BlockyKids - Phase Selector Modal
 */

'use client';

import { PhaseId } from '@/types';
import { PHASE_LIST } from '@/data/phases';
import { Modal } from '@/components/ui';
import { useProgress } from '@/hooks';

interface PhaseSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (phaseId: PhaseId) => void;
    currentPhase: PhaseId;
}

export default function PhaseSelector({
    isOpen,
    onClose,
    onSelect,
    currentPhase,
}: PhaseSelectorProps) {
    const { getCompletedCount } = useProgress();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📚 Pilih Fase Pembelajaran" size="lg">
            <p className="text-muted mb-6">
                Pilih fase untuk belajar! Semua fase terbuka untuk mode Guru.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PHASE_LIST.map((phase) => {
                    const completed = getCompletedCount(phase.id);
                    const isActive = currentPhase === phase.id;

                    return (
                        <button
                            key={phase.id}
                            onClick={() => onSelect(phase.id)}
                            className={`
                relative p-6 rounded-2xl text-center transition-all duration-300
                ${isActive
                                    ? 'bg-primary/20 border-2 border-primary'
                                    : 'bg-secondary border-2 border-transparent hover:border-primary-light hover:-translate-y-1'}
              `}
                        >
                            <span className="text-4xl block mb-3">{phase.icon}</span>
                            <h3 className="font-semibold mb-1">{phase.name}</h3>
                            <p className="text-xs text-muted">{phase.description}</p>

                            {/* Progress Bar */}
                            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(completed * 12.5, 100)}%` }}
                                />
                            </div>

                            {/* Completed Badge */}
                            {completed > 0 && (
                                <div className="absolute top-2 right-2 text-xs bg-success/20 text-success-light px-2 py-1 rounded-lg">
                                    ✓ {completed}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </Modal>
    );
}
