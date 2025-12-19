/**
 * BlockyKids - Main Page
 * Fixed hydration issues
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { PhaseId } from '@/types';

// Dynamic import untuk menghindari SSR issues
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const TutorialPhase = dynamic(() => import('@/components/phases/TutorialPhase'), { ssr: false });
const RobotPhase = dynamic(() => import('@/components/phases/RobotPhase'), { ssr: false });
const PixelArtPhase = dynamic(() => import('@/components/phases/PixelArtPhase'), { ssr: false });
const AnimationPhase = dynamic(() => import('@/components/phases/AnimationPhase'), { ssr: false });
const MathPhase = dynamic(() => import('@/components/phases/MathPhase'), { ssr: false });
const MusicPhase = dynamic(() => import('@/components/phases/MusicPhase'), { ssr: false });
const BuildingPhase = dynamic(() => import('@/components/phases/BuildingPhase'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<PhaseId>('tutorial');

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Load saved phase from localStorage
    const saved = localStorage.getItem('blockykids_progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (progress.currentPhase) {
          setCurrentPhase(progress.currentPhase);
        }
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  const handlePhaseChange = (phaseId: PhaseId) => {
    setCurrentPhase(phaseId);
    // Save to localStorage
    const saved = localStorage.getItem('blockykids_progress');
    const progress = saved ? JSON.parse(saved) : {};
    progress.currentPhase = phaseId;
    localStorage.setItem('blockykids_progress', JSON.stringify(progress));
  };

  const handleLevelComplete = (levelId: number | string) => {
    console.log('Level completed:', levelId);
    showToast('🎉 Level selesai!', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f23]">
        <div className="text-center">
          <span className="text-6xl block mb-4 animate-bounce">🧩</span>
          <p className="text-gray-400">Memuat BlockyKids...</p>
        </div>
      </div>
    );
  }

  const renderPhase = () => {
    const commonProps = {
      onLevelComplete: handleLevelComplete,
      showToast,
    };

    switch (currentPhase) {
      case 'tutorial':
        return <TutorialPhase {...commonProps} />;
      case 'robot':
        return <RobotPhase {...commonProps} />;
      case 'pixelart':
        return <PixelArtPhase {...commonProps} />;
      case 'animation':
        return <AnimationPhase {...commonProps} />;
      case 'math':
        return <MathPhase {...commonProps} />;
      case 'music':
        return <MusicPhase {...commonProps} />;
      case 'building':
        return <BuildingPhase {...commonProps} />;
      default:
        return <TutorialPhase {...commonProps} />;
    }
  };

  return (
    <>
      <Header currentPhase={currentPhase} onPhaseChange={handlePhaseChange} />

      <main className="pt-[70px] min-h-screen p-6">
        <div className="max-w-[1800px] mx-auto">
          {renderPhase()}
        </div>
      </main>
    </>
  );
}
