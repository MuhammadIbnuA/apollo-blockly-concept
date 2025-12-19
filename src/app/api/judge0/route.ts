/**
 * Judge0 API Proxy
 * Proxies requests to self-hosted Judge0 to avoid mixed content issues
 * (HTTPS site → HTTP Judge0 server)
 */

import { NextResponse } from 'next/server';

const JUDGE0_API_URL = process.env.JUDGE0_URL || 'http://129.212.236.32:2358';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'about';

    // Build query string from remaining params (exclude 'endpoint')
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== 'endpoint') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();
    const url = `${JUDGE0_API_URL}/${endpoint}${queryString ? '?' + queryString : ''}`;

    try {
        const response = await fetch(url, {
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

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Judge0 proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to Judge0 server' },
            { status: 503 }
        );
    }
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'submissions';
    const base64 = searchParams.get('base64_encoded') || 'true';
    const wait = searchParams.get('wait') || 'true';

    try {
        const body = await request.json();

        const url = `${JUDGE0_API_URL}/${endpoint}?base64_encoded=${base64}&wait=${wait}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Judge0 request failed: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Judge0 proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to Judge0 server' },
            { status: 503 }
        );
    }
}
