import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, RotateCcw, Sparkles, Flower2, Heart, Volume2, VolumeX } from 'lucide-react';

interface BloomingRosesPageProps {
  onBack: () => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  currentSongTitle: string;
}

export default function BloomingRosesPage({
  onBack,
  musicPlaying,
  onToggleMusic,
  currentSongTitle
}: BloomingRosesPageProps) {
  const [bloomed, setBloomed] = useState(false);
  const [heroLeaving, setHeroLeaving] = useState(false);
  const [showBouquet, setShowBouquet] = useState(false);
  const [showFinalCaption, setShowFinalCaption] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; left: string; top: string; delay: string }[]>([]);
  const [stalksData, setStalksData] = useState<{
    id: number;
    ang: string;
    s: string;
    d: string;
    hue: string;
    sat: string;
    bri: string;
  }[]>([]);

  const TOTAL_FLOWERS = 210;

  // Initialize sparks ambience
  useEffect(() => {
    const items = Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${20 + Math.random() * 70}%`,
      delay: `${(Math.random() * 9).toFixed(2)}s`
    }));
    setSparks(items);

    // Pre-generate bouquet flowers data
    const stalkList = Array.from({ length: TOTAL_FLOWERS - 1 }).map((_, i) => {
      const ang = (Math.random() * 156 - 78).toFixed(1);
      const sc = (0.46 + Math.random() * 0.55).toFixed(2);
      const del = (Math.random() * 2.6).toFixed(2);
      const hue = (Math.random() * 14 - 7).toFixed(0);
      const sat = (0.9 + Math.random() * 0.3).toFixed(2);
      const bri = (0.9 + Math.random() * 0.22).toFixed(2);

      return { id: i, ang, s: sc, d: `${del}s`, hue: `${hue}deg`, sat, bri };
    });
    setStalksData(stalkList);
  }, []);

  const handleHeroBloom = () => {
    if (bloomed) return;
    setBloomed(true);

    // Start bouquet transition after 2.5s
    setTimeout(() => {
      setHeroLeaving(true);
      setTimeout(() => {
        setShowBouquet(true);
        setTimeout(() => {
          setShowFinalCaption(true);
        }, 3200);
      }, 600);
    }, 2400);
  };

  const handleReset = () => {
    setBloomed(false);
    setHeroLeaving(false);
    setShowBouquet(false);
    setShowFinalCaption(false);
  };

  // Stem SVG helper
  const renderStemSVG = () => (
    <svg className="stem-svg" viewBox="0 0 150 380">
      <path className="stem-path" pathLength={1} d="M75,368 C72,296 78,200 75,120" />
      <path className="thorn" d="M73,332 L61,338 L73,340 Z" />
      <path className="thorn" d="M77,280 L91,285 L77,289 Z" />
      <g className="leaf-grp left" transform="translate(75,254)">
        <path className="leaf-blade" d="M0,0 C-19,-14 -42,-10 -53,4 C-44,16 -27,21 -13,17 C-4,14 0,7 0,0 Z" />
        <path className="leaf-vein" d="M-2,2 C-19,0 -36,2 -50,7" />
      </g>
      <g className="leaf-grp" transform="translate(75,294)">
        <path className="leaf-blade" d="M0,0 C19,-14 42,-10 53,4 C44,16 27,21 13,17 C4,14 0,7 0,0 Z" />
        <path className="leaf-vein" d="M2,2 C19,0 36,2 50,7" />
      </g>
    </svg>
  );

  // 3D Flower Head component with outer and inner rotating petals
  const renderHead3D = (delayOffset = '0s') => {
    const OUTN = 8;
    const INN = 5;

    return (
      <div className="head-scene">
        <div className="head-3d">
          <div className="bud-cover" style={{ '--d': delayOffset } as React.CSSProperties} />
          {Array.from({ length: OUTN }).map((_, i) => {
            const ang = (i * (360 / OUTN) + (i % 2 === 0 ? 1 : -1)).toFixed(1);
            const pd = (i * 0.035).toFixed(3);
            return (
              <div key={`out-${i}`} className="petal-spoke" style={{ '--spin': `${ang}deg` } as React.CSSProperties}>
                <div 
                  className="petal outer" 
                  style={{ '--pd': `calc(${delayOffset} + .8s + ${pd}s)` } as React.CSSProperties} 
                />
              </div>
            );
          })}
          {Array.from({ length: INN }).map((_, j) => {
            const ang2 = (j * (360 / INN) + 30 + (j % 2 === 0 ? -1 : 1)).toFixed(1);
            const pd2 = (j * 0.04).toFixed(3);
            return (
              <div key={`inn-${j}`} className="petal-spoke" style={{ '--spin': `${ang2}deg` } as React.CSSProperties}>
                <div 
                  className="petal inner" 
                  style={{ '--pd': `calc(${delayOffset} + 1.15s + ${pd2}s)` } as React.CSSProperties} 
                />
              </div>
            );
          })}
          <div className="stamen" style={{ '--d': delayOffset } as React.CSSProperties} />
        </div>
      </div>
    );
  };

  return (
    <div id="bloom-app-container" className="fixed inset-0 w-full h-full bg-[#0a0710] text-[#f6ead9] overflow-hidden select-none z-50">
      {/* AMBIENT BACKGROUND GRADIENT */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 18%, #1c0f1a 0%, #0a0710 62%), #0a0710'
        }}
      />

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-30 w-full px-4 py-3 flex items-center justify-between backdrop-blur-md bg-black/30 border-b border-[#d9a441]/20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm transition-all hover:scale-105 cursor-pointer text-cream"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif">Back to Universe</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          <Flower2 className="w-4 h-4 text-[#ef4250] animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-serif tracking-widest text-xs uppercase text-[#d9a441]">Ready To Bloom</span>
        </div>

        <div className="flex items-center gap-2">
          {bloomed && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3d0410] hover:bg-[#5c0a1c] border border-[#a3142c] text-xs transition-all hover:scale-105 cursor-pointer text-cream"
              title="Bloom Again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloom Again</span>
            </button>
          )}

          <button
            onClick={onToggleMusic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs transition-all cursor-pointer text-cream"
            title={musicPlaying ? "Pause Music" : "Play Music"}
          >
            {musicPlaying ? <Volume2 className="w-3.5 h-3.5 text-[#d9a441]" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
            <span className="hidden md:inline max-w-[100px] truncate">{currentSongTitle}</span>
          </button>
        </div>
      </header>

      {/* STAGE */}
      <div id="stage" className="relative w-full h-[calc(100vh-56px)] overflow-hidden">
        {/* DRIFTING GOLDEN SPARKS */}
        <div id="ambience">
          {sparks.map(sp => (
            <div
              key={sp.id}
              className="spark"
              style={{
                left: sp.left,
                top: sp.top,
                animationDelay: sp.delay
              }}
            />
          ))}
        </div>

        {/* HERO SECTION WITH TAP-TO-BLOOM BUD */}
        <div 
          id="hero" 
          className={`${heroLeaving ? 'leaving' : ''} ${bloomed ? 'bloomed' : ''}`}
        >
          <div className="relative">
            {!bloomed && <div className="tap-ring" />}
            <button 
              id="heroFlowerBtn" 
              onClick={handleHeroBloom} 
              aria-label="Tap to bloom"
            >
              <div id="heroStalk">
                <div className={`stalk ${bloomed ? 'bloom' : ''}`}>
                  {renderStemSVG()}
                  {renderHead3D('0s')}
                </div>
              </div>
            </button>
          </div>

          <div className="hero-caption">
            <span className="headline">ready to bloom</span>
            <span className="sub">tap the bud</span>
          </div>
        </div>

        {/* FINAL ROMANTIC CAPTION */}
        <div id="finalCaption" className={showFinalCaption ? 'show' : ''}>
          <div className="line1">210 roses, blooming together — just for you, Suhana 💕</div>
          <div className="line2">a whole bouquet of endless love, one tap at a time</div>
          <p className="mt-2 text-xs italic text-[#d9a441]/80 font-serif">
            — Forever in love with you, Rahat
          </p>
        </div>

        {/* 210 ROSES BOUQUET */}
        <div id="bouquetWrap" className={showBouquet ? 'show' : ''}>
          <div className="wrap-paper" />
          <svg className="ribbon" viewBox="0 0 120 70">
            <path 
              d="M60 10 C 40 -5 5 10 15 30 C 22 44 45 38 60 25 C 75 38 98 44 105 30 C 115 10 80 -5 60 10 Z" 
              fill="#7c1f34" 
              stroke="#4a1120" 
              strokeWidth="1.5"
            />
            <circle cx="60" cy="20" r="7" fill="#9c2b45" />
          </svg>

          <div id="bouquet">
            {showBouquet && stalksData.map(st => (
              <div
                key={st.id}
                className="stalk bloom"
                style={{
                  '--ang': `${st.ang}deg`,
                  '--s': st.s,
                  '--d': st.d,
                  '--hue': st.hue,
                  '--sat': st.sat,
                  '--bri': st.bri,
                  transform: `rotate(${st.ang}deg) scale(${st.s})`,
                  filter: `hue-rotate(${st.hue}) saturate(${st.sat}) brightness(${st.bri})`
                } as React.CSSProperties}
              >
                {renderStemSVG()}
                {renderHead3D(st.d)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
