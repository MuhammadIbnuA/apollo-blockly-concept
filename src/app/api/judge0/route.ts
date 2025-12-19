/**
 * Judge0 API Proxy Route
 * Proxy untuk menghindari CORS saat mengakses Judge0 dari browser
 */

import { NextRequest, NextResponse } from 'next/server';

// Judge0 server URL from environment variable
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || process.env.NEXT_PUBLIC_JUDGE0_URL || 'http://129.212.236.32:2358';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pathname, ...data } = body;

        // Construct the full Judge0 URL
        const judge0Url = `${JUDGE0_API_URL}${pathname || '/submissions?base64_encoded=true&wait=true'}`;

        const response = await fetch(judge0Url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Judge0 request failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Judge0 Proxy Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy error occurred' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pathname = searchParams.get('pathname') || '/about';

        // Construct the full Judge0 URL
        const judge0Url = `${JUDGE0_API_URL}${pathname}`;

        const response = await fetch(judge0Url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Judge0 request failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Judge0 Proxy Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy error occurred' },
            { status: 500 }
        );
    }
}
