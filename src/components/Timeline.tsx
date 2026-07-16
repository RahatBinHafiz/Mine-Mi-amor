import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { timelineData } from '../data';
import { TimelineItem } from '../types';
import { getAnniversaryOrdinal, getCurrentAnniversaryDateStr } from '../lib/anniversary';

export default function Timeline() {
  const [syncedImages, setSyncedImages] = useState<{ [key: number]: string }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Sync timeline images from Firebase with a robust local storage cache fallback
  useEffect(() => {
    // 1. Instantly load initial cache from localStorage
    try {
      const localData = localStorage.getItem('timeline_images_local');
      if (localData) {
        setSyncedImages(JSON.parse(localData));
      }
    } catch (err) {
      console.warn('Failed to load local timeline images:', err);
    }

    // 2. Sync from Firebase Realtime Database
    const timelineImagesRef = ref(db, 'timeline_images');
    let unsubscribe = () => {};
    try {
      unsubscribe = onValue(timelineImagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSyncedImages((prev) => {
            const updated = { ...prev, ...data };
            try {
              localStorage.setItem('timeline_images_local', JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed to save to localStorage:', e);
            }
            return updated;
          });
        }
      }, (error) => {
        console.warn('Firebase timeline read error:', error);
      });
    } catch (e) {
      console.warn('Firebase subscription failed:', e);
    }

    return () => unsubscribe();
  }, []);

  // Convert uploaded image to base64 and save to Firebase Realtime Database (with fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // 1. Immediately save to state and localStorage so the user sees it instantly
        setSyncedImages((prev) => {
          const updated = { ...prev, [slotId]: base64String };
          try {
            localStorage.setItem('timeline_images_local', JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage limit or save failure:', e);
          }
          return updated;
        });

        // 2. Attempt to save under timeline_images/{slotId} in Firebase
        set(ref(db, `timeline_images/${slotId}`), base64String)
          .then(() => {
            console.log(`Timeline slot ${slotId} image updated in Firebase`);
          })
          .catch((err) => {
            console.error('Firebase save failed:', err);
            // Dispatch a custom event to let the app know of the permission issue
            window.dispatchEvent(new CustomEvent('firebase-save-error', {
              detail: {
                type: 'Timeline Image',
                error: err.message || 'Permission Denied'
              }
            }));
          });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  const triggerFileInput = (slotId: number) => {
    fileInputRefs.current[slotId]?.click();
  };

  return (
    <section id="timeline" className="relative flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center z-10">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 0.8, y: 0 }}
          viewport={{ once: true }}
          className="section-label mb-2"
        >
          ✦ Memory Lane ✦
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="anniv-heading mb-16"
        >
          Our Story So Far
        </motion.h2>

        <div className="relative w-full">
          {/* Central Vertical Line (Desktop only) */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] transform -translate-x-1/2 z-0"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--pink), var(--gold), var(--purple), transparent)',
            }}
          />

          {/* Left Vertical Line (Mobile only) */}
          <div
            className="block md:hidden absolute left-4 top-0 bottom-0 w-[1px] z-0"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--pink), var(--purple), transparent)',
            }}
          />

          {/* Timeline Items Grid */}
          <div className="flex flex-col gap-16 md:gap-24 w-full relative z-10">
            {timelineData.map((item: TimelineItem, index: number) => {
              const isEven = index % 2 === 0;
              const displayImage = syncedImages[item.id] || item.defaultImage;

              // Dynamically update the 5th item (index 4 / id 4) to be the dynamic monthly anniversary
              const displayDate = item.id === 4 ? getCurrentAnniversaryDateStr() : item.date;
              const displayTitle = item.id === 4 ? `Our ${getAnniversaryOrdinal()} Month Anniversary 💕` : item.title;

              return (
                <div key={item.id} className="relative w-full">
                  {/* Mobile Layout (Standard Stacked) */}
                  <div className="md:hidden flex flex-col pl-10 relative">
                    {/* Timeline Dot for Mobile */}
                    <div
                      className="absolute left-2 top-2 w-[12px] h-[12px] rounded-full z-10 animate-pulse"
                      style={{
                        background: isEven ? 'var(--pink)' : 'var(--gold)',
                        boxShadow: isEven ? '0 0 10px var(--gp)' : '0 0 10px var(--gg)',
                      }}
                    />

                    {/* Mobile Polaroid Image Slot */}
                    <div className="relative w-full aspect-video max-h-[220px] rounded-xl overflow-hidden mb-4 border border-[rgba(255,110,180,0.25)] group">
                      <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => triggerFileInput(item.id)}
                          className="px-4 py-2 bg-pink-500/80 hover:bg-pink-600 rounded-full text-xs font-semibold flex items-center gap-2 text-white border border-pink-300/30"
                        >
                          <Camera className="w-3.5 h-3.5" /> Change Photo
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[item.id] = el;
                        }}
                        onChange={(e) => handleImageUpload(e, item.id)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Mobile Note Glass Card */}
                    <div className="glass-card w-full">
                      <div className="timeline-date">{displayDate}</div>
                      <div className="timeline-event">{displayTitle}</div>
                      <div className="timeline-desc">{item.description}</div>
                    </div>
                  </div>

                  {/* Desktop Layout (Symmetrical Alternating Row Pattern) */}
                  <div className="hidden md:flex w-full items-center relative">
                    {/* Timeline Node Center Glow */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-20"
                      style={{
                        background: isEven ? 'var(--pink)' : 'var(--gold)',
                        boxShadow: isEven ? '0 0 15px var(--gp), 0 0 30px var(--gp)' : '0 0 15px var(--gg), 0 0 30px var(--gg)',
                      }}
                    />

                    {isEven ? (
                      /* Row 1, 3, 5: [Pic] [Note] on the left side of the line */
                      <div className="w-1/2 pr-12 flex flex-row items-center justify-end gap-6 text-right">
                        {/* Elegant Polaroid Image (Far Left) */}
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          whileHover={{ scale: 1.05, rotate: -1 }}
                          onClick={() => triggerFileInput(item.id)}
                          className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 cursor-pointer flex-shrink-0 group shadow-lg shadow-pink-500/10"
                          style={{
                            borderColor: 'var(--pink)',
                            boxShadow: '0 0 15px rgba(255, 110, 180, 0.25)',
                          }}
                        >
                          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-300">
                            <Upload className="w-5 h-5 text-pink-300" />
                            <span className="text-[10px] font-sans text-pink-200 tracking-wide uppercase font-medium">Upload Pic</span>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full border border-pink-400/20">
                            <Camera className="w-3.5 h-3.5 text-pink-300" />
                          </div>
                        </motion.div>

                        {/* Note Glass Card (Near Center Line) */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          className="glass-card max-w-sm flex-grow"
                        >
                          <div className="timeline-date font-semibold text-gold tracking-widest mb-1.5">{displayDate}</div>
                          <div className="timeline-event text-lg font-bold text-white italic mb-2">{displayTitle}</div>
                          <div className="timeline-desc text-sm leading-relaxed text-pink-100/70">{item.description}</div>
                        </motion.div>
                      </div>
                    ) : (
                      /* Row 2, 4, 6: [Note] [Pic] on the right side of the line */
                      <div className="w-1/2 ml-auto pl-12 flex flex-row items-center justify-start gap-6 text-left">
                        {/* Note Glass Card (Near Center Line) */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          className="glass-card max-w-sm flex-grow"
                        >
                          <div className="timeline-date font-semibold text-gold tracking-widest mb-1.5">{displayDate}</div>
                          <div className="timeline-event text-lg font-bold text-white italic mb-2">{displayTitle}</div>
                          <div className="timeline-desc text-sm leading-relaxed text-pink-100/70">{item.description}</div>
                        </motion.div>

                        {/* Elegant Polaroid Image (Far Right) */}
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          whileHover={{ scale: 1.05, rotate: 1 }}
                          onClick={() => triggerFileInput(item.id)}
                          className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 cursor-pointer flex-shrink-0 group shadow-lg shadow-yellow-500/10"
                          style={{
                            borderColor: 'var(--gold)',
                            boxShadow: '0 0 15px rgba(255, 215, 0, 0.25)',
                          }}
                        >
                          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-300">
                            <Upload className="w-5 h-5 text-yellow-300" />
                            <span className="text-[10px] font-sans text-yellow-200 tracking-wide uppercase font-medium">Upload Pic</span>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full border border-yellow-400/20">
                            <Camera className="w-3.5 h-3.5 text-yellow-300" />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
