import { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
  petalRain: boolean;
}

export default function BackgroundCanvas({ petalRain }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let fireflies: Firefly[] = [];
    let petals: Petal[] = [];

    class Star {
      x = 0;
      y = 0;
      rad = 0;
      ph = 0;
      sp = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = Math.random() * (canvas?.height || 600);
        this.rad = Math.random() * 1.4 + 0.3;
        this.ph = Math.random() * Math.PI * 2;
        this.sp = Math.random() * 0.008 + 0.003;
      }

      draw(t: number) {
        if (!ctx) return;
        const a = 0.4 + 0.5 * Math.abs(Math.sin(t * 0.001 * this.sp * 200 + this.ph));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = Math.random() < 0.04 ? '#ffd700' : '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Firefly {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      l = 0;
      ml = 0;
      rd = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = Math.random() * (canvas?.height || 600);
        this.vx = (Math.random() - 0.5) * 0.9;
        this.vy = (Math.random() - 0.5) * 0.9;
        this.l = 0;
        this.ml = Math.random() * 280 + 180;
        this.rd = Math.random() * 2 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.07;
        this.vy += (Math.random() - 0.5) * 0.07;
        this.l++;
        if (
          this.l > this.ml ||
          this.x < 0 ||
          this.x > (canvas?.width || 800) ||
          this.y < 0 ||
          this.y > (canvas?.height || 600)
        ) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        const a = Math.sin((this.l / this.ml) * Math.PI) * 0.75;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#aef';
        ctx.shadowColor = '#7df';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rd, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Petal {
      x = 0;
      y = 0;
      rd = 0;
      vx = 0;
      vy = 0;
      ag = 0;
      sp = 0;
      c = '';
      al = 0;

      constructor(fromTop = false) {
        this.reset(fromTop);
      }

      reset(fromTop = false) {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = fromTop ? -20 : Math.random() * (canvas?.height || 600);
        this.rd = Math.random() * 7 + 3;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = Math.random() * 1.1 + 0.5;
        this.ag = Math.random() * Math.PI * 2;
        this.sp = (Math.random() - 0.5) * 0.038;
        const colors = ['#ffb7d5', '#ff6eb4', '#ffc0cb', '#ffadd2', '#ffe4ec', '#d4a0ff'];
        this.c = colors[Math.floor(Math.random() * colors.length)];
        this.al = Math.random() * 0.5 + 0.25;
      }

      update() {
        this.x += this.vx + Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.3;
        this.y += this.vy;
        this.ag += this.sp;
        if (this.y > (canvas?.height || 600) + 20) {
          this.reset(true);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.al;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ag);
        ctx.fillStyle = this.c;
        ctx.shadowColor = this.c;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.rd, this.rd * 0.44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 150 }, () => new Star());
      fireflies = Array.from({ length: 16 }, () => new Firefly());
      const petalCount = petalRain ? 76 : 26;
      petals = Array.from({ length: petalCount }, () => new Petal());
    };

    resize();
    window.addEventListener('resize', resize);

    const glows = [
      { x: 0.2, y: 0.15, c: 'rgba(255,45,120,.05)' },
      { x: 0.8, y: 0.38, c: 'rgba(155,93,229,.05)' },
      { x: 0.5, y: 0.68, c: 'rgba(255,215,0,.04)' },
    ];

    const loop = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0005';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const at = Date.now() * 0.0003;
      const ag = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.4);
      ag.addColorStop(0, `hsla(${280 + Math.sin(at) * 20},80%,30%,.07)`);
      ag.addColorStop(0.5, `hsla(${340 + Math.sin(at + 1) * 20},90%,35%,.05)`);
      ag.addColorStop(1, `hsla(${200 + Math.sin(at + 2) * 20},70%,30%,.04)`);
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

      glows.forEach((g) => {
        const rg = ctx.createRadialGradient(
          g.x * canvas.width,
          g.y * canvas.height,
          0,
          g.x * canvas.width,
          g.y * canvas.height,
          canvas.width * 0.22
        );
        rg.addColorStop(0, g.c);
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      stars.forEach((s) => s.draw(t));
      fireflies.forEach((f) => {
        f.update();
        f.draw();
      });
      petals.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [petalRain]);

  return <canvas ref={canvasRef} id="main-canvas" className="fixed inset-0 pointer-events-none z-0" />;
}
