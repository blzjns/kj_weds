import * as THREE from 'three';
import type { ParticleSystem } from './types/misc';

/**
 * Initialises Three.js floating rose-petal particles on the given canvas element.
 * Returns a { stop } handle to clean up the animation.
 */
export function initParticles(canvas: HTMLCanvasElement, opts: { count?: number; span?: number } = {}): ParticleSystem {
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 5;

  function makePetalGeo() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.25, 0.3, 0.5, 0, 0.7);
    shape.bezierCurveTo(-0.3, 0.5, -0.15, 0.25, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }

  const petalGeo = makePetalGeo();
  const count = opts.count || 40;
  const petals: { mesh: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>; vy: number; vx: number; vr: number; wobble: number; wobbleSpeed: number; }[] = [];
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

  let raf: number;
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
    petals.forEach((p) => {
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

  return {
    stop: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
