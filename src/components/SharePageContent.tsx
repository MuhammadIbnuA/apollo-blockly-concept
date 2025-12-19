'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const TutorialPhase = dynamic(() => import('@/components/phases/TutorialPhase'), { ssr: false });
const BuildingPhase = dynamic(() => import('@/components/phases/BuildingPhase'), { ssr: false });
const PixelArtPhase = dynamic(() => import('@/components/phases/PixelArtPhase'), { ssr: false });
const AnimationPhase = dynamic(() => import('@/components/phases/AnimationPhase'), { ssr: false });
const MathPhase = dynamic(() => import('@/components/phases/MathPhase'), { ssr: false });
const MusicPhase = dynamic(() => import('@/components/phases/MusicPhase'), { ssr: false });
const RobotPhase = dynamic(() => import('@/components/phases/RobotPhase'), { ssr: false });

interface SharePageContentProps {
    phase: string;
    levelData: any;
    challengeTitle: string;
}

export default function SharePageContent({ phase, levelData, challengeTitle }: SharePageContentProps) {
    const [completed, setCompleted] = useState(false);

    const handleLevelComplete = (levelId: number | string) => {
        setCompleted(true);
        // Could enable a visual celebration or "Play More" button
    };

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        // Simple alert for now or implement toast container
        if (type === 'success') alert(message);
    };

    if (completed) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-6">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Tantangan Selesai!
                </h2>
                <div className="bg-[#1a1a35] p-6 rounded-2xl border border-white/10">
                    <p className="text-gray-400 mb-4">Kamu berhasil menyelesaikan tantangan:</p>
                    <p className="text-xl font-semibold text-white mb-6">{challengeTitle}</p>
                    <Link
                        href="/"
                        className="inline-block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                        Kembali ke Menu Utama
                    </Link>
                </div>
            </div>
        );
    }

    switch (phase) {
        case 'tutorial':
            return <TutorialPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
        case 'building':
            return <BuildingPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
        case 'pixel-art':
            return <PixelArtPhase onLevelComplete={handleLevelComplete} showToast={showToast} />;
        case 'animation':
            return <AnimationPhase onLevelComplete={handleLevelComplete} showToast={showToast} />;
        case 'math':
            return <MathPhase onLevelComplete={handleLevelComplete} showToast={showToast} />;
        case 'music':
            return <MusicPhase onLevelComplete={handleLevelComplete} showToast={showToast} />;
        case 'robot':
            return <RobotPhase onLevelComplete={handleLevelComplete} showToast={showToast} />;
        default:
            return (
                <div className="text-center py-20">
                    <p className="text-xl text-red-400">Tipe tantangan &quot;{phase}&quot; belum didukung untuk sharing.</p>
                    <Link href="/" className="text-blue-400 hover:underline mt-4 block">Kembali</Link>
                </div>
            );
    }
}
