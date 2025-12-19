import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import SharePageContent from '@/components/SharePageContent';

interface SharePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SharePage({ params }: SharePageProps) {
    const { id } = await params;

    const challenge = await prisma.customChallenge.findUnique({
        where: { id },
    });

    if (!challenge) {
        notFound();
    }

    const levelData: any = {
        ...(challenge.config as any),
        id: challenge.id,
        name: challenge.title,
        difficulty: challenge.difficulty,
        description: challenge.description || '',
    };



    return (
        <div className="min-h-screen bg-[#0f0f23] text-white">
            <header className="h-[70px] bg-[#1a1a35]/80 backdrop-blur-md border-b border-white/10 flex items-center px-6 sticky top-0 z-50">
                <div className="max-w-[1800px] w-full mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                            <span className="text-xl">🧩</span>
                        </div>
                        <h1 className="font-bold text-xl tracking-tight">
                            Blocky<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Kids</span>
                        </h1>
                    </Link>
                    <div className="bg-purple-600/20 px-4 py-1.5 rounded-full border border-purple-500/30 text-sm font-medium text-purple-300">
                        Tantangan Custom: {challenge.title}
                    </div>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-[1800px] mx-auto">
                    <SharePageContent
                        phase={challenge.phase}
                        levelData={levelData}
                        challengeTitle={challenge.title}
                    />
                </div>
            </main>
        </div>
    );
}
