import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Music, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Mic, 
  X, 
  Sparkles, 
  Gift, 
  Award,
  BookOpen
} from 'lucide-react';
import { ref, push, onChildAdded, onValue, set, remove } from 'firebase/database';
import { db } from './lib/firebase';
import { nicknames, reasonsData } from './data';
import BackgroundCanvas from './components/BackgroundCanvas';
import { getAnniversaryOrdinal } from './lib/anniversary';
import Timeline from './components/Timeline';
import { GalleryPhoto } from './types';
import InfinityLovePage from './components/InfinityLovePage';
import BloomingRosesPage from './components/BloomingRosesPage';

export default function App() {
  // Page routing state
  const [currentPage, setCurrentPage] = useState<'home' | 'infinity-love' | 'blooming-roses'>('home');

  // Intro screen states
  const [showIntro, setShowIntro] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [showIntroSub, setShowIntroSub] = useState(false);

  // Interaction states
  const [petalRain, setPetalRain] = useState(false);
  const [ambientMusic, setAmbientMusic] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Custom cursor position
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState({ x: 0, y: 0 });

  // Love names cycler state
  const [nameIndex, setNameIndex] = useState(0);

  // Counter and countdown values
  const [stats, setStats] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [countdownHtml, setCountdownHtml] = useState('Calculating...');

  // Music Player state
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentSongTitle, setCurrentSongTitle] = useState('Dandelions 🌼');
  const [songProgress, setSongProgress] = useState(0);
  const [songDuration, setSongDuration] = useState('0:00');
  const [songCurrentTime, setSongCurrentTime] = useState('0:00');
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [barHeights, setBarHeights] = useState<number[]>([5, 5, 5, 5, 5]);

  useEffect(() => {
    if (!musicPlaying) {
      setBarHeights([5, 5, 5, 5, 5]);
      return;
    }
    const interval = setInterval(() => {
      setBarHeights(Array.from({ length: 5 }, () => Math.floor(Math.random() * 28) + 8));
    }, 120);
    return () => clearInterval(interval);
  }, [musicPlaying]);

  // Photos Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Envelope state
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  // Voice player state
  const [voiceNoteSrc, setVoiceNoteSrc] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceVisActive, setVoiceVisActive] = useState(false);

  // Little Surprise popup state
  const [surpriseOpen, setSurpriseOpen] = useState(false);

  // Date celebrations
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showAnnivLoveModal, setShowAnnivLoveModal] = useState(false);

  // Firebase Error notification state
  const [firebaseErrorMsg, setFirebaseErrorMsg] = useState<{ type: string; error: string } | null>(null);

  // Listen for Firebase save errors
  useEffect(() => {
    const handleFirebaseError = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; error: string }>;
      if (customEvent.detail) {
        setFirebaseErrorMsg(customEvent.detail);
      }
    };
    window.addEventListener('firebase-save-error', handleFirebaseError);
    return () => window.removeEventListener('firebase-save-error', handleFirebaseError);
  }, []);

  // Nickname rain items
  const [annivRainItems, setAnnivRainItems] = useState<{ id: number; text: string; style: any }[]>([]);

  // Refs for audio tags and file inputs
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const galleryUploadRef = useRef<HTMLInputElement | null>(null);
  const audioUploadRef = useRef<HTMLInputElement | null>(null);
  const voiceUploadRef = useRef<HTMLInputElement | null>(null);

  // Ambient oscillator synth nodes (from their original code)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      // Create trailing effect
      setTimeout(() => {
        setCursorTrail({ x: e.clientX, y: e.clientY });
      }, 80);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intro Typing screen sequence
  useEffect(() => {
    const fullText = "Hi Sweetheart Suhi,\nready to get started? ❤️";
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowIntroSub(true);
        }, 800);
      }
    }, 90);

    // Fade out intro after 5 seconds and launch the anniversary surprise modal
    const timeout = setTimeout(() => {
      setShowIntro(false);
      launchAnniversarySurprise();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Anniversary date & Birthday detection on boot
  useEffect(() => {
    const today = new Date();
    // Feb 21st
    if (today.getMonth() === 1 && today.getDate() === 21) {
      setShowBirthdayModal(true);
    }
    // 17th of the month (Our Monthly Anniversary!)
    if (today.getDate() === 17) {
      setShowMonthlyModal(true);
      launchAnniversarySurprise();
    }
  }, []);

  // Cycling love names state
  useEffect(() => {
    const timer = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % nicknames.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Counter loop calculations (Relationship started: 17 March 2026)
  useEffect(() => {
    const START_DATE = new Date('2026-03-17T00:00:00');

    const updateStats = () => {
      const now = new Date();
      const diff = now.getTime() - START_DATE.getTime();

      if (diff < 0) {
        setStats({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCountdownHtml('Our journey begins 17 March 2026 💕');
        return;
      }

      const sec = Math.floor((diff / 1000) % 60);
      const min = Math.floor((diff / 1000 / 60) % 60);
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      // Calendar-exact months calculation (Turns 5 on 17 August 2026)
      let elapsedMonths = (now.getFullYear() - 2026) * 12 + (now.getMonth() - 2);
      if (now.getDate() < 17) {
        elapsedMonths -= 1;
      }
      const years = Math.floor(Math.max(0, elapsedMonths) / 12);
      const months = Math.max(0, elapsedMonths) % 12;

      setStats({
        years,
        months,
        days: totalDays,
        hours: hrs,
        minutes: min,
        seconds: sec
      });

      // Countdown to 5th Month Anniversary on 17 August 2026
      const target5thAnniv = new Date('2026-08-17T00:00:00');
      const dDiff = target5thAnniv.getTime() - now.getTime();

      if (dDiff > 0) {
        const dDays = Math.floor(dDiff / (1000 * 60 * 60 * 24));
        const dHrs = Math.floor((dDiff / (1000 * 60 * 60)) % 24);
        const dMins = Math.floor((dDiff / (1000 * 60)) % 60);
        const dSecs = Math.floor((dDiff / 1000) % 60);

        setCountdownHtml(
          `<span class="text-2xl md:text-3xl font-extrabold tracking-tight" style="color:var(--pink); text-shadow: 0 0 10px var(--gp)">${dDays}d ${dHrs}h ${dMins}m ${dSecs}s</span><br/><span class="text-xs opacity-80 text-gold tracking-wider font-sans">until our 5th Month Anniversary on 17 August! 💍✨</span>`
        );
      } else {
        setCountdownHtml(
          `<span class="text-2xl md:text-3xl font-extrabold tracking-tight" style="color:var(--pink); text-shadow: 0 0 10px var(--gp)">Happy 5th Month Anniversary! 💖💍</span><br/><span class="text-xs opacity-90 text-gold tracking-wider font-sans">Celebrating 5 Months of Beautiful Love Today! ✨</span>`
        );
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Firebase Photo Gallery and Voice Note syncing with robust Local Storage fallbacks
  useEffect(() => {
    // 1. Instantly load initial cache from localStorage so the UI is super fast
    try {
      const localPhotos = localStorage.getItem('gallery_photos_local');
      if (localPhotos) {
        setGalleryPhotos(JSON.parse(localPhotos));
      }
      const localVoice = localStorage.getItem('shared_voice_note_local');
      if (localVoice) {
        setVoiceNoteSrc(localVoice);
      }
    } catch (err) {
      console.warn('Failed to load local gallery/voice caches:', err);
    }

    // 2. Synchronize with Firebase Realtime Database
    const photosRef = ref(db, 'gallery_photos');
    let unsubscribePhotos = () => {};
    try {
      unsubscribePhotos = onValue(photosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsedList: GalleryPhoto[] = Object.keys(data).map((key) => ({
            id: key,
            stringData: data[key].stringData
          }));
          setGalleryPhotos(parsedList);
          try {
            localStorage.setItem('gallery_photos_local', JSON.stringify(parsedList));
          } catch (e) {
            console.warn('LocalStorage limit reached for photo cache', e);
          }
        } else {
          setGalleryPhotos([]);
          localStorage.removeItem('gallery_photos_local');
        }
      }, (error) => {
        console.warn('Firebase photo sync error:', error);
      });
    } catch (e) {
      console.warn('Firebase photo sub error:', e);
    }

    const voiceRef = ref(db, 'shared_voice_note');
    let unsubscribeVoice = () => {};
    try {
      unsubscribeVoice = onValue(voiceRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.stringData) {
          setVoiceNoteSrc(data.stringData);
          try {
            localStorage.setItem('shared_voice_note_local', data.stringData);
          } catch (e) {
            console.warn('LocalStorage save failed for voice cache', e);
          }
        }
      }, (error) => {
        console.warn('Firebase voice sync error:', error);
      });
    } catch (e) {
      console.warn('Firebase voice sub error:', e);
    }

    return () => {
      unsubscribePhotos();
      unsubscribeVoice();
    };
  }, []);

  // 📸 Convert Photo Upload File to base64, save locally instantly, and sync to Firebase Realtime Database
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64Data = await convertToBase64(file);
        
        // Optimistic UI: Generate a local temporary ID
        const tempId = `local_${Date.now()}_${i}`;
        const tempPhoto: GalleryPhoto = { id: tempId, stringData: base64Data };

        // Prepend new image to state and save to local storage immediately
        setGalleryPhotos((prev) => {
          const updated = [tempPhoto, ...prev];
          try {
            localStorage.setItem('gallery_photos_local', JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage upload limit reached:', e);
          }
          return updated;
        });

        // Now push to Firebase Realtime Database
        push(ref(db, 'gallery_photos'), { stringData: base64Data })
          .then(() => {
            console.log("Photo synced to Firebase successfully");
          })
          .catch((err) => {
            console.error('Firebase save failed for photo:', err);
            // Dispatch error notification
            window.dispatchEvent(new CustomEvent('firebase-save-error', {
              detail: {
                type: 'Gallery Photo',
                error: err.message || 'Permission Denied'
              }
            }));
          });
      } catch (err) {
        console.error('Error processing photo upload:', err);
      }
    }
  };

  // 📸 Delete photo from Firebase / Local Storage
  const handleDeletePhoto = (photoId: string) => {
    // 1. Remove from React state and Local Storage immediately
    setGalleryPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      try {
        localStorage.setItem('gallery_photos_local', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage update failed during deletion', e);
      }
      return updated;
    });

    // 2. If it is a persistent Firebase key (not a temp local key), delete from Firebase DB
    if (!photoId.startsWith('local_')) {
      remove(ref(db, `gallery_photos/${photoId}`))
        .then(() => {
          console.log("Photo deleted from Firebase successfully");
        })
        .catch((err) => {
          console.error('Firebase deletion failed:', err);
        });
    }
  };

  // 🎙️ Upload custom voice note Base64 to Firebase (with instant local fallback)
  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Audio = await convertToBase64(file);

        // Optimistic UI: update state and local storage immediately
        setVoiceNoteSrc(base64Audio);
        try {
          localStorage.setItem('shared_voice_note_local', base64Audio);
        } catch (e) {
          console.warn('Failed to save local voice note:', e);
        }

        // Write to Firebase
        set(ref(db, 'shared_voice_note'), { stringData: base64Audio })
          .then(() => {
            console.log("Voice note synced to Firebase successfully");
          })
          .catch((err) => {
            console.error('Firebase save failed for voice note:', err);
            window.dispatchEvent(new CustomEvent('firebase-save-error', {
              detail: {
                type: 'Voice Note',
                error: err.message || 'Permission Denied'
              }
            }));
          });
      } catch (err) {
        console.error('Error processing voice upload:', err);
      }
    }
  };

  // Helpers to convert files to Base64 data urls
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Audio elements event binding (music and voice players)
  useEffect(() => {
    const mainAudio = mainAudioRef.current;
    if (!mainAudio) return;

    const handleTimeUpdate = () => {
      const cur = mainAudio.currentTime;
      const dur = mainAudio.duration;
      if (dur) {
        setSongProgress((cur / dur) * 100);
        setSongCurrentTime(formatTime(cur));
        setSongDuration(formatTime(dur));
      }
    };

    const handleEnded = () => {
      setMusicPlaying(false);
    };

    const handleError = () => {
      console.warn("Main audio element loading error:", mainAudio.error);
      setMusicPlaying(false);
      // If there is an active src and it fails, let's set a descriptive error
      if (mainAudio.src) {
        if (mainAudio.src.includes("raw.githubusercontent.com")) {
          setPlayerError("GitHub Raw link CORS/MIME policy restriction. Try uploading the MP3 from your device or selecting a reliable preloaded track!");
        } else {
          setPlayerError("Failed to stream this audio track. Please choose a reliable track or upload an MP3 from your device.");
        }
      }
    };

    mainAudio.addEventListener('timeupdate', handleTimeUpdate);
    mainAudio.addEventListener('ended', handleEnded);
    mainAudio.addEventListener('error', handleError);

    return () => {
      mainAudio.removeEventListener('timeupdate', handleTimeUpdate);
      mainAudio.removeEventListener('ended', handleEnded);
      mainAudio.removeEventListener('error', handleError);
    };
  }, []);

  // Play audio file selection
  const handleAudioFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && mainAudioRef.current) {
      setPlayerError(null);
      const blobUrl = URL.createObjectURL(file);
      mainAudioRef.current.src = blobUrl;
      setCurrentSongTitle(file.name.replace(/\.[^/.]+$/, ""));
      playMusic();
    }
  };

  const playMusic = () => {
    if (mainAudioRef.current) {
      setPlayerError(null);
      const playPromise = mainAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setMusicPlaying(true);
          })
          .catch((err) => {
            console.error("Audio play promise failed:", err);
            setMusicPlaying(false);
            if (err.name === "NotAllowedError") {
              setPlayerError("Playback blocked by browser autoplay policy. Please click the play button again.");
            } else if (err.name === "NotSupportedError" || mainAudioRef.current?.error) {
              setPlayerError("CORS or MIME-type restriction on this link. Try selecting a different track or uploading an MP3!");
            } else {
              setPlayerError("Unable to play this track. Please upload an MP3 or select a reliable track below.");
            }
          });
      } else {
        setMusicPlaying(true);
      }
    }
  };

  const pauseMusic = () => {
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  const handleLoadTrackUrl = (url: string, title: string) => {
    if (mainAudioRef.current) {
      setPlayerError(null);
      mainAudioRef.current.src = url;
      setCurrentSongTitle(title);
      // Wait for source to attach
      setTimeout(() => {
        playMusic();
      }, 150);
    }
  };

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const mainAudio = mainAudioRef.current;
    if (mainAudio && mainAudio.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      mainAudio.currentTime = percent * mainAudio.duration;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  // 🎙️ Voice Player Playback Toggle
  const toggleVoicePlayback = () => {
    const voiceAudio = voiceAudioRef.current;
    if (!voiceAudio || !voiceNoteSrc) return;

    if (voicePlaying) {
      voiceAudio.pause();
      setVoicePlaying(false);
      setVoiceVisActive(false);
    } else {
      voiceAudio.play();
      setVoicePlaying(true);
      setVoiceVisActive(true);
    }
  };

  useEffect(() => {
    const voiceAudio = voiceAudioRef.current;
    if (!voiceAudio) return;

    const handleEnded = () => {
      setVoicePlaying(false);
      setVoiceVisActive(false);
    };
    voiceAudio.addEventListener('ended', handleEnded);
    return () => voiceAudio.removeEventListener('ended', handleEnded);
  }, []);

  // Ambient Synth Oscillators (using Web Audio API)
  const toggleAmbientSynth = () => {
    if (!audioCtxRef.current) {
      // Lazy initialization on first click
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new AudioCtxClass();
      const gn = ac.createGain();
      gn.gain.value = 0;
      gn.connect(ac.destination);

      const oscConfigs = [
        [185, 0.08],
        [220, 0.06],
        [277, 0.05],
        [370, 0.04],
        [440, 0.03]
      ];

      oscConfigs.forEach(([freq, volume]) => {
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;

        const g = ac.createGain();
        g.gain.value = volume;

        const lfo = ac.createOscillator();
        lfo.frequency.value = 0.25 + Math.random() * 0.2;

        const lg = ac.createGain();
        lg.gain.value = volume * 0.25;

        lfo.connect(lg);
        lg.connect(g.gain);

        lfo.start();
        o.connect(g);
        g.connect(gn);
        o.start();
      });

      audioCtxRef.current = ac;
      gainNodeRef.current = gn;
    }

    const ac = audioCtxRef.current;
    const gn = gainNodeRef.current;

    if (ac && gn) {
      const nextState = !ambientMusic;
      setAmbientMusic(nextState);
      gn.gain.cancelScheduledValues(ac.currentTime);
      gn.gain.setTargetAtTime(nextState ? 0.55 : 0, ac.currentTime, 1.5);
    }
  };

  // Launch Anniversary falling nicknames and giant flower emojis
  const launchAnniversarySurprise = () => {
    setShowAnnivLoveModal(true);

    const nicknamesList = [
      "Suhinila", "Sweetheart", "Kolija", "Heartbeat", "Sona", "Jaan", 
      "Jaanu", "Darling", "My Girl", "Future Mother of My Kids 💍", "My Oxygen", 
      "My Food 🧛", "My One & Only Lovee", "The Thief of My Heart", "My Universe"
    ];
    const colorChoices = ['#ff6eb4', '#ffd700', '#d4a0ff', '#ff2d78', '#ffffff', '#5eead4'];
    const emojis = ["💖", "💕", "🌹", "✨", "🌸", "💐", "💫", "🤍", "💛", "😍", "🥹", "❤️"];

    const newItems = Array.from({ length: 40 }, (_, index) => {
      const isFlower = Math.random() < 0.35;
      const text = isFlower 
        ? ["🌹", "🌸", "💐", "🤍", "💛", "🌺", "🌷"][Math.floor(Math.random() * 7)]
        : `${emojis[Math.floor(Math.random() * emojis.length)]} ${nicknamesList[Math.floor(Math.random() * nicknamesList.length)]}`;

      return {
        id: index + Date.now(),
        text,
        style: {
          left: `${Math.random() * 85 + 5}vw`,
          fontSize: isFlower ? `${Math.random() * 1.5 + 2.0}rem` : `${Math.random() * 0.5 + 1.2}rem`,
          color: isFlower ? undefined : colorChoices[Math.floor(Math.random() * colorChoices.length)],
          animationDuration: `${Math.random() * 6 + 7}s`,
          animationDelay: `${Math.random() * 5}s`
        }
      };
    });

    setAnnivRainItems(newItems);
  };

  if (currentPage === 'infinity-love') {
    return (
      <InfinityLovePage
        onBack={() => setCurrentPage('home')}
        musicPlaying={musicPlaying}
        onToggleMusic={musicPlaying ? pauseMusic : playMusic}
        currentSongTitle={currentSongTitle}
      />
    );
  }

  if (currentPage === 'blooming-roses') {
    return (
      <BloomingRosesPage
        onBack={() => setCurrentPage('home')}
        musicPlaying={musicPlaying}
        onToggleMusic={musicPlaying ? pauseMusic : playMusic}
        currentSongTitle={currentSongTitle}
      />
    );
  }

  return (
    <div className="min-h-screen text-cream relative selection:bg-pink-500/30 selection:text-white">
      {/* BACKGROUND EFFECTS */}
      <BackgroundCanvas petalRain={petalRain} />

      {/* CUSTOM CURSORS (Desktop only) */}
      <div 
        className="hidden md:block custom-cursor" 
        style={{ left: cursorPos.x, top: cursorPos.y }} 
      />
      <div 
        className="hidden md:block custom-cursor-trail" 
        style={{ left: cursorTrail.x, top: cursorTrail.y }} 
      />

      {/* FLOAT AURORA BACKGROUND ACCENTS */}
      <div id="aurora-bg">
        <div className="aurora-blob w-[50vw] h-[50vw] left-[-10vw] top-[-10vw] bg-radial-gradient" style={{ background: 'radial-gradient(circle, var(--pink), transparent 70%)', animationDuration: '16s' }} />
        <div className="aurora-blob w-[45vw] h-[45vw] right-[-12vw] top-[20vh] bg-radial-gradient" style={{ background: 'radial-gradient(circle, var(--purple), transparent 70%)', animationDuration: '20s' }} />
        <div className="aurora-blob w-[40vw] h-[40vw] left-[15vw] bottom-[-15vw] bg-radial-gradient" style={{ background: 'radial-gradient(circle, var(--aqua), transparent 70%)', animationDuration: '22s' }} />
        <div className="aurora-blob w-[35vw] h-[35vw] right-[5vw] bottom-[-10vw] bg-radial-gradient" style={{ background: 'radial-gradient(circle, var(--gold), transparent 70%)', animationDuration: '18s' }} />
      </div>

      {/* 3D FLOATING ENTRANCE FLOWERS */}
      <div id="css-flower-engine">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="css-flower"
            style={{
              left: `${Math.random() * 100}vw`,
              fontSize: `${Math.random() * 1.5 + 0.8}rem`,
              animationDuration: `${Math.random() * 8 + 6}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.5,
            }}
          >
            {['🤍', '💛', '🌸', '🌹'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <button 
        onClick={() => setCurrentPage('infinity-love')} 
        className="fab animate-pulse" 
        id="suhana-love-fab" 
        title="Open 'Infinity Love from Rahat' Page"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 45, 120, 0.4) 0%, rgba(255, 110, 180, 0.2) 100%)', 
          border: '1.5px solid rgba(255, 110, 180, 0.8)',
          boxShadow: '0 0 15px rgba(255, 110, 180, 0.4)'
        }}
      >
        <span className="text-base font-bold">∞</span>
      </button>

      <button 
        onClick={() => setCurrentPage('blooming-roses')} 
        className="fab" 
        id="blooming-roses-fab" 
        title="Open 'Ready to Bloom (210 Roses)' Page"
        style={{ 
          background: 'radial-gradient(circle, rgba(163, 20, 44, 0.5) 0%, rgba(200, 26, 53, 0.25) 100%)', 
          border: '1.5px solid rgba(239, 66, 80, 0.8)',
          boxShadow: '0 0 15px rgba(239, 66, 80, 0.4)'
        }}
      >
        <span className="text-base">🌹</span>
      </button>

      <button 
        onClick={toggleAmbientSynth} 
        className="fab" 
        id="music-btn" 
        title="Toggle Ambient Soundtrack"
      >
        {ambientMusic ? '🔇' : '🎵'}
      </button>

      <button 
        onClick={() => setPetalRain(!petalRain)} 
        className="fab" 
        id="petal-btn" 
        title="Toggle Flower Rain"
        style={{ background: petalRain ? 'rgba(155,93,229,.4)' : 'rgba(155,93,229,.12)' }}
      >
        🌸
      </button>

      <button 
        onClick={launchAnniversarySurprise} 
        className="fab" 
        id="anniv-surprise-fab" 
        title="Love Milestones & Names Surprise"
      >
        💕
      </button>

      {/* GORGEOUS INTRO SCREEN */}
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            id="intro"
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 1.2 }}
            onClick={() => {
              setShowIntro(false);
              launchAnniversarySurprise();
              playMusic();
            }}
            className="cursor-pointer"
          >
            <div className="intro-text flex flex-col items-center justify-center opacity-100 pointer-events-auto">
              <h1 className="whitespace-pre-line text-center">{typingText}</h1>
              {showIntroSub && (
                <motion.h2 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  Welcome to our little universe ✨
                  <br />
                  <span className="text-[11px] font-sans font-normal opacity-50 tracking-widest uppercase mt-4 block">
                    Click anywhere to enter
                  </span>
                </motion.h2>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER NAVIGATION */}
      <nav id="main-nav" className="opacity-100 transition-opacity duration-700">
        <a href="#hero">Home</a>
        <a href="#bouquet">Bouquet</a>
        <a href="#names">Names</a>
        <a href="#music">Music</a>
        <a href="#anniversary">Us</a>
        <a href="#gallery">Gallery</a>
        <a href="#letter">Letter</a>
        <a href="#voice">Voice</a>
        <a href="#promise-ring">Promise</a>
        <a href="#reasons">Why You</a>
        <a href="#timeline">Story</a>
        <button
          onClick={() => setCurrentPage('infinity-love')}
          className="nav-link"
          id="nav-infinity-love"
          title="Open 'Infinity Love from Rahat' Page"
        >
          Infinity Love from Rahat
        </button>
        <button
          onClick={() => setCurrentPage('blooming-roses')}
          className="nav-link"
          id="nav-blooming-roses"
          title="Open 'Ready to Bloom (210 Roses)' Page"
        >
          Ready to Bloom 🌹
        </button>
      </nav>

      {/* MAIN CONTENT CONTAINERS */}

      {/* HERO SECTION */}
      <section id="hero" className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="hero-tagline"
        >
          — A magical universe made only for you —
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="hero-title my-4"
        >
          Our Love Story
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="hero-sub"
        >
          Where every heartbeat tells your name...
        </motion.p>
        
        {/* SPECIAL INVITATION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            onClick={() => setCurrentPage('infinity-love')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/25 via-rose-500/35 to-purple-500/25 border border-pink/50 text-pink hover:text-white hover:border-pink shadow-lg shadow-pink/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium tracking-wide cursor-pointer"
          >
            <span className="text-base font-bold">∞</span>
            <span>Infinity Love from Rahat</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            onClick={() => setCurrentPage('blooming-roses')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-900/40 via-red-700/40 to-amber-900/40 border border-[#ef4250]/60 text-[#f96a5f] hover:text-white hover:border-[#ef4250] shadow-lg shadow-red-900/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium tracking-wide cursor-pointer"
          >
            <span className="text-base">🌹</span>
            <span>Ready to Bloom (210 Roses)</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </motion.button>
        </div>

        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2, duration: 1 }}
          className="scroll-hint mt-14 cursor-pointer"
          onClick={() => {
            document.getElementById('bouquet')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          ↓ scroll to explore ↓
        </motion.span>
      </section>

      <div className="section-divider" />

      {/* INTERACTIVE VECTOR BOUQUET */}
      <section id="bouquet" className="py-20 flex flex-col items-center justify-center text-center">
        <p className="section-label mb-2">Just For You 🌹</p>

        <div id="bouquet-svg-wrap" className="w-[80vw] max-w-[310px] my-6">
          <svg viewBox="0 0 340 430" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <defs>
              <linearGradient id="ribG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c2185b"/>
                <stop offset="50%" stopColor="#ff6eb4"/>
                <stop offset="100%" stopColor="#c2185b"/>
              </linearGradient>
              <linearGradient id="stemG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2e7d32"/>
                <stop offset="100%" stopColor="#66bb6a"/>
              </linearGradient>
              <radialGradient id="rRed" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#ff6b8a"/>
                <stop offset="55%" stopColor="#e53935"/>
                <stop offset="100%" stopColor="#b71c1c"/>
              </radialGradient>
              <radialGradient id="rPink" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#ffd6e7"/>
                <stop offset="55%" stopColor="#ff80b3"/>
                <stop offset="100%" stopColor="#e91e8c"/>
              </radialGradient>
              <radialGradient id="rDeep" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#ff9ec8"/>
                <stop offset="55%" stopColor="#ff2d78"/>
                <stop offset="100%" stopColor="#880e4f"/>
              </radialGradient>
              <radialGradient id="rLav" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#e8c8ff"/>
                <stop offset="55%" stopColor="#9b5de5"/>
                <stop offset="100%" stopColor="#4a0080"/>
              </radialGradient>
              <radialGradient id="rWht" cx="50%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#fff"/>
                <stop offset="55%" stopColor="#fce4ec"/>
                <stop offset="100%" stopColor="#f8bbd0"/>
              </radialGradient>
              <radialGradient id="rBaby" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff"/>
                <stop offset="100%" stopColor="#f5d0e0"/>
              </radialGradient>
              <linearGradient id="leafG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#388e3c"/>
                <stop offset="100%" stopColor="#81c784"/>
              </linearGradient>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="sglow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <g stroke="url(#stemG)" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M170 408 Q168 335 170 282"/>
              <path d="M170 408 Q145 365 128 302"/>
              <path d="M170 408 Q193 360 207 298"/>
              <path d="M170 408 Q118 362 98 298"/>
              <path d="M170 408 Q222 358 235 293"/>
              <path d="M170 408 Q135 358 116 288"/>
              <path d="M170 408 Q207 353 220 285"/>
              <path d="M170 408 Q112 358 88 288"/>
              <path d="M170 408 Q228 352 248 280"/>
            </g>

            <g fill="url(#leafG)" opacity=".88">
              <ellipse cx="138" cy="352" rx="14" ry="6.5" transform="rotate(-46 138 352)"/>
              <ellipse cx="202" cy="348" rx="14" ry="6.5" transform="rotate(46 202 348)"/>
              <ellipse cx="110" cy="340" rx="12" ry="5.5" transform="rotate(-52 110 340)"/>
              <ellipse cx="230" cy="335" rx="12" ry="5.5" transform="rotate(52 230 335)"/>
              <ellipse cx="156" cy="324" rx="10" ry="5" transform="rotate(-28 156 324)"/>
              <ellipse cx="186" cy="320" rx="10" ry="5" transform="rotate(28 186 320)"/>
            </g>

            <g fill="url(#rBaby)" filter="url(#sglow)" opacity=".88">
              <circle cx="88" cy="278" r="6"/><circle cx="80" cy="270" r="4.5"/><circle cx="96" cy="272" r="5"/>
              <circle cx="84" cy="260" r="4"/><circle cx="92" cy="264" r="3.5"/><circle cx="76" cy="277" r="3.5"/>
              <circle cx="248" cy="270" r="6"/><circle cx="256" cy="262" r="4.5"/><circle cx="240" cy="265" r="5"/>
              <circle cx="252" cy="254" r="4"/><circle cx="260" cy="272" r="3.5"/><circle cx="242" cy="277" r="3.5"/>
            </g>

            <g transform="translate(116,270)" filter="url(#sglow)">
              <ellipse cx="0" cy="8" rx="22" ry="30" fill="url(#rLav)" opacity=".83"/>
              <ellipse cx="-12" cy="0" rx="16" ry="23" fill="url(#rLav)" opacity=".73" transform="rotate(-30)"/>
              <ellipse cx="12" cy="0" rx="16" ry="23" fill="url(#rLav)" opacity=".73" transform="rotate(30)"/>
              <ellipse cx="0" cy="-5" rx="13" ry="19" fill="url(#rLav)" opacity=".83"/>
              <ellipse cx="0" cy="2" rx="7" ry="10" fill="#4a0080"/>
            </g>
            <g transform="translate(220,266)" filter="url(#sglow)">
              <ellipse cx="0" cy="8" rx="22" ry="30" fill="url(#rDeep)" opacity=".83"/>
              <ellipse cx="-12" cy="0" rx="16" ry="23" fill="url(#rDeep)" opacity=".73" transform="rotate(-30)"/>
              <ellipse cx="12" cy="0" rx="16" ry="23" fill="url(#rDeep)" opacity=".73" transform="rotate(30)"/>
              <ellipse cx="0" cy="-5" rx="13" ry="19" fill="url(#rDeep)" opacity=".83"/>
              <ellipse cx="0" cy="2" rx="7" ry="10" fill="#880e4f"/>
            </g>

            <g transform="translate(98,280)" filter="url(#sglow)">
              <ellipse cx="0" cy="10" rx="28" ry="37" fill="url(#rWht)" opacity=".9"/>
              <ellipse cx="-16" cy="2" rx="20" ry="28" fill="url(#rWht)" opacity=".8" transform="rotate(-36)"/>
              <ellipse cx="16" cy="2" rx="20" ry="28" fill="url(#rWht)" opacity=".8" transform="rotate(36)"/>
              <ellipse cx="0" cy="-8" rx="17" ry="24" fill="url(#rWht)"/>
              <ellipse cx="-8" cy="5" rx="12" ry="17" fill="url(#rWht)" opacity=".9" transform="rotate(-16)"/>
              <ellipse cx="8" cy="5" rx="12" ry="17" fill="url(#rWht)" opacity=".9" transform="rotate(16)"/>
              <ellipse cx="0" cy="3" rx="9" ry="12" fill="#fce4ec"/>
              <ellipse cx="0" cy="5" rx="5" ry="7" fill="#f8bbd0"/>
            </g>
            <g transform="translate(235,274)" filter="url(#sglow)">
              <ellipse cx="0" cy="10" rx="28" ry="37" fill="url(#rPink)" opacity=".9"/>
              <ellipse cx="-16" cy="2" rx="20" ry="28" fill="url(#rPink)" opacity=".8" transform="rotate(-36)"/>
              <ellipse cx="16" cy="2" rx="20" ry="28" fill="url(#rPink)" opacity=".8" transform="rotate(36)"/>
              <ellipse cx="0" cy="-8" rx="17" ry="24" fill="url(#rPink)"/>
              <ellipse cx="-8" cy="5" rx="12" ry="17" fill="url(#rPink)" opacity=".9" transform="rotate(-16)"/>
              <ellipse cx="8" cy="5" rx="12" ry="17" fill="url(#rPink)" opacity=".9" transform="rotate(16)"/>
              <ellipse cx="0" cy="3" rx="9" ry="12" fill="#e91e8c"/>
              <ellipse cx="0" cy="5" rx="5.5" ry="8" fill="#c2185b"/>
            </g>

            <g transform="translate(128,260)" filter="url(#glow)">
              <ellipse cx="0" cy="12" rx="34" ry="43" fill="url(#rRed)" opacity=".9"/>
              <ellipse cx="-20" cy="2" rx="24" ry="33" fill="url(#rRed)" opacity=".8" transform="rotate(-40)"/>
              <ellipse cx="20" cy="2" rx="24" ry="33" fill="url(#rRed)" opacity=".8" transform="rotate(40)"/>
              <ellipse cx="0" cy="-10" rx="20" ry="28" fill="url(#rRed)"/>
              <ellipse cx="-10" cy="5" rx="14" ry="20" fill="url(#rRed)" opacity=".9" transform="rotate(-20)"/>
              <ellipse cx="10" cy="5" rx="14" ry="20" fill="url(#rRed)" opacity=".9" transform="rotate(20)"/>
              <ellipse cx="0" cy="3" rx="11" ry="16" fill="#b71c1c"/>
              <ellipse cx="0" cy="5" rx="5.5" ry="8" fill="#7f0000"/>
            </g>
            <g transform="translate(208,254)" filter="url(#glow)">
              <ellipse cx="0" cy="12" rx="34" ry="43" fill="url(#rPink)" opacity=".9"/>
              <ellipse cx="-20" cy="2" rx="24" ry="33" fill="url(#rPink)" opacity=".8" transform="rotate(-40)"/>
              <ellipse cx="20" cy="2" rx="24" ry="33" fill="url(#rPink)" opacity=".8" transform="rotate(40)"/>
              <ellipse cx="0" cy="-10" rx="20" ry="28" fill="url(#rPink)"/>
              <ellipse cx="-10" cy="5" rx="14" ry="20" fill="url(#rPink)" opacity=".9" transform="rotate(-20)"/>
              <ellipse cx="10" cy="5" rx="14" ry="20" fill="url(#rPink)" opacity=".9" transform="rotate(20)"/>
              <ellipse cx="0" cy="3" rx="11" ry="16" fill="#e91e8c"/>
              <ellipse cx="0" cy="5" rx="5.5" ry="8" fill="#880e4f"/>
            </g>

            <g transform="translate(170,236)" filter="url(#glow)">
              <ellipse cx="0" cy="15" rx="41" ry="52" fill="url(#rRed)" opacity=".88"/>
              <ellipse cx="-26" cy="5" rx="29" ry="39" fill="url(#rRed)" opacity=".78" transform="rotate(-45)"/>
              <ellipse cx="26" cy="5" rx="29" ry="39" fill="url(#rRed)" opacity=".78" transform="rotate(45)"/>
              <ellipse cx="0" cy="-14" rx="26" ry="37" fill="url(#rRed)" opacity=".85"/>
              <ellipse cx="-14" cy="-2" rx="20" ry="30" fill="url(#rRed)" opacity=".82" transform="rotate(-20)"/>
              <ellipse cx="14" cy="-2" rx="20" ry="30" fill="url(#rRed)" opacity=".82" transform="rotate(20)"/>
              <ellipse cx="0" cy="5" rx="16" ry="22" fill="#c62828"/>
              <ellipse cx="-8" cy="3" rx="10" ry="16" fill="#b71c1c" transform="rotate(-15)"/>
              <ellipse cx="8" cy="3" rx="10" ry="16" fill="#b71c1c" transform="rotate(15)"/>
              <ellipse cx="0" cy="6" rx="8" ry="11" fill="#7f0000"/>
              <circle cx="0" cy="4" r="4" fill="#ffd700" opacity=".6"/>
              <circle cx="0" cy="4" r="2" fill="#fff" opacity=".8"/>
            </g>

            <path d="M98 398 Q120 374 170 368 Q220 374 242 398 L252 428 H88 Z" fill="rgba(255,182,213,.32)" stroke="rgba(255,110,180,.45)" strokeWidth="1"/>
            <path d="M98 398 Q82 374 88 348 Q113 364 133 378 Q118 386 98 398Z" fill="rgba(255,105,180,.25)" stroke="rgba(255,110,180,.35)" strokeWidth=".8"/>
            <path d="M242 398 Q258 374 252 348 Q227 364 207 378 Q222 386 242 398Z" fill="rgba(255,105,180,.25)" stroke="rgba(255,110,180,.35)" strokeWidth=".8"/>
            <path d="M153 378 Q138 364 146 354 Q157 357 163 370Z" fill="url(#ribG)" opacity=".9"/>
            <path d="M187 378 Q202 364 194 354 Q183 357 177 370Z" fill="url(#ribG)" opacity=".9"/>
            <circle cx="170" cy="374" r="7" fill="url(#ribG)"/>
            <circle cx="170" cy="374" r="3" fill="#fff" opacity=".55"/>

            <g fill="#ffd700" opacity=".8">
              <polygon points="0,-8 2,-3 7,-3 3,0 5,6 0,3 -5,6 -3,0 -7,-3 -2,-3" transform="translate(52,200) scale(.9)"/>
              <polygon points="0,-8 2,-3 7,-3 3,0 5,6 0,3 -5,6 -3,0 -7,-3 -2,-3" transform="translate(292,192) scale(.7)"/>
              <polygon points="0,-8 2,-3 7,-3 3,0 5,6 0,3 -5,6 -3,0 -7,-3 -2,-3" transform="translate(170,145) scale(.65)"/>
            </g>
          </svg>
        </div>

        <p className="bouquet-caption">This bouquet is forever yours 🌹💕</p>

        <button
          onClick={() => setCurrentPage('blooming-roses')}
          className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-950/60 via-rose-900/70 to-red-950/60 border border-rose-500/50 text-[#f6ead9] hover:text-white hover:border-rose-400 shadow-lg shadow-red-950/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-serif tracking-wide cursor-pointer"
        >
          <span className="text-base">🌹</span>
          <span>Watch 210 Roses Bloom in 3D</span>
          <span className="text-xs text-[#d9a441]">✨</span>
        </button>
      </section>

      <div className="section-divider" />

      {/* LOVE NAMES CYCLER */}
      <section id="names" className="py-20 flex flex-col items-center justify-center text-center">
        <p className="section-label">You Are My...</p>
        <div className="names-display my-12 w-full max-w-lg">
          <div className="nfr" />
          <div className="nfr w-[310px] h-[310px] border-dashed" style={{ animation: 'spinReverse 28s linear infinite', borderColor: 'rgba(255,215,0,.15)' }} />
          <div id="love-name" className="text-pink">
            {nicknames[nameIndex]} ❤️
          </div>
        </div>
        <p className="italic text-xs text-white/40 max-w-xs leading-relaxed">
          — changing every moment, just like my love for you —
        </p>
      </section>

      <div className="section-divider" />

      {/* SOUNDTRACK PLAYER */}
      <section id="music" className="py-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <h2 className="anniv-heading text-center mb-8">Our Soundtrack 🎵</h2>
          
          <div className="glass-card player-wrapper">
            <div className={`album-art ${musicPlaying ? 'playing' : ''}`} id="album-art">
              <div className="visualizer" id="visualizer">
                {barHeights.map((h, i) => (
                  <div 
                    key={i} 
                    className="bar" 
                    style={{ 
                      height: `${h}px`,
                      transition: 'height 0.12s ease' 
                    }} 
                  />
                ))}
              </div>
            </div>

            <div className="song-title my-4 line-clamp-1">{currentSongTitle}</div>
            
            <div className="progress-container px-2">
              <span>{songCurrentTime}</span>
              <div onClick={handleProgressSeek} className="progress-bar" id="progress-bar">
                <div className="progress-fill" style={{ width: `${songProgress}%` }} />
              </div>
              <span>{songDuration}</span>
            </div>

            <div className="controls my-4">
              <button 
                className="ctrl-btn hover:bg-white/20 transition-all duration-200" 
                onClick={() => { if (mainAudioRef.current) mainAudioRef.current.currentTime -= 10; }}
                title="Backward 10s"
              >
                ⏮
              </button>
              <button 
                className="ctrl-btn play-btn hover:scale-105 transition-all duration-200" 
                onClick={musicPlaying ? pauseMusic : playMusic}
                title={musicPlaying ? "Pause" : "Play"}
              >
                {musicPlaying ? <Pause className="w-6 h-6 fill-white stroke-none" /> : <Play className="w-6 h-6 fill-white stroke-none ml-1" />}
              </button>
              <button 
                className="ctrl-btn hover:bg-white/20 transition-all duration-200" 
                onClick={() => { if (mainAudioRef.current) mainAudioRef.current.currentTime += 10; }}
                title="Forward 10s"
              >
                ⏭
              </button>
            </div>

            {/* ERROR ALERT */}
            {playerError && (
              <div className="w-full text-xs text-rose bg-rose/10 border border-rose/30 rounded-xl p-3 my-2 text-center animate-pulse leading-relaxed">
                ⚠️ {playerError}
              </div>
            )}

            {/* PRESETS TRACKS SELECTOR */}
            <div className="w-full mt-4 text-left">
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-medium">Select Soundtrack</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleLoadTrackUrl('https://raw.githubusercontent.com/sharmapratik21/Dandelions/master/Dandelions.mp3', 'Dandelions 🌼 (GitHub)')}
                  className={`w-full py-2.5 px-4 text-sm rounded-xl text-left border transition-all duration-300 flex items-center justify-between ${
                    mainAudioRef.current?.src?.includes('Dandelions.mp3') 
                      ? 'bg-pink/20 border-pink text-cream shadow-md shadow-pink/10' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">🌼 Dandelions (Ruth B cover)</span>
                  <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase">Raw Stream</span>
                </button>

                <button
                  onClick={() => handleLoadTrackUrl('https://assets.mixkit.co/music/preview/mixkit-tender-love-155.mp3', 'Tender Love 💖')}
                  className={`w-full py-2.5 px-4 text-sm rounded-xl text-left border transition-all duration-300 flex items-center justify-between ${
                    mainAudioRef.current?.src?.includes('tender-love') 
                      ? 'bg-pink/20 border-pink text-cream shadow-md shadow-pink/10' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">💖 Tender Love (Mixkit Romance)</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase">Reliable Stream</span>
                </button>

                <button
                  onClick={() => handleLoadTrackUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Acoustic Daydream 🎸')}
                  className={`w-full py-2.5 px-4 text-sm rounded-xl text-left border transition-all duration-300 flex items-center justify-between ${
                    mainAudioRef.current?.src?.includes('SoundHelix-Song-1') 
                      ? 'bg-pink/20 border-pink text-cream shadow-md shadow-pink/10' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">🎸 Acoustic Daydream (Instrumental)</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase">Reliable Stream</span>
                </button>
              </div>
            </div>

            {/* CUSTOM URL INPUT */}
            <div className="w-full mt-4 text-left">
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">Or Paste Direct MP3 URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/song.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-cream placeholder-white/30 focus:outline-none focus:border-pink/50 transition-all duration-200"
                />
                <button
                  onClick={() => {
                    if (customUrl.trim()) {
                      handleLoadTrackUrl(customUrl.trim(), "Custom Link 🔗");
                    }
                  }}
                  className="px-4 py-2 bg-pink/20 border border-pink/40 hover:bg-pink/35 text-pink text-xs font-semibold rounded-xl transition-all duration-200"
                >
                  Load
                </button>
              </div>
            </div>

            {/* DEVICE FILE UPLOAD */}
            <div className="w-full mt-5 pt-4 border-t border-white/5 flex flex-col items-center gap-2">
              <span className="text-xs text-white/40 mb-1">Have your own Ruth B "Dandelions.mp3" file?</span>
              <label className="file-upload inline-block py-2 px-5 hover:scale-102 transition-transform duration-200">
                Upload MP3 From Device 💻
                <input 
                  type="file" 
                  ref={audioUploadRef} 
                  onChange={handleAudioFileSelected} 
                  accept="audio/*" 
                />
              </label>
              <span className="text-[10px] text-white/30 text-center italic mt-0.5">
                (Highly recommended: Local uploads skip loading delays & bypass CORS policies entirely!)
              </span>
            </div>

            <audio ref={mainAudioRef} id="main-audio" src="https://raw.githubusercontent.com/sharmapratik21/Dandelions/master/Dandelions.mp3" loop />
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* RELATIONSHIP ANNIVERSARY STATISTICS */}
      <section id="anniversary" className="py-20 flex flex-col items-center justify-center text-center">
        <h2 className="anniv-heading mb-8">Happy {getAnniversaryOrdinal()} Month Anniversary 💕</h2>
        
        <div className="glass-card countdown-card border border-gold shadow-lg shadow-gold/5 max-w-lg mb-8 mx-4">
          <p className="text-sm md:text-base italic leading-relaxed text-cream/90">
            "5 wonderful months of pure joy, deep understanding, and timeless love. Every day with you feels like a beautiful dream come true."
          </p>
        </div>

        <div className="stats-grid px-4 max-w-2xl">
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.years}</div>
            <div className="stat-label">Years</div>
          </div>
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.months}</div>
            <div className="stat-label">Months</div>
          </div>
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.days}</div>
            <div className="stat-label">Days</div>
          </div>
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.hours}</div>
            <div className="stat-label">Hours</div>
          </div>
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.minutes}</div>
            <div className="stat-label">Minutes</div>
          </div>
          <div className="glass-card stat-box">
            <div className="stat-num">{stats.seconds}</div>
            <div className="stat-label">Seconds</div>
          </div>
        </div>

        <div className="glass-card countdown-card mt-8 mx-4 max-w-md w-full">
          <p className="countdown-title">💝 Countdown to Our 5th Month Anniversary</p>
          <div id="countdown-display" dangerouslySetInnerHTML={{ __html: countdownHtml }} />
        </div>
      </section>

      <div className="section-divider" />

      {/* SYNCD PHOTO GALLERY */}
      <section id="gallery" className="py-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl px-4 flex flex-col items-center">
          <h2 className="anniv-heading text-center mb-4">Our Memories 📸</h2>
          
          <button 
            onClick={() => galleryUploadRef.current?.click()} 
            className="file-upload inline-block self-center px-6 py-2.5 mb-8 text-xs font-semibold"
          >
            Add Photos
          </button>
          <input 
            type="file" 
            ref={galleryUploadRef} 
            onChange={handlePhotoUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />

          {galleryPhotos.length === 0 ? (
            <div className="text-center py-12 px-6 border border-dashed border-pink-400/20 rounded-2xl w-full max-w-md">
              <ImageIcon className="w-8 h-8 text-pink-300 mx-auto mb-3 opacity-60" />
              <p className="text-sm text-pink-200/50 italic">No shared photos uploaded yet. Tap above to add sweet moments! ✨</p>
            </div>
          ) : (
            <div className="masonry-grid w-full">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="gallery-item group">
                  <img 
                    src={photo.stringData} 
                    alt="Love memory" 
                    onClick={() => setSelectedPhoto(photo.stringData)} 
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }} 
                    className="delete-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-pink-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY FULL SCREEN LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            id="img-modal" 
            className="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="close-modal" onClick={() => setSelectedPhoto(null)}>✖</button>
            <img id="full-img" src={selectedPhoto} alt="Fullscreen Memory" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-divider" />

      {/* INTERACTIVE LOVE LETTER ENVELOPE */}
      <section id="letter" className="py-20 flex flex-col items-center justify-center">
        <h2 className="anniv-heading text-center mb-4">For You 💌</h2>
        <div 
          onClick={() => setEnvelopeOpen(!envelopeOpen)} 
          className={`envelope-wrapper ${envelopeOpen ? 'open' : ''}`} 
          id="envelope"
        >
          <div className="envelope">
            <div className="envelope-flap" />
            <div className="envelope-paper font-sans">
              <p className="leading-relaxed">
                My Dearest Suhi,<br/><br/>
                From the moment you walked into my life, everything changed. The world became softer, warmer, more beautiful — simply because you were in it.<br/><br/>
                You are my calm when the world is chaos.<br/><br/>
                Forever yours. 💕
              </p>
            </div>
            <div className="envelope-front" />
            <div className="envelope-seal">♡</div>
          </div>
        </div>
        <p className="instruction-text mt-4">Tap to open sealed letter</p>
      </section>

      <div className="section-divider" />

      {/* SYNCD VOICE NOTE PLAYER */}
      <section id="voice" className="py-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-md px-4">
          <h2 className="anniv-heading text-center mb-8">Hear My Heart 🎙️</h2>
          <div className="glass-card player-wrapper border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <div className="song-title text-purple-300 font-medium">A special message from my heart to yours ❤️</div>
            
            <div className="visualizer my-6" id="voice-vis">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bar" 
                  style={{ 
                    background: 'var(--lavender)',
                    height: voiceVisActive ? `${Math.random() * 20 + 5}px` : '5px',
                    transition: 'height 0.15s ease'
                  }} 
                />
              ))}
            </div>

            <div className="controls">
              <button 
                className="ctrl-btn play-btn" 
                onClick={toggleVoicePlayback}
                style={{ background: 'rgba(155, 93, 229, 0.2)', borderColor: 'var(--purple)' }}
              >
                {voicePlaying ? <Pause className="w-5 h-5 text-purple-300 fill-purple-300 stroke-none" /> : <Play className="w-5 h-5 text-purple-300 fill-purple-300 stroke-none ml-1" />}
              </button>
            </div>

            <label className="file-upload inline-block mt-4" style={{ borderColor: 'var(--purple)', color: 'var(--lavender)', background: 'rgba(155, 93, 229, 0.1)' }}>
              Upload Voice Note
              <input 
                type="file" 
                ref={voiceUploadRef} 
                onChange={handleVoiceUpload} 
                accept="audio/*" 
              />
            </label>
            <audio ref={voiceAudioRef} src={voiceNoteSrc || undefined} id="voice-audio" />
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* PROMISE RING SECTION */}
      <section id="promise-ring" className="py-20 flex flex-col items-center justify-center text-center px-4">
        <h2 className="anniv-heading mb-8">Our Promise 💍</h2>
        <div className="ring-scene">
          <div className="ring-wrapper">
            <div className="ring-band" />
            <div className="ring-diamond" />
          </div>
        </div>
        <p className="ring-text mt-8">
          "My Promise:<br/>
          To choose you,<br/>every day,<br/>in every lifetime."
        </p>
      </section>

      <div className="section-divider" />

      {/* WHY I LOVE YOU SECTION */}
      <section id="reasons" className="py-20 flex flex-col items-center justify-center px-4">
        <h2 className="anniv-heading text-center mb-8">Why I Love You</h2>

        <div className="glass-card personality-feature mb-8">
          <p className="personality-label">✦ Above Everything Else ✦</p>
          <span className="reason-icon">🌟</span>
          <div className="reason-title mb-3">Your Personality</div>
          <div className="reason-text">
            Out of everything in this world — your personality is what I love most.<br/>
            The way you carry yourself, the warmth you bring to every conversation,
            the realness and depth that makes you so undeniably <em>you</em>.<br/>
            You don't just have a beautiful soul — you have the most beautiful <em>way of being</em>
            I have ever encountered. Every layer I discover makes me fall even deeper. 💛
          </div>
        </div>

        <div className="reasons-grid">
          {reasonsData.map((reason) => (
            <div key={reason.id} className="glass-card reason-card">
              <span className="reason-icon">{reason.icon}</span>
              <div className="reason-title">{reason.title}</div>
              <div className="reason-text">{reason.description}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* UPGRADED CENTERED VERTICAL TIMELINE */}
      <Timeline />

      <div className="section-divider" />

      {/* SURPRISE REVEAL SCREEN */}
      <section id="surprise" className="py-20 flex flex-col items-center justify-center text-center px-4">
        <h2 className="anniv-heading mb-6">A Little Surprise 🎁</h2>
        <button 
          id="surprise-btn" 
          onClick={() => setSurpriseOpen(!surpriseOpen)}
        >
          Tap to open your surprise 🌸
        </button>
        <div className={`surprise-popup glass-card mt-8 ${surpriseOpen ? 'show' : ''}`} id="surprise-popup">
          <div className="surprise-popup-text font-serif italic text-pink-100">
            You just made the universe smile. 🌟<br/><br/>
            Do you know what the rarest thing in existence is?<br/>
            It's <em>you.</em> 💕<br/><br/>
            There is no one — no one — who could ever replace you in my world.<br/>
            You are my answered prayer, my greatest adventure,<br/>
            my most treasured blessing.<br/><br/>
            I love you. More than roses love rain.<br/>
            More than stars love the night sky.<br/>
            More than forever can even hold. ❤️
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ENDING SECTION */}
      <section id="ending" className="py-24 flex flex-col items-center justify-center text-center px-4">
        <p className="ending-text italic font-serif leading-relaxed mb-6">
          "You are my universe, my peace, my happiness, my everything ❤️"
        </p>
        <p className="ending-sub">Forever yours...</p>
        <div className="heart-final my-6">❤️</div>
        <p className="italic text-xs text-white/30 tracking-widest uppercase">
          — made with every piece of my heart, only for you —
        </p>
      </section>

      {/* BIRTHDAY GREETINGS POPUP MODAL */}
      <AnimatePresence>
        {showBirthdayModal && (
          <motion.div 
            id="birthday-modal" 
            className="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bday-text">Happy Birthday<br/>My Love 🎂❤️</div>
            <div className="heart-final">🎉</div>
            <p className="mt-5 text-cream text-lg italic">May your day be as beautiful as your soul.</p>
            <button 
              className="file-upload mt-8 text-base px-8 py-3" 
              onClick={() => {
                setShowBirthdayModal(false);
                playMusic();
              }}
            >
              Enter Our Universe ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5TH MONTH ANNIVERSARY CELEBRATION MODAL */}
      <AnimatePresence>
        {showMonthlyModal && (
          <motion.div 
            id="monthly-anniv-modal" 
            className="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="anniv-blast-text">Happy {getAnniversaryOrdinal()} Month Anniversary<br/>my sweetheart suhi 💕</div>
            <p className="mt-5 text-cream text-lg italic">Celebrating 5 incredible months of endless love, memories, and happiness with you.</p>
            <button 
              className="file-upload mt-8 text-base px-8 py-3 relative z-10" 
              onClick={() => {
                setShowMonthlyModal(false);
                playMusic();
              }}
            >
              Enter Our Universe ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPECIAL ANNIVERSARY LOVE SURPRISE OVERLAY MODAL */}
      <AnimatePresence>
        {showAnnivLoveModal && (
          <motion.div 
            id="anniversary-love-modal" 
            className="show relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Synced particles loop */}
            <div id="anniv-love-particles" className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {annivRainItems.map((item) => (
                <div
                  key={item.id}
                  className={item.style.color ? 'nickname-fall' : 'big-flower'}
                  style={item.style}
                >
                  {item.text}
                </div>
              ))}
            </div>

            <div className="anniv-love-content relative z-20">
              <div className="anniv-love-heading">Happy {getAnniversaryOrdinal()} Month Anniversary<br/>My Suhinila 💕</div>
              <p className="anniv-love-sub leading-relaxed">
                Celebrating 5 beautiful months together — every moment with you is my greatest gift.
              </p>
              <button 
                className="file-upload mt-8 text-base px-8 py-3 relative z-30" 
                onClick={() => {
                  setShowAnnivLoveModal(false);
                  playMusic();
                }}
              >
                Enter Our Universe ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIREBASE CONNECTION ASSISTANT MODAL (RULES GUIDE) */}
      <AnimatePresence>
        {firebaseErrorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100000] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0e020a] border-2 border-pink-500/40 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative font-sans"
            >
              <button
                onClick={() => setFirebaseErrorMsg(null)}
                className="absolute top-4 right-4 text-cream/60 hover:text-pink-400 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-serif text-pink-300">Saved Locally! 💖</h3>
              </div>

              <p className="text-sm text-pink-100/90 leading-relaxed mb-4">
                Your beautiful upload (<strong>{firebaseErrorMsg.type}</strong>) was <strong>safely saved in this browser</strong> and is fully visible to you!
              </p>
              
              <p className="text-xs text-cream/70 leading-relaxed mb-6">
                However, Firebase returned a <span className="text-rose-400 font-mono font-bold">PERMISSION_DENIED</span> error. To synchronize your pictures instantly with Suhi's device, you simply need to configure your database rules.
              </p>

              <div className="bg-[#1a0815] border border-pink-500/20 rounded-xl p-4 mb-6">
                <span className="text-xs font-mono text-pink-300 block mb-2 font-bold uppercase tracking-wider">How to Fix in 1 Minute:</span>
                <ol className="text-xs text-cream/80 list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-pink-400 underline hover:text-pink-300">Firebase Console</a></li>
                  <li>Open your project: <strong className="text-white">our-universe-8e0a6</strong></li>
                  <li>Click <strong className="text-pink-300">Realtime Database</strong> on the left sidebar</li>
                  <li>Click the <strong className="text-pink-300">Rules</strong> tab at the top</li>
                  <li>Paste the following configuration and click <strong className="text-white">Publish</strong>:</li>
                </ol>

                <pre className="bg-[#050002]/80 text-[11px] font-mono p-3 rounded-lg mt-3 overflow-x-auto text-pink-200 border border-pink-500/10">
{`{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}`}
                </pre>
              </div>

              <div className="flex gap-3 justify-end">
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium text-xs px-4 py-2.5 rounded-full transition shadow-lg text-center"
                >
                  Open Firebase Console 🚀
                </a>
                <button
                  onClick={() => setFirebaseErrorMsg(null)}
                  className="border border-cream/20 hover:bg-cream/5 text-cream text-xs px-4 py-2.5 rounded-full transition"
                >
                  Continue Offline 🌸
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
