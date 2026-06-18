/* ─── Wedding App — app.js ──────────────────────────────────── */
'use strict';

const API = '';  // Same origin — backend serves from /api

/* ════════════════════════════════════════════════════════════════
   THREE.JS  —  Floating rose-petal particles
══════════════════════════════════════════════════════════════════*/

function initParticles(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 5;

  // Petal geometry: rounded quad
  function makePetalGeo() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.25, 0.3, 0.5, 0, 0.7);
    shape.bezierCurveTo(-0.3, 0.5, -0.15, 0.25, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }

  const petalGeo = makePetalGeo();
  const count = opts.count || 40;
  const petals = [];

  const goldColors = [0xc9a96e, 0xe0c48a, 0xd4b57a, 0xb8965e, 0xf0d8a0];

  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: goldColors[Math.floor(Math.random() * goldColors.length)],
      transparent: true,
      opacity: Math.random() * 0.35 + 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(petalGeo, mat);

    const span = opts.span || 8;
    mesh.position.set(
      (Math.random() - 0.5) * span,
      (Math.random() - 0.5) * span,
      (Math.random() - 0.5) * 2
    );
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    const scale = Math.random() * 0.25 + 0.08;
    mesh.scale.setScalar(scale);

    petals.push({
      mesh,
      vy: -(Math.random() * 0.006 + 0.002),
      vx: (Math.random() - 0.5) * 0.003,
      vr: (Math.random() - 0.5) * 0.015,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    });
    scene.add(mesh);
  }

  let raf;
  function resize() {
    const w = canvas.parentElement?.clientWidth || window.innerWidth;
    const h = canvas.parentElement?.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const bound = opts.span ? opts.span / 2 + 0.5 : 4.5;

  function animate() {
    raf = requestAnimationFrame(animate);
    petals.forEach(p => {
      p.wobble += p.wobbleSpeed;
      p.mesh.position.y += p.vy;
      p.mesh.position.x += p.vx + Math.sin(p.wobble) * 0.003;
      p.mesh.rotation.z += p.vr;

      if (p.mesh.position.y < -bound) {
        p.mesh.position.y = bound;
        p.mesh.position.x = (Math.random() - 0.5) * (bound * 2);
      }
      if (Math.abs(p.mesh.position.x) > bound) p.vx *= -1;
    });
    renderer.render(scene, camera);
  }
  animate();

  return { stop: () => { cancelAnimationFrame(raf); renderer.dispose(); } };
}


/* ════════════════════════════════════════════════════════════════
   ACCESS OVERLAY
══════════════════════════════════════════════════════════════════*/

let overlayParticles;

function initOverlay() {
  overlayParticles = initParticles('overlay-canvas', { count: 55, span: 10 });

  // Animate overlay content in
  gsap.fromTo('.overlay-content > *',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: 'power2.out', delay: 0.4 }
  );

  document.getElementById('enter-btn').addEventListener('click', handleAccess);
  document.getElementById('guest-code').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAccess();
    document.getElementById('access-error').classList.add('hidden');
  });
}

async function handleAccess() {
  const code = document.getElementById('guest-code').value.trim();
  const btn = document.getElementById('enter-btn');
  const error = document.getElementById('access-error');

  if (!code) { error.classList.remove('hidden'); return; }

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      sessionStorage.setItem('guest', JSON.stringify(data.guest));
      revealApp();
    } else {
      error.classList.remove('hidden');
      btn.textContent = 'Enter';
      btn.disabled = false;
    }
  } catch (e) {
    // Offline / dev mode: allow demo code
    if (code.toUpperCase() === 'DEMO2026' || code.toUpperCase() === 'WEDDING') {
      sessionStorage.setItem('guest', JSON.stringify({ name: 'Demo Guest', tag: 'guests' }));
      revealApp();
    } else {
      error.classList.remove('hidden');
      btn.textContent = 'Enter';
      btn.disabled = false;
    }
  }
}

function revealApp() {
  const overlay = document.getElementById('access-overlay');
  gsap.to(overlay, {
    opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete: () => {
      overlay.classList.add('hidden');
      if (overlayParticles) overlayParticles.stop();
    }
  });
  document.getElementById('app').classList.remove('hidden');
  initApp();
}


/* ════════════════════════════════════════════════════════════════
   APP INIT
══════════════════════════════════════════════════════════════════*/

let heroParticles;

function initApp() {
  gsap.registerPlugin(ScrollTrigger);

  heroParticles = initParticles('hero-canvas', { count: 30, span: 7 });

  initNav();
  initWelcomePage();
  initRsvpPage();
  initGalleryPage();
  initCountdown();
  activatePage('welcome');
}


/* ════════════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════════════*/

function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activatePage(page);
    });
  });
}

function activatePage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${name}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
    if (name === 'schedule') animateTimeline();
    if (name === 'gallery') loadGallery();
  }
}


/* ════════════════════════════════════════════════════════════════
   WELCOME PAGE
══════════════════════════════════════════════════════════════════*/

function initWelcomePage() {
  gsap.fromTo('.gsap-fade', { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: 'power2.out', delay: 0.2 }
  );
  gsap.fromTo('.name-line', { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1.2, stagger: 0.18, ease: 'expo.out', delay: 0.1 }
  );
  gsap.fromTo('.gsap-card', { opacity: 0, scale: 0.92, y: 16 },
    { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.6 }
  );
}

function initCountdown() {
  const weddingDate = new Date('2026-08-21T15:00:00');
  function update() {
    const now = new Date();
    const diff = weddingDate - now;
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<div class="digit-group"><span>🎉</span><small>Today!</small></div>';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  }
  update();
  setInterval(update, 30000);
}


/* ════════════════════════════════════════════════════════════════
   SCHEDULE TIMELINE
══════════════════════════════════════════════════════════════════*/

function animateTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add('visible');
    }, i * 120);
  });
}


/* ════════════════════════════════════════════════════════════════
   RSVP PAGE
══════════════════════════════════════════════════════════════════*/

let attending = true;
let guestCount = 1;

function initRsvpPage() {
  // Pre-fill name if logged in
  const guest = JSON.parse(sessionStorage.getItem('guest') || '{}');
  if (guest.name) document.getElementById('rsvp-name').value = guest.name;

  // Attendance toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      attending = btn.dataset.val === 'yes';
      const fields = document.getElementById('rsvp-attending-fields');
      if (attending) {
        gsap.fromTo(fields, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: 0.4, ease: 'power2.out' });
        fields.style.display = '';
      } else {
        gsap.to(fields, { opacity: 0, height: 0, duration: 0.3, ease: 'power2.in', onComplete: () => fields.style.display = 'none' });
      }
    });
  });

  // Guest count stepper
  document.getElementById('step-up').addEventListener('click', () => {
    if (guestCount < 6) { guestCount++; document.getElementById('guest-count').textContent = guestCount; }
  });
  document.getElementById('step-down').addEventListener('click', () => {
    if (guestCount > 1) { guestCount--; document.getElementById('guest-count').textContent = guestCount; }
  });

  // Submit
  document.getElementById('rsvp-submit').addEventListener('click', submitRsvp);
}

async function submitRsvp() {
  const name = document.getElementById('rsvp-name').value.trim();
  const email = document.getElementById('rsvp-email').value.trim();
  const message = document.getElementById('rsvp-message').value.trim();
  const song = document.getElementById('song-request')?.value.trim() || '';
  const btn = document.getElementById('rsvp-submit');
  const feedback = document.getElementById('rsvp-feedback');

  if (!name || !email) {
    feedback.textContent = 'Please fill in your name and email.';
    feedback.className = 'feedback-msg error';
    feedback.classList.remove('hidden');
    return;
  }

  const dietary = [...document.querySelectorAll('.check-item input:checked')].map(i => i.value);

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const payload = { name, email, attending, guestCount: attending ? guestCount : 0, dietary, song, message };

  try {
    const res = await fetch(`${API}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      feedback.textContent = attending
        ? `🥂 We're so excited to celebrate with you, ${name.split(' ')[0]}!`
        : `We'll miss you, ${name.split(' ')[0]}. Thank you for letting us know.`;
      feedback.className = 'feedback-msg success';
    } else {
      throw new Error(data.error || 'Something went wrong');
    }
  } catch {
    // Dev mode offline: optimistic success
    feedback.textContent = attending
      ? `🥂 Wonderful! We're saving your seat, ${name.split(' ')[0]}.`
      : `We'll miss you. Thank you for letting us know.`;
    feedback.className = 'feedback-msg success';
  }

  feedback.classList.remove('hidden');
  gsap.fromTo(feedback, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
  btn.textContent = 'RSVP Sent ✓';
}


/* ════════════════════════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════════════════════════*/

let galleryPhotos = [];
let activeTab = 'all';

// Seed some placeholder official photos
const officialPhotos = [
  { id: 'official-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', caption: 'Engagement Photo — Kent', tag: 'official' },
  { id: 'official-2', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80', caption: 'A walk in the garden', tag: 'official' },
  { id: 'official-3', url: 'https://images.unsplash.com/photo-1511285560929-80b456503681?w=400&q=80', caption: 'Our favourite evening', tag: 'official' },
  { id: 'official-4', url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&q=80', caption: 'The ring', tag: 'official' },
  { id: 'official-5', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80', caption: 'Ashford Estate', tag: 'official' },
  { id: 'official-6', url: 'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=400&q=80', caption: 'The flowers', tag: 'official' },
];

function initGalleryPage() {
  // Tabs
  document.querySelectorAll('.gtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderGallery();
    });
  });

  // Upload
  document.getElementById('upload-trigger').addEventListener('click', () => {
    document.getElementById('photo-upload').click();
  });
  document.getElementById('upload-zone').addEventListener('dragover', e => {
    e.preventDefault();
    document.getElementById('upload-zone').style.borderColor = 'var(--gold-light)';
  });
  document.getElementById('upload-zone').addEventListener('dragleave', () => {
    document.getElementById('upload-zone').style.borderColor = 'var(--gold)';
  });
  document.getElementById('upload-zone').addEventListener('drop', e => {
    e.preventDefault();
    document.getElementById('upload-zone').style.borderColor = 'var(--gold)';
    handleUpload(e.dataTransfer.files);
  });
  document.getElementById('photo-upload').addEventListener('change', e => {
    handleUpload(e.target.files);
  });

  // Lightbox
  document.getElementById('lightbox-close').addEventListener('click', () => {
    document.getElementById('lightbox').classList.add('hidden');
  });
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('lightbox')) {
      document.getElementById('lightbox').classList.add('hidden');
    }
  });
}

async function loadGallery() {
  try {
    const res = await fetch(`${API}/api/photos`, { credentials: 'include' });
    const data = await res.json();
    galleryPhotos = [...officialPhotos, ...(data.photos || [])];
  } catch {
    galleryPhotos = [...officialPhotos];
  }
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');

  const filtered = activeTab === 'all'
    ? galleryPhotos
    : galleryPhotos.filter(p => p.tag === activeTab);

  if (!filtered.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filtered.map(photo => `
    <div class="gallery-item" data-id="${photo.id}" data-url="${photo.url}" data-caption="${photo.caption || ''}">
      <img src="${photo.url}" alt="${photo.caption || 'Photo'}" loading="lazy" />
      <span class="photo-tag">${photo.tag === 'official' ? '✦' : '❤'}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById('lightbox-img').src = item.dataset.url;
      document.getElementById('lightbox-caption').textContent = item.dataset.caption;
      document.getElementById('lightbox').classList.remove('hidden');
    });
  });

  // Animate items in
  gsap.fromTo('.gallery-item', { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
  );
}

async function handleUpload(files) {
  if (!files || !files.length) return;

  const progress = document.getElementById('upload-progress');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  progress.classList.remove('hidden');
  const total = files.length;
  let done = 0;

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    label.textContent = `Uploading ${file.name}...`;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API}/api/photos/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.photo) galleryPhotos.push(data.photo);
    } catch {
      // Dev mode: create a local object URL
      const localUrl = URL.createObjectURL(file);
      galleryPhotos.push({
        id: `local-${Date.now()}`,
        url: localUrl,
        caption: file.name.replace(/\.[^.]+$/, ''),
        tag: 'guests',
      });
    }

    done++;
    fill.style.width = `${(done / total) * 100}%`;
  }

  label.textContent = 'Upload complete!';
  setTimeout(() => {
    progress.classList.add('hidden');
    fill.style.width = '0';
  }, 2000);

  // Switch to guests tab to see uploads
  activeTab = 'guests';
  document.querySelectorAll('.gtab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'guests');
  });
  renderGallery();
}


/* ════════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════════*/

document.addEventListener('DOMContentLoaded', () => {
  initOverlay();
});
