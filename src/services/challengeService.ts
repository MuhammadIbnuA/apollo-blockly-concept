import { CustomChallenge } from '@prisma/client';

const API_URL = '/api/challenges';

export const challengeService = {
    async getAll(phase?: string): Promise<CustomChallenge[]> {
        const url = phase ? `${API_URL}?phase=${phase}` : API_URL;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch challenges');
        return res.json();
    },

    async getById(id: string): Promise<CustomChallenge> {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch challenge');
        return res.json();
    },

    async create(data: Partial<CustomChallenge>): Promise<CustomChallenge> {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create challenge');
        return res.json();
    },

    async update(id: string, data: Partial<CustomChallenge>): Promise<CustomChallenge> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update challenge');
        return res.json();
    },

    async delete(id: string): Promise<boolean> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete challenge');
        const json = await res.json();
        return json.success;
    }
};
