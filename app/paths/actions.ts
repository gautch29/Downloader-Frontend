'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = 'http://localhost:8080/api';

export async function getPathShortcutsAction() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        const response = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': `session_id=${sessionId}` }
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.paths || [];
    } catch (error) {
        return [];
    }
}

export async function addPathShortcutAction(formData: FormData) {
    const name = formData.get('name') as string;
    const path = formData.get('path') as string;

    if (!name || !path) {
        throw new Error('Name and path are required');
    }

    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        // Fetch current settings
        const settingsRes = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': `session_id=${sessionId}` }
        });

        if (!settingsRes.ok) throw new Error('Failed to fetch settings');

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
                'Cookie': `session_id=${sessionId}`
            },
            body: JSON.stringify({
                ...currentSettings,
                paths: newPaths
            })
        });

        if (!response.ok) throw new Error('Failed to update settings');

        revalidatePath('/');
    } catch (error) {
        throw new Error('Failed to add path');
    }
}

export async function deletePathShortcutAction(name: string) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        // Fetch current settings
        const settingsRes = await fetch(`${API_URL}/settings`, {
            headers: { 'Cookie': `session_id=${sessionId}` }
        });

        if (!settingsRes.ok) throw new Error('Failed to fetch settings');

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
                'Cookie': `session_id=${sessionId}`
            },
            body: JSON.stringify({
                ...currentSettings,
                paths: newPaths
            })
        });

        if (!response.ok) throw new Error('Failed to delete path');

        revalidatePath('/');
    } catch (error) {
        throw new Error('Failed to delete path');
    }
}

export async function updatePathShortcutAction(id: string, name: string, path: string) {
    // Delete and Add approach
    await deletePathShortcutAction(name);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('path', path);
    await addPathShortcutAction(formData);
}
