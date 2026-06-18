import { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'halal'];

export default function RsvpPage() {
  const guest = JSON.parse(sessionStorage.getItem('guest') || '{}');

  const [name, setName] = useState(guest.name || '');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [dietary, setDietary] = useState([]);
  const [song, setSong] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState(null); // { text, type }
  const [loading, setLoading] = useState(false);

  function toggleDietary(val) {
    setDietary((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setFeedback({ text: 'Please fill in your name and email.', type: 'error' });
      return;
    }

    setLoading(true);
    const payload = { name, email, attending, guestCount: attending ? guestCount : 0, dietary, song, message };

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback({
        text: attending
          ? `🥂 We're so excited to celebrate with you, ${name.split(' ')[0]}!`
          : `We'll miss you, ${name.split(' ')[0]}. Thank you for letting us know.`,
        type: 'success',
      });
    } catch {
      setFeedback({
        text: attending
          ? `🥂 Wonderful! We're saving your seat, ${name.split(' ')[0]}.`
          : `We'll miss you. Thank you for letting us know.`,
        type: 'success',
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (feedback) {
      gsap.fromTo('.feedback-msg', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
    }
  }, [feedback]);

  return (
    <section id="page-rsvp" className="page active">
      <div className="page-header">
        <p className="eyebrow">Kindly Reply By May 1, 2026</p>
        <h2 className="page-title">Your RSVP</h2>
        <div className="title-ornament">❧</div>
      </div>

      <div id="rsvp-form-wrap">
        <div className="rsvp-form gsap-fade">

          <div className="form-group">
            <label>Your Full Name</label>
            <input type="text" id="rsvp-name" placeholder="As on your invitation" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" id="rsvp-email" placeholder="For updates & details" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Will you be joining us?</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn${attending ? ' active' : ''}`}
                onClick={() => setAttending(true)}
              >Joyfully Accepts</button>
              <button
                className={`toggle-btn${!attending ? ' active' : ''}`}
                onClick={() => setAttending(false)}
              >Regretfully Declines</button>
            </div>
          </div>

          {attending && (
            <div id="rsvp-attending-fields">
              <div className="form-group">
                <label>Number of Guests (including yourself)</label>
                <div className="stepper">
                  <button className="step-btn" id="step-down" onClick={() => setGuestCount((c) => Math.max(1, c - 1))}>−</button>
                  <span id="guest-count-display">{guestCount}</span>
                  <button className="step-btn" id="step-up" onClick={() => setGuestCount((c) => Math.min(6, c + 1))}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label>Dietary Requirements</label>
                <div className="check-group">
                  {DIETARY_OPTIONS.map((opt) => (
                    <label key={opt} className="check-item">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={dietary.includes(opt)}
                        onChange={() => toggleDietary(opt)}
                      />
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Song Request for the Dance Floor</label>
                <input type="text" id="song-request" placeholder="What song gets you dancing?" value={song} onChange={(e) => setSong(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>A message for the couple (optional)</label>
            <textarea id="rsvp-message" placeholder="Share your wishes..." rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <button
            id="rsvp-submit"
            className="btn-gold full-width"
            onClick={handleSubmit}
            disabled={loading || feedback?.type === 'success'}
          >
            {feedback?.type === 'success' ? 'RSVP Sent ✓' : loading ? 'Sending...' : 'Send My RSVP'}
          </button>

          {feedback && (
            <p className={`feedback-msg ${feedback.type}`}>{feedback.text}</p>
          )}
        </div>
      </div>

      <div className="page-spacer" />
    </section>
  );
}
