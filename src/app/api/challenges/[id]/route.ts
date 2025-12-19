import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const challenge = await prisma.customChallenge.findUnique({
            where: { id: params.id },
        });
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }
        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Failed to fetch challenge:', error);
        return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();
        const challenge = await prisma.customChallenge.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                phase: body.phase,
                difficulty: body.difficulty,
                config: body.config,
                isPublic: body.isPublic,
            },
        });
        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Failed to update challenge:', error);
        return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.customChallenge.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete challenge:', error);
        return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
    }
}
