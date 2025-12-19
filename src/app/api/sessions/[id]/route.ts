/**
 * API Route for updating a specific session
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PATCH - Update session (blocksUsed, completed, timeElapsed, runCount)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { blocksUsed, runCount, timeElapsed, completed, mode } = body;

        const updateData: any = {};

        if (blocksUsed !== undefined) updateData.blocksUsed = blocksUsed;
        if (runCount !== undefined) updateData.runCount = runCount;
        if (timeElapsed !== undefined) updateData.timeElapsed = timeElapsed;
        if (mode !== undefined) updateData.mode = mode;
        if (completed !== undefined) {
            updateData.completed = completed;
            if (completed) {
                updateData.completedAt = new Date();
            }
        }

        const session = await prisma.challengeSession.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error('Update session error:', error);
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a session
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.challengeSession.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}
