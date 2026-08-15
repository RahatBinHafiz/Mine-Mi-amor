import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Sliders
} from 'lucide-react';

interface InfinityLovePageProps {
  onBack: () => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  currentSongTitle: string;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  char: string;
  size: number;
}

export default function InfinityLovePage({
  onBack,
  musicPlaying,
  onToggleMusic,
  currentSongTitle
}: InfinityLovePageProps) {
  // State
  const [totalItems, setTotalItems] = useState(65);
  const [loveWord, setLoveWord] = useState('I love you Suhana');
  const [theme, setTheme] = useState<'rosegold' | 'sunset' | 'violet' | 'ruby' | 'starlight'>('rosegold');
  const [mode, setMode] = useState<'heart' | 'helix'>('heart');
  const [is3DOrbit, setIs3DOrbit] = useState(true);
  const [stageRotate, setStageRotate] = useState({ x: 15, y: -20, z: 0 });
  const [responsiveScale, setResponsiveScale] = useState(0.75);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Dynamic Responsive Scale to ensure perfect fit on all mobile screens
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 640;
      setIsMobile(mobile);

      // On initial load or resize, calculate scale factor relative to 540px base heart size
      // Leaving safe margins for headers, footers and screen edges
      const availableW = Math.min(w * 0.9, 560);
      const availableH = Math.min((h - 180) * 0.9, 560);
      const computedScale = Math.min(availableW / 530, availableH / 470, 1.05);
      
      setResponsiveScale(Math.max(0.48, Math.min(1.15, computedScale)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto 3D orbit animation
  useEffect(() => {
    if (!is3DOrbit || isDragging) return;
    let animationFrameId: number;
    let angle = 0;

    const loop = () => {
      angle += 0.4;
      setStageRotate(prev => ({
        x: 12 + Math.sin(angle * 0.02) * 10,
        y: Math.sin(angle * 0.03) * 22,
        z: Math.sin(angle * 0.015) * 6
      }));
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [is3DOrbit, isDragging]);

  // Touch and Mouse Drag to Orbit 3D Heart
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, .control-panel')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setStageRotate(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3,
      z: prev.z
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, .control-panel')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setStageRotate(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.35)),
      y: prev.y + deltaX * 0.35,
      z: prev.z
    }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Click anywhere to burst sparkling heart particles
  const handleStageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, .control-panel')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX;
    const y = e.clientY;
    
    const chars = ['💖', '✨', '🌹', '❤️', '💍', '🌸', '💫', '♾️'];
    const newParticles: FloatingParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: x + (Math.random() * 80 - 40),
      y: y + (Math.random() * 80 - 40),
      char: chars[Math.floor(Math.random() * chars.length)],
      size: Math.random() * 1.2 + 0.8
    }));

    setParticles(prev => [...prev.slice(-25), ...newParticles]);
  };

  // Clean old particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles(prev => prev.slice(6));
    }, 1800);
    return () => clearTimeout(timer);
  }, [particles]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const presetMessages = [
    'I love you Suhana',
    'Infinity Love from Rahat ∞',
    'Rahat ❤️ Suhana Forever',
    'I love you Suhana ❤️',
    'My Forever Suhana 💍',
    'Suhana You are My Universe 🌌'
  ];

  return (
    <div 
      ref={containerRef}
      className={`suhana-page-wrapper theme-${theme} mode-${mode} select-none cursor-default`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onClick={handleStageClick}
    >
      {/* BACKGROUND GLOWING ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-rose-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* TOP FLOATING NAVIGATION BAR */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-cream text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title="Return to Anniversary Story"
          >
            <ArrowLeft className="w-4 h-4 text-pink" />
            <span className="font-serif tracking-wider uppercase text-xs">Our Story</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-pink/10 border border-pink/20 text-pink text-xs">
            <Heart className="w-3.5 h-3.5 fill-pink animate-pulse" />
            <span className="font-semibold tracking-wide">Rahat & Suhana</span>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center">
          <h1 className="text-sm sm:text-lg font-serif font-bold text-cream tracking-wider flex items-center justify-center gap-1.5">
            <span className="text-pink text-lg font-bold">∞</span>
            <span>Infinity Love from Rahat</span>
            <span className="text-pink animate-bounce">💖</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-white/50 font-sans tracking-widest uppercase">
            Dedicated with eternal love to Suhana
          </p>
        </div>

        {/* QUICK CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Music button */}
          <button
            onClick={onToggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 border cursor-pointer ${
              musicPlaying 
                ? 'bg-pink/20 border-pink text-cream shadow-sm shadow-pink/30' 
                : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'
            }`}
            title="Soundtrack Playback"
          >
            {musicPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden md:inline line-clamp-1 max-w-[100px]">{currentSongTitle}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full border transition-all duration-200 cursor-pointer ${
              showSettings ? 'bg-pink border-pink text-white' : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/20'
            }`}
            title="Customizer & Theme Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all duration-200 cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* FLOATING SETTINGS & THEME PANEL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="control-panel absolute top-16 right-2 sm:right-8 z-40 w-[calc(100vw-1rem)] sm:w-96 max-h-[82vh] overflow-y-auto p-4 sm:p-5 rounded-2xl bg-black/90 border border-pink/30 backdrop-blur-xl shadow-2xl shadow-pink/10 text-cream custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink" />
                Customize Infinity Love Heart
              </span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white/40 hover:text-white text-xs px-2 py-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Custom Text input */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                Love Message
              </label>
              <input
                type="text"
                value={loveWord}
                onChange={(e) => setLoveWord(e.target.value)}
                placeholder="I love you Suhana"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-cream placeholder-white/30 focus:outline-none focus:border-pink/70 transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setLoveWord(msg)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      loveWord === msg 
                        ? 'bg-pink/30 border-pink text-white font-medium' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Color themes */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-medium">
                Glow Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'rosegold', label: 'Rose', color: '#ff6eb4' },
                  { id: 'sunset', label: 'Gold', color: '#ffd166' },
                  { id: 'violet', label: 'Violet', color: '#c77dff' },
                  { id: 'ruby', label: 'Ruby', color: '#ff3366' },
                  { id: 'starlight', label: 'Aqua', color: '#5eead4' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                      theme === t.id ? 'bg-white/20 border-white ring-2 ring-pink' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.color }} />
                    <span className="text-[10px] text-white/80">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode & density selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                  Formation
                </label>
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                  <button
                    onClick={() => setMode('heart')}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                      mode === 'heart' ? 'bg-pink text-white font-semibold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Heart
                  </button>
                  <button
                    onClick={() => setMode('helix')}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                      mode === 'helix' ? 'bg-pink text-white font-semibold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Helix
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                  Words Density ({totalItems})
                </label>
                <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {[
                    { cnt: 45, label: '45' },
                    { cnt: 65, label: '65' },
                    { cnt: 85, label: '85' },
                    { cnt: 100, label: '100' }
                  ].map(opt => (
                    <button
                      key={opt.cnt}
                      onClick={() => setTotalItems(opt.cnt)}
                      className={`py-1.5 text-[11px] rounded-lg transition-all cursor-pointer text-center ${
                        totalItems === opt.cnt ? 'bg-pink text-white font-semibold' : 'text-white/60 hover:text-white'
                      }`}
                      title={`${opt.cnt} words`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3D Orbit Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-white/70">Auto 3D Orbit Rotation</span>
              <button
                onClick={() => setIs3DOrbit(!is3DOrbit)}
                className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                  is3DOrbit ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-white/10 border-white/20 text-white/50'
                }`}
              >
                {is3DOrbit ? 'Active' : 'Paused'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN 3D ANIMATION CONTAINER (#ui) */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* CENTER HEART GLOW */}
        <div className="heart-center-glow top-1/2 left-1/2" />

        {/* DRAG INTERACTION HINT */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-70 text-center px-4 w-full">
          <p className="text-[11px] sm:text-xs text-cream/80 font-sans tracking-wide">
            ✨ {isMobile ? 'Touch & drag to rotate 3D heart' : 'Drag to rotate in 3D • Tap anywhere for sparks'} ✨
          </p>
        </div>

        {/* EXACT SPECIFIED DOM STRUCTURE (#ui -> .love -> .love_horizontal -> .love_vertical -> .love_word) */}
        <div id="ui" className="cursor-grab active:cursor-grabbing">
          <div 
            ref={stageRef}
            className="love-stage"
            style={{
              transform: `scale(${responsiveScale}) rotateX(${stageRotate.x}deg) rotateY(${stageRotate.y}deg) rotateZ(${stageRotate.z}deg)`
            }}
          >
            {Array.from({ length: totalItems }).map((_, index) => {
              const i = index + 1;
              const delayMs = (12000 / totalItems).toFixed(2);
              return (
                <div 
                  key={i} 
                  className="love" 
                  style={{ 
                    '--i': i,
                    '--delay': `${delayMs}ms`
                  } as React.CSSProperties}
                >
                  <div className="love_horizontal">
                    <div className="love_vertical">
                      <div className="love_word">
                        {loveWord}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CLICK PARTICLES BURST */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: p.size, 
              y: p.y - 120,
              x: p.x + (Math.random() * 60 - 30)
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="fixed pointer-events-none z-50 text-xl"
            style={{ left: 0, top: 0 }}
          >
            {p.char}
          </motion.div>
        ))}
      </main>

      {/* FOOTER ROMANTIC BANNER DEDICATED TO SUHANA */}
      <footer className="relative z-20 w-full py-3.5 px-4 text-center backdrop-blur-md bg-black/40 border-t border-white/10">
        <p className="font-serif text-sm sm:text-base text-cream/90 italic">
          "Every single word here beats in eternal rhythm for you, Suhana. — Rahat"
        </p>
        <div className="flex items-center justify-center gap-3 mt-1 text-[11px] text-white/40 font-serif uppercase tracking-wider">
          <span>✨ 100 Infinite Declarations</span>
          <span>•</span>
          <span>💖 Pure 3D Kinetic Motion</span>
          <span>•</span>
          <span>∞ Infinity Love from Rahat</span>
        </div>
      </footer>
    </div>
  );
}
