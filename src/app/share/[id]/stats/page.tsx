/**
 * Challenge Statistics Page
 * Admin view for student attempts and statistics
 */

import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import ChallengeStatsClient from '@/components/ChallengeStatsClient';

// Local type definition for sessions
interface Session {
    id: string;
    challengeId: string;
    studentName: string;
    mode: string;
    blocksUsed: number;
    runCount: number;
    timeElapsed: number;
    completed: boolean;
    startedAt: Date;
    completedAt: Date | null;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ChallengeStatsPage({ params }: Props) {
    const { id } = await params;

    const challenge = await prisma.customChallenge.findUnique({
        where: { id },
        include: {
            sessions: {
                orderBy: { startedAt: 'desc' },
            },
        },
    });

    if (!challenge) {
        notFound();
    }

    // Calculate stats
    const sessions: Session[] = challenge.sessions;
    const stats = {
        total: sessions.length,
        completed: sessions.filter((s: Session) => s.completed).length,
        blockMode: sessions.filter((s: Session) => s.mode === 'block').length,
        codeMode: sessions.filter((s: Session) => s.mode === 'code').length,
        avgBlocksUsed: sessions.length > 0
            ? Math.round(sessions.reduce((sum: number, s: Session) => sum + s.blocksUsed, 0) / sessions.length)
            : 0,
        avgTimeElapsed: sessions.length > 0
            ? Math.round(sessions.reduce((sum: number, s: Session) => sum + s.timeElapsed, 0) / sessions.length)
            : 0,
        avgRunCount: sessions.length > 0
            ? Math.round(sessions.reduce((sum: number, s: Session) => sum + s.runCount, 0) / sessions.length)
            : 0,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <a href="/admin" className="text-gray-400 hover:text-white mb-2 inline-block">
                        ← Kembali ke Admin
                    </a>
                    <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                    <p className="text-gray-400">{challenge.description || 'Tidak ada deskripsi'}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">{stats.total}</div>
                        <div className="text-gray-400 text-sm">Total Siswa</div>
                    </div>
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                        <div className="text-gray-400 text-sm">Selesai</div>
                    </div>
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{stats.blockMode}</div>
                        <div className="text-gray-400 text-sm">Mode Blok</div>
                    </div>
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats.codeMode}</div>
                        <div className="text-gray-400 text-sm">Mode Kode</div>
                    </div>
                </div>

                {/* Average Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.avgBlocksUsed}</div>
                        <div className="text-gray-400 text-sm">Rata-rata Blok</div>
                    </div>
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-400">{stats.avgRunCount}</div>
                        <div className="text-gray-400 text-sm">Rata-rata Run</div>
                    </div>
                    <div className="bg-[#252547] rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                            {Math.floor(stats.avgTimeElapsed / 60)}:{(stats.avgTimeElapsed % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-400 text-sm">Rata-rata Waktu</div>
                    </div>
                </div>

                {/* Sessions Table */}
                <ChallengeStatsClient
                    sessions={sessions.map(s => ({
                        ...s,
                        startedAt: s.startedAt.toISOString(),
                        completedAt: s.completedAt?.toISOString() || null,
                    }))}
                />
            </div>
        </div>
    );
}
