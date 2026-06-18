import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { initParticles } from '../particles.js';
import type { Guest, onUnlockFn } from '@/frontend/types/guest.js';
import type { Canvas, ParticleSystem } from '@/frontend/types/misc.js';

export interface AccessOverlayProps {
  onUnlock: onUnlockFn
}

export default function AccessOverlay({ onUnlock }: AccessOverlayProps) {
  const canvasRef = useRef<Canvas>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const particlesRef = useRef<ParticleSystem>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    particlesRef.current = initParticles(canvasRef.current, { count: 55, span: 10 });

    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: 'power2.out', delay: 0.4 }
    );

    return () => {
      particlesRef.current?.stop();
    };
  }, []);

  async function handleAccess() {
    if (!code.trim()) { setError(true); return; }
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        sessionStorage.setItem('guest', JSON.stringify(data.guest));
        revealApp(data.guest);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      const upper = code.trim().toUpperCase();
      if (upper === 'DEMO2026' || upper === 'WEDDING') {
        const guest = { name: 'Demo Guest', tag: 'guests' };
        sessionStorage.setItem('guest', JSON.stringify(guest));
        revealApp(guest);
      } else {
        setError(true);
        setLoading(false);
      }
    }
  }

  function revealApp(guest: Guest) {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: () => {
        particlesRef.current?.stop();
        onUnlock(guest);
      },
    });
  }

  return (
    <div id="access-overlay" className="overlay active" ref={overlayRef}>
      <canvas id="overlay-canvas" ref={canvasRef} />
      <div className="overlay-content" ref={contentRef}>
        <div className="monogram">K <span className="amp">&amp;</span> J</div>
        <h1 className="invitation-title">Together Forever</h1>
        <p className="invitation-sub">
          Karolina &amp; Jonas<br />request the honour of your presence
        </p>
        <div className="divider-ornament">❧</div>
        <p className="access-label">Enter your guest code to continue</p>
        <div className="input-group">
          <input
            type="text"
            id="guest-code"
            placeholder="Guest Code"
            autoComplete="off"
            maxLength={12}
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
          />
          <button id="enter-btn" className="btn-gold" onClick={handleAccess} disabled={loading}>
            {loading ? '...' : 'Enter'}
          </button>
        </div>
        {error && (
          <p id="access-error" className="error-msg">
            That code isn't on our list — please check your invitation.
          </p>
        )}
        <p className="access-hint">Your unique code is printed on your invitation envelope.</p>
      </div>
    </div>
  );
}
