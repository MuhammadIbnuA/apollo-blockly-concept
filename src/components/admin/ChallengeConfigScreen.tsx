/**
 * BlockyKids - Challenge Configuration Screen
 * Full admin interface for managing challenges across all phases
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhaseId, BaseLevel, AdminChallenge } from '@/types';
import { PHASES } from '@/data/phases';
import { Button, Modal } from '@/components/ui';
import { challengeService } from '@/services/challengeService';
import { CustomChallenge } from '@prisma/client';
import TutorialChallengeEditor from './editors/TutorialChallengeEditor';
import BuildingChallengeEditor from './editors/BuildingChallengeEditor';
import RobotChallengeEditor from './editors/RobotChallengeEditor';
import PixelArtChallengeEditor from './editors/PixelArtChallengeEditor';
import AnimationChallengeEditor from './editors/AnimationChallengeEditor';
import MathChallengeEditor from './editors/MathChallengeEditor';
import MusicChallengeEditor from './editors/MusicChallengeEditor';
import GenericChallengeEditor from './editors/GenericChallengeEditor';

interface ChallengeConfigScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const PHASE_ORDER: PhaseId[] = ['tutorial', 'robot', 'building', 'pixelart', 'animation', 'math', 'music'];

export default function ChallengeConfigScreen({ isOpen, onClose }: ChallengeConfigScreenProps) {
    const [activeTab, setActiveTab] = useState<PhaseId>('tutorial');
    const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<AdminChallenge | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingLevel, setEditingLevel] = useState<Partial<BaseLevel>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load challenges from DB
    const loadChallenges = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await challengeService.getAll(activeTab);
            const mapped: AdminChallenge[] = data.map(c => ({
                id: c.id,
                phaseId: c.phase as PhaseId,
                level: c.config as unknown as BaseLevel, // config is stored as Json
                createdAt: c.createdAt.toString(),
                updatedAt: c.updatedAt.toString() || '',
            }));
            setChallenges(mapped);
        } catch (error) {
            console.error(error);
            setChallenges([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isOpen) {
            loadChallenges();
        }
    }, [isOpen, loadChallenges]);

    const handleCreateNew = () => {
        setSelectedChallenge(null);
        setEditingLevel({
            name: 'Tantangan Baru',
            difficulty: 'easy',
            description: '',
            hint: '',
        });
        setIsEditing(true);
    };

    const handleEdit = (challenge: AdminChallenge) => {
        setSelectedChallenge(challenge);
        setEditingLevel({ ...challenge.level });
        setIsEditing(true);
    };

    // Clone challenge
    const handleClone = (challenge: AdminChallenge) => {
        setSelectedChallenge(null);
        setEditingLevel({
            ...challenge.level,
            id: undefined, // Clear ID for new creation
            name: `${challenge.level.name} (Salinan)`,
        });
        setIsEditing(true);
    };

    const handleDeleteClick = (challenge: AdminChallenge) => {
        setSelectedChallenge(challenge);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedChallenge?.id) {
            try {
                await challengeService.delete(selectedChallenge.id);
                await loadChallenges();
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
        setShowDeleteConfirm(false);
        setSelectedChallenge(null);
    };

    const handleSave = async () => {
        try {
            const data = {
                title: editingLevel.name || 'Tantangan Baru',
                description: editingLevel.description,
                phase: activeTab,
                difficulty: editingLevel.difficulty || 'easy',
                config: editingLevel,
                isPublic: false,
            };

            if (selectedChallenge?.id) {
                // Update
                await challengeService.update(selectedChallenge.id, data);
            } else {
                // Create
                await challengeService.create(data);
            }
            await loadChallenges();
            setIsEditing(false);
            setSelectedChallenge(null);
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    // Render phase-specific editor
    const renderPhaseEditor = () => {
        switch (activeTab) {
            case 'tutorial':
                return (
                    <TutorialChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'building':
                return (
                    <BuildingChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'robot':
                return (
                    <RobotChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'pixelart':
                return (
                    <PixelArtChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'animation':
                return (
                    <AnimationChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'math':
                return (
                    <MathChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            case 'music':
                return (
                    <MusicChallengeEditor
                        level={editingLevel as any}
                        onChange={setEditingLevel}
                    />
                );
            default:
                return (
                    <GenericChallengeEditor
                        level={editingLevel}
                        onChange={setEditingLevel}
                        phaseId={activeTab}
                    />
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🏫 Kelola Tantangan" size="xl">
            <div className="flex flex-col h-[70vh]">
                {/* Phase Tabs */}
                <div className="flex gap-1 pb-4 border-b border-white/10 overflow-x-auto">
                    {PHASE_ORDER.map(phaseId => {
                        const phase = PHASES[phaseId];
                        if (!phase) return null;
                        return (
                            <button
                                key={phaseId}
                                onClick={() => {
                                    setActiveTab(phaseId);
                                    setIsEditing(false);
                                    setSelectedChallenge(null);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === phaseId
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-[#1a1a35] text-gray-400 hover:bg-[#252547]'
                                    }`}
                            >
                                <span>{phase.icon}</span>
                                <span className="text-sm">{phase.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex gap-4 pt-4 overflow-hidden">
                    {/* Challenge List */}
                    <div className="w-72 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">📋 Tantangan Custom</h3>
                            <button
                                onClick={handleCreateNew}
                                className="text-xs px-2 py-1 bg-green-600 rounded hover:bg-green-500"
                            >
                                ➕ Baru
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Memuat...</p>
                                </div>
                            ) : challenges.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-3xl mb-2">📭</p>
                                    <p className="text-sm">Belum ada tantangan custom</p>
                                    <button
                                        onClick={handleCreateNew}
                                        className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
                                    >
                                        + Buat tantangan pertama
                                    </button>
                                </div>
                            ) : (
                                challenges.map(challenge => (
                                    <div
                                        key={challenge.id}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${selectedChallenge?.id === challenge.id
                                            ? 'bg-purple-600/30 ring-1 ring-purple-500'
                                            : 'bg-[#1a1a35] hover:bg-[#252547]'
                                            }`}
                                        onClick={() => handleEdit(challenge)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate flex items-center gap-2">
                                                    <span className="text-xs">
                                                        {challenge.level.difficulty === 'easy' && '🟢'}
                                                        {challenge.level.difficulty === 'medium' && '🟡'}
                                                        {challenge.level.difficulty === 'hard' && '🔴'}
                                                        {challenge.level.difficulty === 'free' && '⚪'}
                                                    </span>
                                                    {challenge.level.name}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate mt-1">
                                                    {challenge.level.description || 'Tidak ada deskripsi'}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(`${window.location.origin}/share/${challenge.id}`);
                                                        // Simple feedback (could be improved)
                                                        alert('Link tersalin! Bagikan link ini ke pemain.');
                                                    }}
                                                    className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                                                    title="Bagikan"
                                                >
                                                    🔗
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleClone(challenge); }}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                    title="Duplikat"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(challenge); }}
                                                    className="p-1 hover:bg-red-500/20 rounded hover:text-red-400"
                                                    title="Hapus"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="flex-1 bg-[#1a1a35] rounded-xl p-4 overflow-y-auto">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                    <h3 className="font-semibold">
                                        {selectedChallenge ? '✏️ Edit Tantangan' : '➕ Tantangan Baru'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => { setIsEditing(false); setSelectedChallenge(null); }}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={handleSave}
                                            icon="💾"
                                        >
                                            Simpan
                                        </Button>
                                    </div>
                                </div>

                                {/* Base Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Nama Tantangan</label>
                                        <input
                                            type="text"
                                            value={editingLevel.name || ''}
                                            onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#252547] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                                            placeholder="Nama tantangan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Kesulitan</label>
                                        <select
                                            value={editingLevel.difficulty || 'easy'}
                                            onChange={(e) => setEditingLevel({ ...editingLevel, difficulty: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-[#252547] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                                        >
                                            <option value="easy">🟢 Mudah</option>
                                            <option value="medium">🟡 Sedang</option>
                                            <option value="hard">🔴 Sulit</option>
                                            <option value="free">⚪ Bebas</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                                    <textarea
                                        value={editingLevel.description || ''}
                                        onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#252547] rounded-lg border border-white/10 focus:border-purple-500 outline-none resize-none h-16"
                                        placeholder="Jelaskan misi tantangan ini..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Petunjuk (Hint)</label>
                                    <input
                                        type="text"
                                        value={editingLevel.hint || ''}
                                        onChange={(e) => setEditingLevel({ ...editingLevel, hint: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#252547] rounded-lg border border-white/10 focus:border-purple-500 outline-none"
                                        placeholder="Berikan petunjuk untuk pemain..."
                                    />
                                </div>

                                {/* Phase-Specific Editor */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <span>{PHASES[activeTab]?.icon}</span>
                                        Konfigurasi {PHASES[activeTab]?.name}
                                    </h4>
                                    {renderPhaseEditor()}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <p className="text-5xl mb-4">📝</p>
                                    <p>Pilih tantangan untuk diedit</p>
                                    <p className="text-sm mt-1">atau buat tantangan baru</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Hapus Tantangan?"
                size="sm"
            >
                <div>
                    <p className="mb-4">
                        Apakah Anda yakin ingin menghapus tantangan ini? Aksi ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
}
