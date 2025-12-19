import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');

    try {
        const challenges = await prisma.customChallenge.findMany({
            where: phase ? { phase } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(challenges);
    } catch (error) {
        console.error('Failed to fetch challenges:', error);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const challenge = await prisma.customChallenge.create({
            data: {
                title: body.title,
                description: body.description,
                phase: body.phase,
                difficulty: body.difficulty,
                config: body.config,
                isPublic: body.isPublic || false,
            },
        });
        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Failed to create challenge:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
