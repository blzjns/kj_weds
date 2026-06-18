import { useEffect, useRef } from 'react';

const EVENTS = [
  { time: '2:00 PM', emoji: '🌿', title: 'Guest Arrival', desc: 'Welcome drinks & canapés in the Orangery. Meet the wedding party.', location: 'The Orangery', highlight: false },
  { time: '3:00 PM', emoji: '💍', title: 'Wedding Ceremony', desc: 'Karolina and Jonas exchange their vows in the sunlit Garden Pavilion.', location: 'Garden Pavilion', highlight: true },
  { time: '4:00 PM', emoji: '📸', title: 'Photography & Cocktail Hour', desc: 'Explore the estate grounds while we capture our first moments together.', location: 'Estate Grounds', highlight: false },
  { time: '6:00 PM', emoji: '🍽️', title: 'Wedding Breakfast', desc: 'A three-course dinner by award-winning chef Hugo Delacroix. Please find your seat.', location: 'Grand Ballroom', highlight: false },
  { time: '8:00 PM', emoji: '🥂', title: 'Speeches & Toasts', desc: 'Heartfelt words from those closest to the couple.', location: 'Grand Ballroom', highlight: false },
  { time: '9:00 PM', emoji: '💃', title: 'First Dance & Evening Reception', desc: 'The dance floor opens. Live music by The Ashford Quartet until midnight.', location: 'Grand Ballroom', highlight: true },
  { time: '12:00 AM', emoji: '🌙', title: 'Farewell & Safe Travels', desc: 'Carriages arranged. Thank you for making this night unforgettable.', location: 'Estate Entrance', highlight: false },
];

export default function SchedulePage() {
  const itemsRef = useRef([]);

  useEffect(() => {
    // Stagger timeline items into view
    itemsRef.current.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }, []);

  return (
    <section id="page-schedule" className="page active">
      <div className="page-header">
        <p className="eyebrow">August 21, 2026</p>
        <h2 className="page-title">The Day</h2>
        <div className="title-ornament">❧</div>
      </div>

      <div className="timeline">
        {EVENTS.map((ev, i) => (
          <div
            key={ev.title}
            className="timeline-item"
            ref={(el) => (itemsRef.current[i] = el)}
          >
            <div className="timeline-time">{ev.time}</div>
            <div className="timeline-dot"><span>{ev.emoji}</span></div>
            <div className={`timeline-card${ev.highlight ? ' highlight' : ''}`}>
              <h4>{ev.title}</h4>
              <p>{ev.desc}</p>
              <div className="timeline-location">📍 {ev.location}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="page-spacer" />
    </section>
  );
}
