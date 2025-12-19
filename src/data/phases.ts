/**
 * BlockyKids - Phase Configuration
 * Data konfigurasi semua fase pembelajaran
 */

import { Phase, PhaseId } from '@/types';

export const PHASES: Record<PhaseId, Phase> = {
    tutorial: {
        id: 'tutorial',
        name: 'Tutorial',
        icon: '🎓',
        description: 'Belajar dasar-dasar blok coding',
        color: '#55efc4',
        order: 1,
    },
    robot: {
        id: 'robot',
        name: 'Robot Petualang',
        icon: '🤖',
        description: 'Navigasi robot di grid',
        color: '#74b9ff',
        order: 2,
    },
    pixelart: {
        id: 'pixelart',
        name: 'Pixel Art',
        icon: '🎨',
        description: 'Menggambar dengan kode',
        color: '#a29bfe',
        order: 3,
    },
    animation: {
        id: 'animation',
        name: 'Animasi',
        icon: '🎬',
        description: 'Buat animasi sprite',
        color: '#fd79a8',
        order: 4,
    },
    math: {
        id: 'math',
        name: 'Math Quest',
        icon: '🧮',
        description: 'Matematika dengan kode',
        color: '#fdcb6e',
        order: 5,
    },
    music: {
        id: 'music',
        name: 'Musik',
        icon: '🎵',
        description: 'Komposisi musik',
        color: '#e17055',
        order: 6,
    },
    building: {
        id: 'building',
        name: 'Building Craft',
        icon: '🏗️',
        description: 'Bangun struktur 3D dengan kode',
        color: '#00cec9',
        order: 7,
    },
};

export const PHASE_LIST = Object.values(PHASES).sort((a, b) => a.order - b.order);
