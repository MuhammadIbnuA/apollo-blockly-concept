/**
 * API Route for Challenge Sessions
 * Tracks student attempts for statistics
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

// POST - Create new session (when student enters name)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { challengeId, studentName, mode } = body;

        if (!challengeId || !studentName) {
            return NextResponse.json(
                { error: 'challengeId and studentName are required' },
                { status: 400 }
            );
        }

        const session = await prisma.challengeSession.create({
            data: {
                challengeId,
                studentName: studentName.trim(),
                mode: mode || 'block',
            },
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

// GET - Get sessions by challengeId (for statistics)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');

        if (!challengeId) {
            return NextResponse.json(
                { error: 'challengeId is required' },
                { status: 400 }
            );
        }

        const sessions: Session[] = await prisma.challengeSession.findMany({
            where: { challengeId },
            orderBy: { startedAt: 'desc' },
        });

        // Calculate statistics
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

        return NextResponse.json({ sessions, stats });
    } catch (error) {
        console.error('Get sessions error:', error);
        return NextResponse.json(
            { error: 'Failed to get sessions' },
            { status: 500 }
        );
    }
}
