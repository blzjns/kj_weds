import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { initParticles } from '../../particles.js';
import type { Canvas } from '@/types/misc.js';

interface TimeState {
  days?: string;
  hours?: string;
  mins?: string;
  done: boolean;
}

function useCountdown(targetDate: number) {
  const [time, setTime] = useState<TimeState>({ days: '--', hours: '--', mins: '--', done: false });

  useEffect(() => {
    function update() {
      const diff = targetDate - Date.now();
      if (diff <= 0) { setTime({ done: true }); return; }
      setTime({
        days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        done: false,
      });
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

export default function WelcomePage() {
  const canvasRef = useRef<Canvas>(null);
  const countdown = useCountdown(new Date('2026-08-21T15:00:00').getTime());

  useEffect(() => {
    if (!canvasRef.current) return;
    const particles = initParticles(canvasRef.current, { count: 30, span: 7 });

    gsap.fromTo('.gsap-fade', { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: 'power2.out', delay: 0.2 });
    gsap.fromTo('.name-line', { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.18, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo('.gsap-card', { opacity: 0, scale: 0.92, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.6 });

    return () => particles?.stop();
  }, []);

  return (
    <section id="page-welcome" className="page active">
      <canvas id="hero-canvas" ref={canvasRef} />

      <div className="hero-content">
        <p className="eyebrow gsap-fade">The Wedding of</p>
        <h1 className="hero-names gsap-slide">
          <span className="name-line">Karolina</span>
          <em className="name-amp">&amp;</em>
          <span className="name-line">Jonas</span>
        </h1>
        <p className="hero-date gsap-fade">August 21 · 2026 · Krakow, Poland</p>
        <div className="hero-divider gsap-fade">— ✦ —</div>
      </div>

      <div className="welcome-cards">
        <div className="info-card gsap-card">
          <div className="card-icon">🕐</div>
          <h3>Ceremony</h3>
          <p>3:00 PM<br />The Garden Pavilion</p>
        </div>
        <div className="info-card gsap-card">
          <div className="card-icon">🥂</div>
          <h3>Reception</h3>
          <p>6:00 PM<br />The Grand Ballroom</p>
        </div>
        <div className="info-card gsap-card">
          <div className="card-icon">🌹</div>
          <h3>Dress Code</h3>
          <p>Black Tie<br />Optional</p>
        </div>
      </div>

      <div className="welcome-letter gsap-fade">
        <p className="letter-text">
          "We are so grateful you've made the journey to celebrate this day with us. Your presence means
          the world to us both — welcome to our story."
        </p>
        <p className="letter-sig">— Karolina &amp; Jonas</p>
      </div>

      <div className="countdown-block gsap-fade">
        <p className="countdown-label">Days Until We Say I Do</p>
        <div id="countdown" className="countdown-digits">
          {countdown.done ? (
            <div className="digit-group"><span>🎉</span><small>Today!</small></div>
          ) : (
            <>
              <div className="digit-group"><span>{countdown.days}</span><small>days</small></div>
              <div className="digit-group"><span>{countdown.hours}</span><small>hours</small></div>
              <div className="digit-group"><span>{countdown.mins}</span><small>mins</small></div>
            </>
          )}
        </div>
      </div>

      <div className="map-block gsap-fade">
        <h3 className="section-heading">Find Us</h3>
        <div className="map-card">
          <div className="map-address">
            <p><strong>Ashford Estate</strong></p>
            <p>14 Blossom Lane<br />Kent, TN25 4HJ<br />United Kingdom</p>
            <a
              href="https://maps.google.com?q=Ashford+Estate+Kent"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </div>

      <div className="page-spacer" />
    </section>
  );
}
