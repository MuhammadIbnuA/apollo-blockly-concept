'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import StudentNameEntry from '@/components/StudentNameEntry';

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
    challengeId: string;
}

export default function SharePageContent({ phase, levelData, challengeTitle, challengeId }: SharePageContentProps) {
    const [studentName, setStudentName] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [blocksUsed, setBlocksUsed] = useState(0);
    const [runCount, setRunCount] = useState(0);
    const [currentMode, setCurrentMode] = useState<'block' | 'code'>('block');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start timer when session begins
    useEffect(() => {
        if (sessionId && !completed) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionId, completed]);

    // Update session periodically (every 30 seconds)
    useEffect(() => {
        if (!sessionId || completed) return;

        const updateSession = async () => {
            try {
                await fetch(`/api/sessions/${sessionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        timeElapsed,
                        blocksUsed,
                        runCount,
                        mode: currentMode,
                    }),
                });
            } catch (error) {
                console.error('Failed to update session:', error);
            }
        };

        if (timeElapsed > 0 && timeElapsed % 30 === 0) {
            updateSession();
        }
    }, [timeElapsed, sessionId, blocksUsed, runCount, currentMode, completed]);

    // Handle student name entry and create session
    const handleStartChallenge = async (name: string) => {
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    studentName: name,
                    mode: 'block',
                }),
            });
            const session = await res.json();
            setSessionId(session.id);
            setStudentName(name);
        } catch (error) {
            console.error('Failed to create session:', error);
            setStudentName(name); // Continue anyway
        }
    };

    const handleLevelComplete = useCallback(async (levelId: number | string) => {
        setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Final session update
        if (sessionId) {
            try {
                await fetch(`/api/sessions/${sessionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        completed: true,
                        timeElapsed,
                        blocksUsed,
                        runCount,
                        mode: currentMode,
                    }),
                });
            } catch (error) {
                console.error('Failed to complete session:', error);
            }
        }
    }, [sessionId, timeElapsed, blocksUsed, runCount, currentMode]);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        // Track run count when running code
        if (message.includes('Berjalan') || message.includes('Running') || message.includes('Menjalankan')) {
            setRunCount(prev => prev + 1);
        }
        if (type === 'success' && message.includes('selesai')) {
            // Could trigger completion
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Show name entry first
    if (!studentName) {
        return <StudentNameEntry challengeTitle={challengeTitle} onStart={handleStartChallenge} />;
    }

    // Completed screen
    if (completed) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-6">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Tantangan Selesai!
                </h2>
                <div className="bg-[#1a1a35] p-6 rounded-2xl border border-white/10">
                    <p className="text-gray-400 mb-2">Bagus sekali, {studentName}! 👏</p>
                    <p className="text-xl font-semibold text-white mb-4">{challengeTitle}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#252547] rounded-xl p-3">
                            <div className="text-2xl font-bold text-cyan-400">{formatTime(timeElapsed)}</div>
                            <div className="text-xs text-gray-400">Waktu</div>
                        </div>
                        <div className="bg-[#252547] rounded-xl p-3">
                            <div className="text-2xl font-bold text-yellow-400">{blocksUsed}</div>
                            <div className="text-xs text-gray-400">Blok</div>
                        </div>
                        <div className="bg-[#252547] rounded-xl p-3">
                            <div className="text-2xl font-bold text-orange-400">{runCount}</div>
                            <div className="text-xs text-gray-400">Run</div>
                        </div>
                    </div>

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

    // Timer and stats bar
    const StatsBar = () => (
        <div className="fixed top-0 left-0 right-0 bg-[#1a1a35]/95 backdrop-blur-sm border-b border-white/10 z-50 px-4 py-2">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-white font-medium">👤 {studentName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-300">{challengeTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <span>⏱️</span>
                        <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400">
                        <span>🧩</span>
                        <span className="font-bold">{blocksUsed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-400">
                        <span>▶️</span>
                        <span className="font-bold">{runCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPhase = () => {
        switch (phase) {
            case 'tutorial':
                return <TutorialPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'building':
                return <BuildingPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'pixel-art':
            case 'pixelart':
                return <PixelArtPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'animation':
                return <AnimationPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'math':
                return <MathPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'music':
                return <MusicPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            case 'robot':
                return <RobotPhase onLevelComplete={handleLevelComplete} showToast={showToast} initialLevel={levelData} />;
            default:
                return (
                    <div className="text-center py-20">
                        <p className="text-xl text-red-400">Tipe tantangan &quot;{phase}&quot; belum didukung untuk sharing.</p>
                        <Link href="/" className="text-blue-400 hover:underline mt-4 block">Kembali</Link>
                    </div>
                );
        }
    };

    return (
        <>
            <StatsBar />
            <div className="pt-14">
                {renderPhase()}
            </div>
        </>
    );
}
