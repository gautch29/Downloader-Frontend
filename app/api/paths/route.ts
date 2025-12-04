import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'http://localhost:8080/api';

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': request.headers.get('cookie') || '' }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch paths' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ paths: data.paths || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, path } = body;

        if (!name || !path) {
            return NextResponse.json({ error: 'Name and path are required' }, { status: 400 });
        }

        const cookie = request.headers.get('cookie') || '';

        // Fetch current settings
        const settingsRes = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': cookie }
        });

        if (!settingsRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: settingsRes.status });
        }

        const data = await settingsRes.json();
        const currentPaths = data.paths || [];
        const currentSettings = data.settings || {};

        // Add new path
        const newPaths = [...currentPaths, { name, path }];

        // Update settings
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                ...currentSettings,
                paths: newPaths
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to create path' }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const cookie = request.headers.get('cookie') || '';

        // Fetch current settings
        const settingsRes = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': cookie }
        });

        if (!settingsRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: settingsRes.status });
        }

        const data = await settingsRes.json();
        const currentPaths = data.paths || [];
        const currentSettings = data.settings || {};

        // Filter out path
        const newPaths = currentPaths.filter((p: any) => p.name !== name);

        // Update settings
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                ...currentSettings,
                paths: newPaths
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to delete path' }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
