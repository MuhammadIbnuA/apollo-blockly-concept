/**
 * Challenge Stats Client Component
 * Client-side table with sessions data
 */

'use client';

interface Session {
    id: string;
    studentName: string;
    mode: string;
    blocksUsed: number;
    runCount: number;
    timeElapsed: number;
    completed: boolean;
    startedAt: string;
    completedAt: string | null;
}

interface Props {
    sessions: Session[];
}

export default function ChallengeStatsClient({ sessions }: Props) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (sessions.length === 0) {
        return (
            <div className="bg-[#252547] rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Data</h3>
                <p className="text-gray-400">
                    Bagikan link tantangan ini ke siswa untuk mulai mengumpulkan data.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#252547] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">📋 Daftar Siswa ({sessions.length})</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-[#1a1a35] text-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-left">Nama</th>
                            <th className="px-4 py-3 text-center">Mode</th>
                            <th className="px-4 py-3 text-center">Blok</th>
                            <th className="px-4 py-3 text-center">Run</th>
                            <th className="px-4 py-3 text-center">Waktu</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-left">Mulai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-white font-medium">
                                    {session.studentName}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs ${session.mode === 'block'
                                            ? 'bg-purple-500/20 text-purple-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                        }`}>
                                        {session.mode === 'block' ? '🧩 Blok' : '💻 Kode'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-yellow-400">
                                    {session.blocksUsed}
                                </td>
                                <td className="px-4 py-3 text-center text-orange-400">
                                    {session.runCount}
                                </td>
                                <td className="px-4 py-3 text-center text-cyan-400">
                                    {formatTime(session.timeElapsed)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {session.completed ? (
                                        <span className="text-green-400">✅</span>
                                    ) : (
                                        <span className="text-gray-500">⏳</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-400">
                                    {formatDate(session.startedAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
