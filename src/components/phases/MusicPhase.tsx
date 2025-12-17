/**
 * BlockyKids - Music Phase
 * With working Blockly and Web Audio
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import LevelList from '@/components/LevelList';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';
import { MusicLevel } from '@/types';

interface MusicPhaseProps {
    onLevelComplete: (levelId: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const NOTES = [
    { name: 'Do', note: 'C4', freq: 261.63 },
    { name: 'Re', note: 'D4', freq: 293.66 },
    { name: 'Mi', note: 'E4', freq: 329.63 },
    { name: 'Fa', note: 'F4', freq: 349.23 },
    { name: 'Sol', note: 'G4', freq: 392.00 },
    { name: 'La', note: 'A4', freq: 440.00 },
    { name: 'Si', note: 'B4', freq: 493.88 },
    { name: 'Do↑', note: 'C5', freq: 523.25 },
];

const DEFAULT_LEVELS: MusicLevel[] = [
    { id: 1, name: 'Nada Pertama', difficulty: 'easy', description: 'Mainkan nada "Do"!', hint: 'Gunakan blok "Mainkan Do"', goal: { type: 'notes', required: ['C4'], minNotes: 1 } },
    { id: 2, name: 'Do Re Mi', difficulty: 'easy', description: 'Mainkan Do - Re - Mi berurutan!', hint: 'Susun 3 blok nada', goal: { type: 'sequence', required: ['C4', 'D4', 'E4'] } },
    { id: 3, name: 'Tangga Nada', difficulty: 'medium', description: 'Mainkan semua nada dari Do sampai Do tinggi!', hint: 'Gunakan semua 8 nada', goal: { type: 'notes', minNotes: 8 } },
    { id: 4, name: 'Repetisi', difficulty: 'medium', description: 'Mainkan Do 3 kali dengan pengulangan!', hint: 'Gunakan blok Ulangi', goal: { type: 'repeat', minNotes: 3 } },
    { id: 8, name: 'Komposisi Bebas', difficulty: 'free', description: 'Buat musik sendiri! Minimal 5 nada.', hint: 'Berkreasi dengan bebas!', goal: { type: 'free', minNotes: 5 } },
];

const TOOLBOX = {
    kind: 'categoryToolbox' as const,
    contents: [
        {
            kind: 'category' as const,
            name: '🎵 Nada',
            colour: '#E91E63',
            contents: [
                { kind: 'block' as const, type: 'music_play_note' },
                { kind: 'block' as const, type: 'music_rest' },
            ],
        },
        {
            kind: 'category' as const,
            name: '🔁 Kontrol',
            colour: '#FF9800',
            contents: [
                { kind: 'block' as const, type: 'repeat_times' },
            ],
        },
    ],
};

export default function MusicPhase({ onLevelComplete, showToast }: MusicPhaseProps) {
    const [levels] = useState(DEFAULT_LEVELS);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentCode, setCurrentCode] = useState('');
    const [playedNotes, setPlayedNotes] = useState<string[]>([]);
    const [activeKey, setActiveKey] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const level = levels[currentLevel];

    // Initialize audio context
    useEffect(() => {
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const playFrequency = useCallback((freq: number, duration: number = 0.5) => {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }, [getAudioContext]);

    const playNoteByName = useCallback((noteName: string) => {
        const noteData = NOTES.find(n => n.note === noteName);
        if (noteData) {
            const idx = NOTES.indexOf(noteData);
            setActiveKey(idx);
            playFrequency(noteData.freq);
            setPlayedNotes(prev => [...prev, noteName]);
            setTimeout(() => setActiveKey(null), 300);
        }
    }, [playFrequency]);

    const handlePianoClick = useCallback((idx: number) => {
        setActiveKey(idx);
        playFrequency(NOTES[idx].freq);
        setPlayedNotes(prev => [...prev, NOTES[idx].note]);
        setTimeout(() => setActiveKey(null), 300);
    }, [playFrequency]);

    const handleRun = useCallback(async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setPlayedNotes([]);

        const musicPlayNote = async (note: string) => {
            playNoteByName(note);
            await new Promise(r => setTimeout(r, 500));
        };

        const musicRest = async (beats: number) => {
            await new Promise(r => setTimeout(r, beats * 500));
        };

        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('musicPlayNote', 'musicRest', `
        return (async () => { ${currentCode} })();
      `);
            await fn(musicPlayNote, musicRest);
            showToast('🎵 Musik selesai!', 'success');
        } catch (e) {
            console.error('Error playing music:', e);
            showToast('Error: ' + (e as Error).message, 'error');
        }

        setIsPlaying(false);
    }, [currentCode, isPlaying, playNoteByName, showToast]);

    const handleCheck = useCallback(() => {
        const goal = level.goal;
        let success = false;

        switch (goal.type) {
            case 'notes':
                if (goal.required) {
                    success = goal.required.every(n => playedNotes.includes(n));
                } else if (goal.minNotes) {
                    success = playedNotes.length >= goal.minNotes;
                }
                break;
            case 'sequence':
                if (goal.required) {
                    success = goal.required.every((n, i) => playedNotes[i] === n);
                }
                break;
            case 'repeat':
                success = playedNotes.length >= (goal.minNotes || 3);
                break;
            case 'free':
                success = playedNotes.length >= (goal.minNotes || 5);
                break;
        }

        if (success) {
            onLevelComplete(level.id);
            showToast('🎉 Berhasil!', 'success');
            if (currentLevel < levels.length - 1 && goal.type !== 'free') {
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    setPlayedNotes([]);
                }, 1500);
            }
        } else {
            showToast('Belum tepat, coba lagi!', 'warning');
        }
    }, [currentLevel, level, levels.length, onLevelComplete, playedNotes, showToast]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 min-h-[calc(100vh-94px)]">
            {/* Sidebar */}
            <div className="bg-[#252547] rounded-2xl p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">🎵 Musik</h3>
                <LevelList levels={levels} currentLevel={currentLevel} onSelect={(idx) => { setCurrentLevel(idx); setPlayedNotes([]); }} />
            </div>

            {/* Main */}
            <div className="bg-[#252547] rounded-2xl p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Level {level.id}: {level.name}</h3>
                    <p className="text-gray-400">{level.description}</p>
                </div>

                {/* Piano */}
                <div className="flex justify-center gap-1 mb-6">
                    {NOTES.map((note, i) => (
                        <button
                            key={i}
                            onClick={() => handlePianoClick(i)}
                            className={`w-12 h-28 rounded-b-lg flex flex-col items-center justify-end pb-2 transition-all shadow-md ${activeKey === i
                                    ? 'bg-gradient-to-b from-[#6c5ce7] to-[#a29bfe] text-white translate-y-1'
                                    : 'bg-gradient-to-b from-white to-gray-200 text-gray-800 hover:from-gray-100 hover:to-gray-300'
                                }`}
                        >
                            <span className="text-xs font-semibold">{note.name}</span>
                        </button>
                    ))}
                </div>

                {/* Notes Display */}
                <div className="bg-[#1a1a35] rounded-xl mb-4 flex-1">
                    <div className="p-3 border-b border-white/10 font-semibold">🎼 Not yang Dimainkan</div>
                    <div className="p-4 min-h-[80px] flex flex-wrap gap-2 overflow-y-auto max-h-[150px]">
                        {playedNotes.length === 0 ? (
                            <p className="text-gray-500 italic">Jalankan program untuk memainkan musik...</p>
                        ) : (
                            playedNotes.map((note, i) => {
                                const noteData = NOTES.find(n => n.note === note);
                                return (
                                    <span key={i} className="px-3 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-lg text-sm animate-pulse">
                                        ♪ {noteData?.name || note}
                                    </span>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button variant="success" onClick={handleRun} disabled={isPlaying} icon="▶️">
                        {isPlaying ? 'Memainkan...' : 'Mainkan'}
                    </Button>
                    <Button variant="danger" onClick={() => setPlayedNotes([])} icon="⏹️">Stop</Button>
                    {level.goal.type !== 'free' && (
                        <Button variant="primary" onClick={handleCheck} icon="✓">Periksa</Button>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-[#fdcb6e]/10 border-l-4 border-[#fdcb6e] rounded-r-xl text-gray-300">
                    <span>💡</span>
                    <span>{level.hint}</span>
                </div>
            </div>

            {/* Blockly */}
            <div className="bg-[#252547] rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">🧩 Blok Kode</h3>
                </div>
                <div className="flex-1 min-h-[500px]">
                    <BlocklyWorkspace toolbox={TOOLBOX} onCodeChange={setCurrentCode} />
                </div>
            </div>
        </div>
    );
}
