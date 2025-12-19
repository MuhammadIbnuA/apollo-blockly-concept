/**
 * BlockyKids - Generic Challenge Editor
 * Basic editor for phases without specific configuration
 */

'use client';

import { BaseLevel } from '@/types';

interface GenericChallengeEditorProps {
    level: Partial<BaseLevel>;
    onChange: (level: Partial<BaseLevel>) => void;
    phaseId: string;
}

export default function GenericChallengeEditor({ level, onChange, phaseId }: GenericChallengeEditorProps) {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                    ⚠️ Editor khusus untuk fase <strong>{phaseId}</strong> belum tersedia.
                    Gunakan field dasar di bawah ini.
                </p>
            </div>

            {/* Additional Notes */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">📝 Catatan Tambahan</label>
                <textarea
                    value={(level as any).notes || ''}
                    onChange={(e) => onChange({ ...level, notes: e.target.value } as any)}
                    className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none resize-none h-24"
                    placeholder="Catatan khusus untuk level ini..."
                />
            </div>

            {/* Max Blocks Limit */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">🛑 Batas Jumlah Blok (Opsional)</label>
                <input
                    type="number"
                    min="1"
                    value={level.maxBlocks || ''}
                    onChange={(e) => onChange({ ...level, maxBlocks: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Contoh: 10 (Kosongkan jika tidak ada batas)"
                    className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none transition-colors"
                />
            </div>

            {/* JSON Editor for Advanced Users */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">🔧 Konfigurasi JSON (Advanced)</label>
                <textarea
                    value={JSON.stringify(level, null, 2)}
                    onChange={(e) => {
                        try {
                            onChange(JSON.parse(e.target.value));
                        } catch {
                            // Ignore parse errors while typing
                        }
                    }}
                    className="w-full px-3 py-2 bg-[#1a1a35] rounded-lg border border-white/10 focus:border-purple-500 outline-none resize-none h-40 font-mono text-xs"
                />
            </div>
        </div>
    );
}
