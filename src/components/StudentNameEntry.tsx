/**
 * Student Name Entry Component
 * Kahoot-style name entry before starting a challenge
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface StudentNameEntryProps {
    challengeTitle: string;
    onStart: (name: string) => void;
}

export default function StudentNameEntry({ challengeTitle, onStart }: StudentNameEntryProps) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        onStart(name.trim());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center p-4">
            <div className="bg-[#252547] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎮</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang!</h1>
                    <p className="text-gray-400">Kamu akan memainkan:</p>
                    <p className="text-xl font-semibold text-[#6c5ce7] mt-2">{challengeTitle}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Masukkan Nama Kamu
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Budi"
                            maxLength={30}
                            className="w-full px-4 py-3 bg-[#1a1a35] border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent transition-all text-lg"
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 text-lg font-bold"
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Memuat...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                🚀 Mulai Tantangan!
                            </span>
                        )}
                    </Button>
                </form>

                {/* Tips */}
                <div className="mt-6 p-4 bg-[#1a1a35] rounded-xl border border-white/10">
                    <p className="text-sm text-gray-400 text-center">
                        💡 Guru kamu bisa melihat progres dan hasil kerjamu
                    </p>
                </div>
            </div>
        </div>
    );
}
