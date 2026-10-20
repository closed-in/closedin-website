/* The dark hero mark: the closed:in favicon as a dark metal object with blue-lit edges and a liquid ripple. It spins, opens and clicks shut in a loop and follows the cursor.
   Ported from Max' "closed:in Front Page" artifact (18-10-2026) to the vendored three 0.186.1. init(host, { isMobile }) mounts a canvas in host and adds .is-live after the first frame. */
import * as THREE from 'three';

export function init(host, opts = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Light balance, matched against the artifact rendered side by side (18-10): white key light up, the blue front light down, edge glow near white, bump high enough for the white glitter on the black faces */
  const KEY = 2.5, RIM = 1.5, GLOW = 0.3, BUMP = 4.6, EDGE = 0xdbeeff, STRIP_BLUE = 0.5;
  const isMobile = !!opts.isMobile;
  const LIGHT = 0.8, ACCENT = 0x72C1FF, PI = Math.PI;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const canvas = renderer.domElement; canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100); camera.position.set(0, 0.1, 8.6);

  const inkMat = new THREE.MeshPhysicalMaterial({ color: 0x0f1115, metalness: 0.65, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.02, reflectivity: 0.8 });
  const dotMat = inkMat.clone(); dotMat.emissive = new THREE.Color(0xbfe3ff); dotMat.emissiveIntensity = 0;
  const edgeMat = inkMat.clone(); edgeMat.color.set(0x05070a); edgeMat.emissive = new THREE.Color(EDGE); edgeMat.emissiveIntensity = 1.7;
  const ALL = [inkMat, dotMat, edgeMat];

  /* geometry in the favicon's 500-unit grid, centred on (250, 250) */
  const S = 100, C = 250, px = (x) => (x - C) / S, py = (y) => (C - y) / S;
  const bracketShape = new THREE.Shape();
  [[267, 105], [395, 105], [395, 229], [386, 229], [386, 114], [267, 114]].forEach(([x, y], i) => (i ? bracketShape.lineTo(px(x), py(y)) : bracketShape.moveTo(px(x), py(y))));
  bracketShape.closePath();
  const dotShape = new THREE.Shape();
  { const w = 15 / S, r = 2.2 / S, x = -w / 2, y = -w / 2;
    dotShape.moveTo(x + r, y); dotShape.lineTo(x + w - r, y); dotShape.quadraticCurveTo(x + w, y, x + w, y + r);
    dotShape.lineTo(x + w, y + w - r); dotShape.quadraticCurveTo(x + w, y + w, x + w - r, y + w);
    dotShape.lineTo(x + r, y + w); dotShape.quadraticCurveTo(x, y + w, x, y + w - r);
    dotShape.lineTo(x, y + r); dotShape.quadraticCurveTo(x, y, x + r, y); }
  const DEPTH = 0.16, extrude = { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 4, curveSegments: 12 };
  const bracketGeo = new THREE.ExtrudeGeometry(bracketShape, extrude); bracketGeo.translate(0, 0, -DEPTH / 2);
  const dotGeo = new THREE.ExtrudeGeometry(dotShape, extrude); dotGeo.translate(0, 0, -DEPTH / 2);

  const icon = new THREE.Group(); scene.add(icon);
  const dots = new THREE.Group();
  const dotTop = new THREE.Mesh(dotGeo, [dotMat, edgeMat]); dotTop.position.set(px(249.5), py(213.5), 0);
  const dotBot = new THREE.Mesh(dotGeo, [dotMat, edgeMat]); dotBot.position.set(px(249.5), py(274.5), 0);
  [dotTop, dotBot].forEach((m) => { m.castShadow = m.receiveShadow = true; dots.add(m); });
  icon.add(dots);
  const brackets = new THREE.Group(), trPivot = new THREE.Group(), blPivot = new THREE.Group();
  const tr = new THREE.Mesh(bracketGeo, [inkMat, edgeMat]), bl = new THREE.Mesh(bracketGeo, [inkMat, edgeMat]);
  trPivot.add(tr); blPivot.add(bl); blPivot.rotation.z = PI;
  [tr, bl].forEach((m) => { m.castShadow = m.receiveShadow = true; });
  brackets.add(trPivot, blPivot); icon.add(brackets);

  /* dark environment: a black void with three strip lights, so the reflections are blue and white streaks */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: 0x030405, side: THREE.BackSide })));
  [[-8, 10, 6, 26, 1.2, 6.0, 0xeef4ff], [9, -3, 5, 1.0, 22, 3.0, 0xffffff], [2, 6, -10, 18, 1.6, 4.0 * STRIP_BLUE, ACCENT]].forEach(([x, y, z, w, h, k, col]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  });
  scene.environment = pmrem.fromScene(envScene, 0.03).texture; pmrem.dispose();

  /* liquid ripple as bump and roughness map, with the glitter flakes (Max 19-10). Computed once (scripts/mark-bump.py, 512x512) instead of on every visit:
     the per-texel noise loop was about 0.8 s of main-thread work on a throttled phone (night audit 20-10). */
  const bumpReady = new Promise((done) => {
    const tex = new THREE.TextureLoader().load('/assets/img/mark-bump-v1.webp', () => done(), undefined, () => done());
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
    ALL.forEach((m) => { m.bumpMap = tex; m.bumpScale = BUMP; m.roughnessMap = tex; m.roughness = 0.06; m.clearcoatRoughness = 0.02; m.envMapIntensity = 0.9 * LIGHT; });
    [inkMat, dotMat].forEach((m) => { m.metalness = 0.65; m.roughness = 0.2; });
  });

  /* lights (three 0.186 uses physical light units, so the artifact's r128 intensities are scaled by pi) */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a4250, 0.12 * LIGHT * PI));
  const key = new THREE.DirectionalLight(0xffffff, 0.45 * LIGHT * PI * KEY); key.position.set(-4, 5, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.01; scene.add(key);
  const fill = new THREE.DirectionalLight(0xdbe9ff, 0.08 * LIGHT * PI); fill.position.set(4, -1, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4 * LIGHT * PI * RIM); rim.position.set(2, 2, -5); scene.add(rim);
  const glow = new THREE.PointLight(ACCENT, 0.7 * LIGHT * PI * GLOW, 6, 2); glow.position.set(0, 0, 1.6); scene.add(glow);

  /* state machine: idle, spin (cw, ccw, flip), pause, open, hold, click */
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t) => { const c = 2.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const D = { spin: 1.45, pause: 0.12, open: 0.28, hold: 0.2, click: 0.19 }, OPEN = 0.17;
  const Z_AXIS = new THREE.Vector3(0, 0, 1), FLIP_AXIS = new THREE.Vector3(-1, 1, 0).normalize();
  const MODES = ['cw', 'ccw', 'flip']; let mi = 0, spinMode = 'cw';
  let phase = 'idle', phaseT = 0, nextSpinIn = 1.6, clickKick = 0;
  const setPhase = (p) => { phase = p; phaseT = 0; };

  /* cursor parallax, fine pointers only */
  let parX = 0, parY = 0, parTX = 0, parTY = 0;
  const onPointer = (e) => { if (reduceMotion) return; parTX = ((e.clientX / window.innerWidth) - 0.5) * 0.5; parTY = ((e.clientY / window.innerHeight) - 0.5) * 0.35; };
  if (!isMobile) window.addEventListener('pointermove', onPointer, { passive: true });

  function resize() { const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(host);

  /* render only while on screen and the tab is visible; 30 fps on phones */
  let visible = true, disposed = false, live = false, lastRender = 0;
  const io = new IntersectionObserver((en) => { visible = en.some((x) => x.isIntersecting); }, { rootMargin: '10% 0px' }); io.observe(host);
  let prevT = performance.now() / 1000, elapsed = 0;
  function frame() {
    if (disposed) return;
    requestAnimationFrame(frame);
    const now = performance.now();
    if (!visible || document.hidden) { prevT = now / 1000; return; }
    if (isMobile && now - lastRender < 32) return;
    lastRender = now;
    const dt = Math.min(now / 1000 - prevT, 0.05); prevT = now / 1000; elapsed += dt; const t = elapsed, fa = reduceMotion ? 0 : 1;
    icon.position.y = Math.sin(t * 1.1) * 0.04 * fa;
    parX += (parTX - parX) * 0.05; parY += (parTY - parY) * 0.05;
    icon.rotation.y = parX + Math.sin(t * 0.45) * 0.28 * fa; icon.rotation.x = parY + Math.sin(t * 0.7) * 0.06 * fa;
    phaseT += dt; let spin = 0, gap = 0;
    if (phase === 'idle') { if (!reduceMotion) { nextSpinIn -= dt; if (nextSpinIn <= 0) { nextSpinIn = 1.6; spinMode = MODES[mi]; setPhase('spin'); } } }
    else if (phase === 'spin') { const k = Math.min(phaseT / D.spin, 1); spin = easeInOutCubic(k) * PI * 2; if (k >= 1) setPhase('pause'); }
    else if (phase === 'pause') { if (phaseT >= D.pause) setPhase('open'); }
    else if (phase === 'open') { const k = Math.min(phaseT / D.open, 1); gap = easeOutCubic(k) * OPEN; if (k >= 1) setPhase('hold'); }
    else if (phase === 'hold') { gap = OPEN; if (phaseT >= D.hold) { setPhase('click'); clickKick = 1; } }
    else if (phase === 'click') { const k = Math.min(phaseT / D.click, 1); gap = OPEN * (1 - easeOutBack(k)); if (k >= 1) { gap = 0; setPhase('idle'); mi = (mi + 1) % MODES.length; } }
    if (spinMode === 'flip') brackets.quaternion.setFromAxisAngle(FLIP_AXIS, spin); else brackets.quaternion.setFromAxisAngle(Z_AXIS, spinMode === 'cw' ? -spin : spin);
    const d = gap * 0.7071; tr.position.set(d, d, 0); bl.position.set(d, d, 0);
    clickKick = Math.max(0, clickKick - dt * 5);
    dots.scale.setScalar(1 + clickKick * 0.06); dots.position.z = Math.sin(clickKick * PI * 3) * clickKick * 0.04;
    dotMat.emissiveIntensity = clickKick * 0.9;
    edgeMat.emissiveIntensity = 1.7 * (0.85 + Math.sin(t * 1.6) * 0.15 + clickKick * 0.8);
    host.style.setProperty('--pulse', (0.9 + Math.sin(t * 1.6) * 0.1 + clickKick * 0.6).toFixed(3));
    glow.intensity = (0.7 * LIGHT + clickKick * 2.2) * PI * GLOW;
    renderer.render(scene, camera);
    if (!live) { live = true; host.classList.add('is-live'); }
  }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dispose(); });
  function dispose() { if (disposed) return; disposed = true; ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', onPointer); host.classList.remove('is-live'); scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }); renderer.dispose(); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }
  /* 19-10: compile the shaders before the first frame (in parallel where the driver allows it), so the first frame does not block the page */
  const start = () => { if (!disposed) requestAnimationFrame(frame); };
  Promise.all([renderer.compileAsync ? renderer.compileAsync(scene, camera).catch(() => {}) : null, bumpReady]).then(start, start);   /* first frame with the texture in place: no flat-to-glitter pop */
  return { dispose };
}
