/**
 * 瑶草琪花 · KIXIZ STUDIO
 * Four-flower Particle Bloom
 *
 * Flowers (left → right):
 *   0 Rose → Cool things I have been working on
 *   1 Lily → UI/UX design
 *   2 Lotus → Graphic & Campaign
 *   3 Anthurium → Motion Graphics
 *
 * Keyboard fallback:
 *   Space bar / ← →   → scatter / cycle
 *
 * Particles are pre-sampled from the GLB models by scripts/bake-flowers.py
 * (positions + texture colours, sized to a common box), so the page only
 * downloads ~0.5 MB per flower instead of the full models.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import SocialLinks from '../components/SocialLinks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── PARTICLE DATA ─────────────────────────────────────────────── */
const FLOWER_URLS = [
  '/assets/flower-rose_824d2395.bin',
  '/assets/flower-lily_dbe070b1.bin',
  '/assets/flower-lotus_439ad204.bin',
  '/assets/flower-anthurium_1c7fe559.bin',
];
// Must match POS_SCALE in scripts/bake-flowers.py
const POS_SCALE = 1 / 8192;

// Started once per session, so returning to the homepage is instant
let flowerData: Promise<ArrayBuffer>[] | null = null;
const loadFlowerData = () => {
  flowerData ??= FLOWER_URLS.map(url =>
    fetch(url).then(r => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.arrayBuffer();
    }),
  );
  return flowerData;
};

const FLOWER_EN = ["Cool things I've been working on", 'UI/UX design', 'Graphic & Campaign', 'Motion Graphics'];
const PORTFOLIO_ROUTES = ['/cool-things', '/ui-design', '/graphic-campaign', '/3d-motion'];
const prefetchRoutes = () => {
  void import('./UIDesign');
  void import('./GraphicCampaign');
  void import('./ThreeDMotion');
  void import('./CoolThings');
};

/* ── PARTICLE CONFIG ───────────────────────────────────────────── */
const N_FLOWERS     = FLOWER_URLS.length;
const PARTICLE_SIZE = 0.038;
const FLOAT_AMP     = 0.008;
const FLOAT_SPEED   = 0.55;
const SCATTER_DIST  = 1.8;
const GATHER_SPEED  = 3.5;
const SCATTER_SPEED = 2.0;
// Spacing between flowers in world-space X (wide enough that neighbours stay off-screen)
const FLOWER_SPACING = 6;
// Flowers sit below the vertical centre so they clear the label above
const FLOWER_Y = -0.25;
// Narrowest world-space width the camera keeps in view (flowers are 2.7 wide)
const MIN_VIEW_WIDTH = 3.1;
const CAMERA_FOV = 50;
const CAMERA_DIST = 5;

const cameraDistance = (aspect: number) =>
  Math.max(CAMERA_DIST, MIN_VIEW_WIDTH / (2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * aspect));

/* ── VERTEX SHADER ─────────────────────────────────────────────── */
const VERT = /* glsl */`
  #define FLOAT_SPEED ${FLOAT_SPEED.toFixed(2)}
  #define FLOAT_AMP   ${FLOAT_AMP.toFixed(4)}

  attribute vec3 aOrigin;
  attribute vec3 aScatter;
  attribute float aPhase;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;

  void main() {
    vColor = aColor;

    float nx = sin(aPhase * 1.3 + uTime * FLOAT_SPEED) * FLOAT_AMP;
    float ny = cos(aPhase * 0.9 + uTime * FLOAT_SPEED * 1.1) * FLOAT_AMP;
    float nz = sin(aPhase * 1.7 + uTime * FLOAT_SPEED * 0.8) * FLOAT_AMP;

    float t = uProgress * uProgress * (3.0 - 2.0 * uProgress);
    vec3 pos = mix(aOrigin + vec3(nx,ny,nz), aScatter, t);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float sz = uSize * (0.7 + 0.6 * aSeed);
    gl_PointSize = sz * (300.0 / -mv.z);
  }
`;

/* ── FRAGMENT SHADER ───────────────────────────────────────────── */
const FRAG = /* glsl */`
  varying vec3 vColor;
  uniform float uProgress;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, d);
    alpha *= (1.0 - uProgress * 0.6);

    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* ── PARTICLE BUILDER ───────────────────────────────────────────── */
function buildParticles(buf: ArrayBuffer): THREE.BufferGeometry {
  const N = new DataView(buf).getUint32(0, true);
  const packed = new Int16Array(buf, 4, N * 3);
  const colours = new Uint8Array(buf, 4 + N * 6, N * 3);

  const posArr     = new Float32Array(N * 3);
  const phaseArr   = new Float32Array(N);
  const seedArr    = new Float32Array(N);
  const scatterArr = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const ox = posArr[i*3]   = packed[i*3]   * POS_SCALE;
    const oy = posArr[i*3+1] = packed[i*3+1] * POS_SCALE;
    const oz = posArr[i*3+2] = packed[i*3+2] * POS_SCALE;

    phaseArr[i] = Math.random() * Math.PI * 2;
    seedArr[i]  = Math.random();

    const len = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
    const spread = SCATTER_DIST * (0.6 + Math.random() * 0.8);
    scatterArr[i*3]   = ox + (ox/len)*spread + (Math.random()-0.5)*0.5;
    scatterArr[i*3+1] = oy + (oy/len)*spread + (Math.random()-0.5)*0.5;
    scatterArr[i*3+2] = oz + (oz/len)*spread + (Math.random()-0.5)*0.5;
  }

  const origin = new THREE.BufferAttribute(posArr, 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',  origin);
  geo.setAttribute('aOrigin',   origin);
  geo.setAttribute('aColor',    new THREE.BufferAttribute(colours, 3, true));
  geo.setAttribute('aScatter',  new THREE.BufferAttribute(scatterArr, 3));
  geo.setAttribute('aPhase',    new THREE.BufferAttribute(phaseArr,  1));
  geo.setAttribute('aSeed',     new THREE.BufferAttribute(seedArr,   1));
  return geo;
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────── */
export default function Home() {
  const mountRef      = useRef<HTMLDivElement>(null);
  const labelRef      = useRef<HTMLDivElement>(null);
  const [, navigate]  = useLocation();
  const navigateRef   = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!mountRef.current) return;

    /* ── SCENE SETUP ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.01, 200);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);

    /* ── FLOWER STATE ── */
    type FlowerState = {
      points: THREE.Points | null;
      mat: THREE.ShaderMaterial | null;
      progress: number;
      targetProgress: number;
      selected: boolean;
      loaded: boolean;
    };

    // 5 flowers evenly spaced along X axis, centred at 0
    const totalWidth = (N_FLOWERS - 1) * FLOWER_SPACING;
    const FLOWER_X = Array.from({ length: N_FLOWERS }, (_, i) => -totalWidth / 2 + i * FLOWER_SPACING);

    const flowers: FlowerState[] = Array.from({ length: N_FLOWERS }, () => ({
      points: null, mat: null, progress: 0, targetProgress: 0, selected: false, loaded: false,
    }));

    let activeIdx = 0;

    // Camera pan
    let camTargetX  = FLOWER_X[0];
    let camCurrentX = FLOWER_X[0];
    camera.position.set(FLOWER_X[0], 0, cameraDistance(camera.aspect));
    controls.target.set(FLOWER_X[0], 0, 0);

    const clock = new THREE.Clock();

    /* ── LOAD ALL FLOWERS ── */
    let disposed = false;
    loadFlowerData().forEach((data, idx) => {
      data.then(buf => {
        if (disposed) return;
        const geo = buildParticles(buf);

        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms: {
            uProgress: { value: 0 },
            uTime:     { value: 0 },
            uSize:     { value: PARTICLE_SIZE },
          },
          vertexColors: false,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });

        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        points.visible = true;
        points.position.set(FLOWER_X[idx], FLOWER_Y, 0);

        scene.add(points);
        flowers[idx].points = points;
        flowers[idx].mat    = mat;
        flowers[idx].loaded = true;

        updateLabel();
      }).catch(err => {
        console.error(`[LOAD] Failed: ${FLOWER_EN[idx]}`, err);
      });
    });

    // Fetch the category pages' code while the visitor is looking at the flowers
    const prefetchTimer = window.setTimeout(prefetchRoutes, 1500);

    /* ── LABEL UPDATE ── */
    const updateLabel = () => {
      if (!labelRef.current) return;
      const prevIdx = (activeIdx - 1 + N_FLOWERS) % N_FLOWERS;
      const nextIdx = (activeIdx + 1) % N_FLOWERS;
      labelRef.current.innerHTML =
        `<span style="font-size:clamp(1.7rem,7vw,2.2rem);letter-spacing:0.08em;font-weight:normal;color:#fff;font-family:'Instrument Serif',serif;font-style:italic">${FLOWER_EN[activeIdx]}</span>` +
        `<span style="display:block;font-size:clamp(0.72rem,3.2vw,0.9rem);letter-spacing:0.15em;opacity:0.4;margin-top:14px;font-family:'Barlow',sans-serif;font-weight:300">← ${FLOWER_EN[prevIdx]} · ${FLOWER_EN[nextIdx]} →</span>`;
    };
    updateLabel();

    /* ── SWITCH FLOWER ── */
    const switchFlower = (dir: 'left' | 'right') => {
      if (dir === 'left')  activeIdx = (activeIdx - 1 + N_FLOWERS) % N_FLOWERS;
      else                 activeIdx = (activeIdx + 1) % N_FLOWERS;
      camTargetX = FLOWER_X[activeIdx];
      controls.enabled = false;
      setTimeout(() => { controls.enabled = true; }, 1200);
      updateLabel();
    };

    /* ── SELECT / DESELECT ACTIVE FLOWER ── */
    const selectFlower = () => {
      flowers[activeIdx].selected = true;
      updateLabel();
    };
    const deselectFlower = () => {
      flowers[activeIdx].selected = false;
      flowers[activeIdx].targetProgress = 0;
      updateLabel();
    };

    /* ── KEYBOARD FALLBACK ── */
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const f = flowers[activeIdx];
        if (!f.selected) {
          selectFlower();
        } else {
          f.targetProgress = f.targetProgress > 0.5 ? 0 : 1;
        }
      }
      if (e.code === 'ArrowLeft')  switchFlower('left');
      if (e.code === 'ArrowRight') switchFlower('right');
    };
    window.addEventListener('keydown', onKey);

    /* ── MOUSE WHEEL: cycle flowers ── */
    let wheelCooldown = 0;
    const onWheel = (e: WheelEvent) => {
      // Only cycle if not zooming (ctrl key = pinch-zoom on trackpad)
      if (e.ctrlKey) return;
      const now = Date.now();
      if (now < wheelCooldown) return;
      wheelCooldown = now + 700;
      if (e.deltaY > 0 || e.deltaX > 0) switchFlower('right');
      else switchFlower('left');
    };
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    /* ── TOUCH SWIPE: cycle flowers on mobile ── */
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCooldown = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const now = Date.now();
      if (now < touchCooldown) return;
      // Require at least 50px swipe and more horizontal than vertical
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        touchCooldown = now + 700;
        if (deltaX < 0) switchFlower('right');
        else switchFlower('left');
      }
    };
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: true });

    /* ── CANVAS CLICK / TAP: scatter particles ── */
    // Taps also fire click, so touchend isn't needed; a drag to orbit shouldn't count
    let pointerDownX = 0;
    let pointerDownY = 0;
    let leaving = false;
    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };
    const onCanvasClick = (e: MouseEvent) => {
      if (leaving || Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY) > 8) return;
      const f = flowers[activeIdx];
      if (f.targetProgress > 0.5) {
        f.targetProgress = 0;
      } else {
        f.targetProgress = 1;
        leaving = true;
        // Fade to black, switch page in-app, then fade the new page in
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);z-index:9999;pointer-events:none;transition:background 0.45s ease-in-out';
        document.body.appendChild(overlay);
        const route = PORTFOLIO_ROUTES[activeIdx];
        requestAnimationFrame(() => {
          overlay.style.background = 'rgba(0,0,0,1)';
          setTimeout(() => {
            navigateRef.current(route);
            overlay.style.background = 'rgba(0,0,0,0)';
            setTimeout(() => overlay.remove(), 500);
          }, 450);
        });
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('click', onCanvasClick);

    /* ── ANIMATION LOOP ── */
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt   = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera pan
      const panLerp = 1 - Math.pow(0.04, dt);
      camCurrentX += (camTargetX - camCurrentX) * panLerp;
      camera.position.x = camCurrentX;
      controls.target.x = camCurrentX;
      controls.update();

      for (const f of flowers) {
        if (!f.mat || !f.points) continue;
        const speed = f.targetProgress > f.progress ? SCATTER_SPEED : GATHER_SPEED;
        f.progress += (f.targetProgress - f.progress) * Math.min(dt * speed, 1);
        f.progress = Math.max(0, Math.min(1, f.progress));
        f.mat.uniforms.uProgress.value = f.progress;
        f.mat.uniforms.uTime.value     = time;
        f.points.rotation.y += dt * 0.18;
      }

      renderer.render(scene, camera);
    };
    animate();

    /* ── RESIZE ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      // Pull back on narrow screens so the whole flower stays in frame
      const offset = camera.position.clone().sub(controls.target);
      camera.position.copy(controls.target).add(offset.setLength(cameraDistance(camera.aspect)));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ── CLEANUP ── */
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(prefetchTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);

      controls.dispose();
      renderer.dispose();
      for (const f of flowers) {
        if (f.points) { scene.remove(f.points); f.points.geometry.dispose(); }
        if (f.mat) f.mat.dispose();
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', position: 'relative' }}>
      {/* Three.js canvas mount */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Flower label */}
      <div ref={labelRef} style={{
        // Sits in the top band; the flowers are drawn below it (FLOWER_Y)
        position: 'absolute', top: 'clamp(124px, 17vh, 160px)', left: '50%',
        transform: 'translateX(-50%)', width: 'min(92vw, 760px)', whiteSpace: 'normal',
        color: '#fff', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
        transition: 'opacity 0.3s',
      }} />

      {/* Centered bottom instructions - responsive */}
      <div style={{
        position: 'absolute', bottom: 'max(40px, env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)',
        pointerEvents: 'none',
        padding: '0 16px',
      }}>
        {/* Scroll instruction row - responsive */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(16px, 5vw, 40px)',
          color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif",
          fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', letterSpacing: '0.1em', fontWeight: '400',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <span>Scroll / swipe</span>
          <div style={{
            width: '20px', height: '28px', border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            <div style={{
              width: '2px', height: '5px', background: 'rgba(255,255,255,0.7)',
              borderRadius: '1px',
              animation: 'scroll-bounce 2s infinite',
            }} />
          </div>
          <span>to explore</span>
        </div>
        {/* Click instruction */}
        <div style={{
          color: 'rgba(255,255,255,0.75)', fontFamily: "'Barlow', sans-serif",
          fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', letterSpacing: '0.1em', fontWeight: '300',
        }}>
          Click / tap to scatter
        </div>
      </div>

      <style>{`
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.3; }
        }
        @keyframes doodle-draw { to { stroke-dashoffset: 0; } }
        @keyframes doodle-fade { to { opacity: 0.85; } }
        .github-doodle path {
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: doodle-draw 0.7s ease-out 1.4s forwards;
        }
        .github-doodle-text { opacity: 0; animation: doodle-fade 0.6s ease-out 1.1s forwards; }
        @media (prefers-reduced-motion: reduce) {
          .github-doodle path { animation: none; stroke-dashoffset: 0; }
          .github-doodle-text { animation: none; opacity: 0.85; }
        }
      `}</style>

      {/* Studio mark */}
      <a href="/" aria-label="KIXIZZ Studio home" style={{
        position: 'absolute', top: 'max(12px, env(safe-area-inset-top))', left: 'max(12px, env(safe-area-inset-left))',
        zIndex: 1000,
      }}>
        <img
          src="/assets/kixiz-logo_ce4a8d4a.png"
          alt="KIXIZZ Studio"
          style={{
            width: 'clamp(40px, 8vw, 60px)',
            height: 'auto',
            opacity: 0.9,
          }}
        />
      </a>

      {/* Social profiles */}
      <div style={{
        position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 'max(16px, env(safe-area-inset-right))',
      }}>
        <SocialLinks />

        {/* Handwritten note pointing up at the GitHub icon */}
        <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <svg
            className="github-doodle"
            width="28" height="28" viewBox="0 0 44 46"
            fill="none" stroke="#f8f5ef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 61, opacity: 0.85 }}
          >
            <path pathLength={1} d="M5 43 C 9 30, 18 16, 37 6" />
            <path pathLength={1} d="M27 5.5 L37 6 L31.5 14.5" />
          </svg>
          <span
            className="github-doodle-text"
            style={{
              position: 'absolute', top: 'calc(100% + 30px)', right: 8,
              whiteSpace: 'nowrap', color: '#f8f5ef',
              fontFamily: "'Caveat', cursive", fontWeight: 600,
              fontSize: '1.15rem', lineHeight: 1,
              transform: 'rotate(-5deg)', transformOrigin: 'right center',
            }}
          >
            more fun stuff here
          </span>
        </div>
      </div>

      {/* NEXT button - bottom right */}
      <button
        className="liquid-glass-strong"
        onClick={() => {
          const event = new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
          window.dispatchEvent(event);
        }}
        style={{
          position: 'fixed',
          bottom: 'max(32px, env(safe-area-inset-bottom))',
          right: 'max(32px, env(safe-area-inset-right))',
          borderRadius: 8,
          color: '#fff',
          fontFamily: "'Barlow', sans-serif",
          fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
          letterSpacing: '0.15em',
          padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 20px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          display: 'block',
          fontWeight: '400',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.25), 0 0 16px rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15)';
        }}
      >
         NEXT →
      </button>
    </div>
  );
}
