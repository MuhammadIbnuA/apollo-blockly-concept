/**
 * BlockyKids - Admin Challenge Editor
 * Component for teachers to create/edit challenges
 */

'use client';

import { useState } from 'react';
import { PhaseId, BaseLevel, AdminChallenge } from '@/types';
import { Button, Modal } from '@/components/ui';
import { saveAdminChallenge, loadAdminChallenges, deleteAdminChallenge } from '@/lib/storage';

interface AdminEditorProps {
    phaseId: PhaseId;
    levelTemplate: Partial<BaseLevel>;
    onSave?: (challenge: AdminChallenge) => void;
    children?: (props: { openEditor: () => void }) => React.ReactNode;
}

export default function AdminEditor({
    phaseId,
    levelTemplate,
    onSave,
    children,
}: AdminEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
    const [editingChallenge, setEditingChallenge] = useState<Partial<BaseLevel>>(levelTemplate);

    const refreshChallenges = () => {
        setChallenges(loadAdminChallenges(phaseId));
    };

    const handleOpen = () => {
        refreshChallenges();
        setIsOpen(true);
    };

    const handleSave = () => {
        const challenge: AdminChallenge = {
            id: `admin_${phaseId}_${Date.now()}`,
            phaseId,
            level: {
                id: Date.now(),
                name: editingChallenge.name || 'Tantangan Baru',
                difficulty: editingChallenge.difficulty || 'easy',
                description: editingChallenge.description || '',
                hint: editingChallenge.hint || '',
                ...editingChallenge,
            } as BaseLevel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveAdminChallenge(challenge);
        refreshChallenges();
        onSave?.(challenge);
        setEditingChallenge(levelTemplate);
    };

    const handleDelete = (id: string) => {
        if (confirm('Hapus tantangan ini?')) {
            deleteAdminChallenge(id);
            refreshChallenges();
        }
    };

    return (
        <>
            {children ? (
                children({ openEditor: handleOpen })
            ) : (
                <Button variant="secondary" size="sm" onClick={handleOpen} icon="⚙️">
                    Edit Tantangan
                </Button>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="⚙️ Admin: Kelola Tantangan" size="lg">
                <div className="space-y-6">
                    {/* New Challenge Form */}
                    <div className="bg-secondary p-4 rounded-xl">
                        <h3 className="font-semibold mb-4">➕ Buat Tantangan Baru</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">Nama</label>
                                <input
                                    type="text"
                                    value={editingChallenge.name || ''}
                                    onChange={(e) => setEditingChallenge({ ...editingChallenge, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-white/10 focus:border-primary outline-none"
                                    placeholder="Nama tantangan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted mb-1">Kesulitan</label>
                                <select
                                    value={editingChallenge.difficulty || 'easy'}
                                    onChange={(e) => setEditingChallenge({ ...editingChallenge, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-white/10 focus:border-primary outline-none"
                                >
                                    <option value="easy">🟢 Mudah</option>
                                    <option value="medium">🟡 Sedang</option>
                                    <option value="hard">🔴 Sulit</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm text-muted mb-1">Deskripsi</label>
                                <textarea
                                    value={editingChallenge.description || ''}
                                    onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-white/10 focus:border-primary outline-none resize-none h-20"
                                    placeholder="Jelaskan misi..."
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm text-muted mb-1">Petunjuk</label>
                                <input
                                    type="text"
                                    value={editingChallenge.hint || ''}
                                    onChange={(e) => setEditingChallenge({ ...editingChallenge, hint: e.target.value })}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-white/10 focus:border-primary outline-none"
                                    placeholder="Berikan petunjuk..."
                                />
                            </div>
                        </div>

                        <Button variant="success" className="mt-4" onClick={handleSave} icon="💾">
                            Simpan Tantangan
                        </Button>
                    </div>

                    {/* Existing Challenges */}
                    <div>
                        <h3 className="font-semibold mb-3">📋 Tantangan Tersimpan</h3>

                        {challenges.length === 0 ? (
                            <p className="text-muted text-center py-8">Belum ada tantangan custom</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {challenges.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                                    >
                                        <div>
                                            <div className="font-medium">{c.level.name}</div>
                                            <div className="text-xs text-muted">{c.level.description}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingChallenge(c.level)}
                                                className="p-2 hover:bg-card-hover rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2 hover:bg-danger/20 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
