/* InnoHelix — the particle world.
   One Points cloud (≈9k particles) that morphs between six "forms" as the page
   moves through its chapters — the company's story told in matter:
     helix   → the brand: a double helix of carbon
     chaos   → complex pyrolysis gas: turbulent, impurity-coloured
     reactor → two catalytic beds: dirty stream in, two clean H₂ / CO lanes out
     jet     → what the syngas becomes: aviation fuel
     bridge  → China ↔ Europe
     loop    → carbon kept in the loop
   Colour carries meaning only: white/silver = clean carbon, rust/amber = impurities & fuel.
   Classic script; three.js comes from the local vendor/three.classic.js (file:// safe). */
(async function () {
  "use strict";
  const canvas = document.getElementById("world");
  if (!canvas) return;
  const qs = new URLSearchParams(location.search);
  const STILL = qs.has("still");          // deterministic screenshots only; motion stays on everywhere else
  const fail = () => dispatchEvent(new Event("world:ready"));

  // three.js ships locally as a classic script (vendor/three.classic.js → window.THREE),
  // so this runs from file:// and on networks that block CDNs. CDN only as a last resort.
  let THREE = window.THREE;
  if (!THREE) {
    try { THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"); }
    catch (e) { return fail(); }
  }

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return fail(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 80);
  camera.position.set(0, 0, 12);

  const PHONE = innerWidth < 740;
  const N = PHONE ? 5200 : 9000;

  /* ---------- seeded randomness: ?still renders the identical frame every time ---------- */
  let seed = 20261008;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const r1 = new Float32Array(N), r2 = new Float32Array(N), r3 = new Float32Array(N), r4 = new Float32Array(N);
  const g1 = new Float32Array(N), g2 = new Float32Array(N), g3 = new Float32Array(N);
  const stagger = new Float32Array(N), scat = new Float32Array(N * 3), sizes = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    r1[i] = rnd(); r2[i] = rnd(); r3[i] = rnd(); r4[i] = rnd();
    g1[i] = gauss(); g2[i] = gauss(); g3[i] = gauss();
    stagger[i] = rnd();
    const a = rnd() * Math.PI * 2, b = Math.acos(rnd() * 2 - 1);
    scat[i * 3] = Math.sin(b) * Math.cos(a); scat[i * 3 + 1] = Math.sin(b) * Math.sin(a); scat[i * 3 + 2] = Math.cos(b);
    sizes[i] = rnd() < 0.045 ? 0.2 + rnd() * 0.14 : 0.07 + rnd() * 0.06;
  }

  /* ---------- palette (linear-ish, additive) ---------- */
  const WHITE = [0.95, 0.97, 0.96], SILVER = [0.62, 0.67, 0.66], SMOKE = [0.44, 0.48, 0.47];
  const TEAL = [0.74, 0.79, 0.79], AMBER = [1.0, 0.68, 0.26], RUST = [0.88, 0.38, 0.2]; // "TEAL" is now a cool silver: the interface is monochrome
  const mix3 = (a, b, k, o, s) => { o[0] = (a[0] + (b[0] - a[0]) * k) * s; o[1] = (a[1] + (b[1] - a[1]) * k) * s; o[2] = (a[2] + (b[2] - a[2]) * k) * s; };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const dirty = (i, o, s) => {           // impurity palette for the "before" gas
    const k = r4[i];
    if (k < 0.48) mix3(SMOKE, SILVER, r2[i], o, s);
    else if (k < 0.66) mix3(RUST, AMBER, r2[i] * 0.3, o, s);
    else if (k < 0.8) mix3(AMBER, WHITE, r2[i] * 0.2, o, s);
    else if (k < 0.9) mix3(WHITE, SILVER, r2[i], o, s);
    else mix3(TEAL, WHITE, 0.2, o, s);
  };
  const tmp = [0, 0, 0];

  /* ---------- static precomputes ---------- */
  // chaos clusters
  const CL = [];
  for (let c = 0; c < 9; c++) CL.push([(rnd() - 0.5) * 10.5, (rnd() - 0.5) * 4.8, (rnd() - 0.5) * 3.5, 0.6 + rnd() * 1.0]);
  // reactor catalyst-pellet lattices (quantized structure reads as engineered)
  const BED = [-1.95, 1.95], BL = 2.3, BR = 1.12, lattice = [[], []];
  for (let b = 0; b < 2; b++)
    for (let x = -BL / 2 + 0.13; x <= BL / 2; x += 0.27)
      for (let y = -BR; y <= BR; y += 0.27)
        for (let z = -BR; z <= BR; z += 0.27)
          if (y * y + z * z < (BR - 0.1) * (BR - 0.1)) lattice[b].push([BED[b] + x + (b ? 0.135 : 0), y, z]);
  // jet orientation: near plan view (the most legible silhouette), heading up-right
  const rot = new THREE.Matrix4().makeRotationZ(0.42).multiply(new THREE.Matrix4().makeRotationX(1.22)).multiply(new THREE.Matrix4().makeRotationY(0.12));
  const me = rot.elements;
  const applyRot = (x, y, z, o, k) => { o[k] = me[0] * x + me[4] * y + me[8] * z; o[k + 1] = me[1] * x + me[5] * y + me[9] * z; o[k + 2] = me[2] * x + me[6] * y + me[10] * z; };
  const jetBase = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const g = i % 20, side = r3[i] < 0.5 ? 1 : -1;
    let x = 0, y = 0, z = 0;
    if (g < 6) {                               // fuselage shell
      x = -3.2 + r1[i] * 6.4;
      let r = 0.42;
      if (x > 1.9) r = 0.42 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 1.9) / 1.3, 2)));
      if (x < -1.8) r = 0.42 * (1 - ((-1.8 - x) / 1.4) * 0.72);
      const th = r2[i] * Math.PI * 2;
      y = Math.cos(th) * r + (x < -1.8 ? (-1.8 - x) * 0.14 : 0); z = Math.sin(th) * r;
    } else if (g < 12) {                       // swept wings
      const s = r2[i], ch = 1.7 - 1.2 * s, le = 0.8 - 1.9 * s;
      x = le - r4[i] * ch; z = side * (0.36 + s * 3.9); y = -0.14 + s * 0.3 + g1[i] * 0.012;
    } else if (g < 13) {                       // horizontal stabiliser
      const s = r2[i], ch = 0.8 - 0.45 * s, le = -2.35 - 0.55 * s;
      x = le - r4[i] * ch; z = side * (0.18 + s * 1.35); y = 0.2 + s * 0.1;
    } else if (g < 14) {                       // fin
      const s = r2[i], ch = 0.95 - 0.5 * s, le = -2.2 - 0.9 * s;
      x = le - r4[i] * ch; y = 0.36 + s * 1.25; z = g1[i] * 0.012;
    } else {                                   // engines (and contrail origin)
      const th = r2[i] * Math.PI * 2;
      x = -0.1 + r1[i] * 1.0; y = -0.44 + Math.cos(th) * 0.2; z = side * 1.38 + Math.sin(th) * 0.2;
    }
    applyRot(x, y, z, jetBase, i * 3);
  }

  /* ---------- forms: each writes target positions + colours for time t ---------- */
  const TAU = Math.PI * 2;
  const FORMS = {
    helix(t, P, C) {
      const H = 9.6, R = 1.55, TURNS = 2.3, spin = t * 0.32;
      for (let i = 0; i < N; i++) {
        const k = i % 20, j = i * 3, u = r1[i];
        if (k < 16) {
          const strand = k < 8 ? 0 : 1, th = u * TURNS * TAU + strand * Math.PI + spin;
          P[j] = Math.cos(th) * R + g1[i] * 0.055; P[j + 1] = (u - 0.5) * H + g3[i] * 0.05; P[j + 2] = Math.sin(th) * R + g2[i] * 0.055;
          if (strand) mix3(TEAL, WHITE, r2[i] * 0.45, tmp, 0.95); else mix3(WHITE, SILVER, r2[i] * 0.5, tmp, 1.0);
        } else if (k < 19) {
          const rung = Math.floor(u * 36), uq = (rung + 0.5) / 36, th = uq * TURNS * TAU + spin, s = 1 - 2 * r2[i];
          P[j] = Math.cos(th) * R * s + g1[i] * 0.02; P[j + 1] = (uq - 0.5) * H + g3[i] * 0.018; P[j + 2] = Math.sin(th) * R * s + g2[i] * 0.02;
          if (rung % 4 === 0) mix3(AMBER, WHITE, 0.2, tmp, 0.7); else mix3(SILVER, WHITE, 0.3, tmp, 0.5);
        } else {
          const rr = 2.4 + r2[i] * 2.4, a = r3[i] * TAU + t * 0.035;
          P[j] = Math.cos(a) * rr; P[j + 1] = (u - 0.5) * H * 1.15; P[j + 2] = Math.sin(a) * rr;
          mix3(SMOKE, SILVER, r4[i], tmp, 0.45);
        }
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
    chaos(t, P, C) {
      for (let i = 0; i < N; i++) {
        const j = i * 3, c = CL[Math.floor(r1[i] * CL.length)];
        let x = c[0] + g1[i] * c[3], y = c[1] + g2[i] * c[3] * 0.8, z = c[2] + g3[i] * c[3];
        x += Math.sin(t * 0.5 + y * 1.2 + r2[i] * 6) * 0.38;
        y += Math.cos(t * 0.43 + z * 1.1 + r3[i] * 6) * 0.32;
        z += Math.sin(t * 0.37 + x * 0.8) * 0.3;
        P[j] = x; P[j + 1] = y; P[j + 2] = z;
        dirty(i, tmp, 0.75 + r2[i] * 0.3);
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
    reactor(t, P, C) {
      const end1 = BED[0] - BL / 2 - 0.4, end2 = BED[1] + BL / 2 + 0.4;
      for (let i = 0; i < N; i++) {
        const j = i * 3, g = i % 10;
        if (g < 2) {                           // catalyst pellets
          const b = r2[i] < 0.5 ? 0 : 1, L = lattice[b], p = L[(i * 7919) % L.length];
          P[j] = p[0] + g1[i] * 0.022; P[j + 1] = p[1] + g2[i] * 0.022; P[j + 2] = p[2] + g3[i] * 0.022;
          if (b) mix3(TEAL, WHITE, r3[i] * 0.3, tmp, 0.95); else mix3(AMBER, RUST, r3[i] * 0.6, tmp, 0.9);
        } else if (g < 3) {                    // vessel outlines
          const b = r2[i] < 0.5 ? 0 : 1, cx = BED[b];
          if (r3[i] < 0.55) { const th = r4[i] * TAU, ex = cx + (r1[i] < 0.5 ? -BL / 2 : BL / 2); P[j] = ex; P[j + 1] = Math.cos(th) * BR * 1.08; P[j + 2] = Math.sin(th) * BR * 1.08; }
          else { const th = Math.floor(r4[i] * 10) / 10 * TAU; P[j] = cx + (r1[i] - 0.5) * BL; P[j + 1] = Math.cos(th) * BR * 1.08; P[j + 2] = Math.sin(th) * BR * 1.08; }
          mix3(SILVER, WHITE, 0.3, tmp, 0.6);
        } else {                               // the gas stream
          const s = (r1[i] * 10 + t * 0.05 * (0.85 + r2[i] * 0.3)) % 1, x = -8 + s * 16;
          const wIn = sstep(end1 - 0.6, end1 + 0.4, x), wOut = sstep(end2 - 0.4, end2 + 0.6, x);
          const yW = g1[i] * 0.7 + Math.sin(t * 1.3 + x * 1.6 + r2[i] * 6) * 0.3, zW = g2[i] * 0.7 + Math.cos(t * 1.1 + x * 1.3 + r3[i] * 6) * 0.25;
          const lim = BR - 0.15, yI = Math.max(-lim, Math.min(lim, g1[i] * 0.38)), zI = Math.max(-lim, Math.min(lim, g2[i] * 0.38));
          const lane = r3[i] < 0.5 ? 0.42 : -0.42, yL = lane + g1[i] * 0.045, zL = g2[i] * 0.045;
          P[j] = x;
          P[j + 1] = (yW + (yI - yW) * wIn) * (1 - wOut) + yL * wOut;
          P[j + 2] = (zW + (zI - zW) * wIn) * (1 - wOut) + zL * wOut;
          const clean = sstep(BED[0], end2 + 0.3, x);
          dirty(i, tmp, 0.85);
          const cr = tmp[0], cg = tmp[1], cb = tmp[2];
          const tgt = r3[i] < 0.5 ? WHITE : TEAL, br = 0.9 + wOut * 0.25;
          tmp[0] = (cr + (tgt[0] - cr) * clean) * br; tmp[1] = (cg + (tgt[1] - cg) * clean) * br; tmp[2] = (cb + (tgt[2] - cb) * clean) * br;
        }
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
    jet(t, P, C) {
      for (let i = 0; i < N; i++) {
        const j = i * 3, g = i % 20;
        if (g < 15) {
          P[j] = jetBase[j]; P[j + 1] = jetBase[j + 1] + Math.sin(t * 0.8) * 0.05; P[j + 2] = jetBase[j + 2];
          if (g < 6) mix3(WHITE, SILVER, r4[i] * 0.4, tmp, 0.95);
          else if (g < 12) mix3(WHITE, SILVER, 0.35 + r4[i] * 0.4, tmp, 0.75);
          else if (g < 14) mix3(TEAL, WHITE, 0.15, tmp, 0.95);
          else mix3(AMBER, WHITE, 0.25, tmp, 0.95);
        } else {                               // contrails stream back from the engines
          const side = r3[i] < 0.5 ? 1 : -1, a = (r1[i] + t * 0.2) % 1, sp = 0.04 + a * 0.55;
          applyRot(-0.15 - a * 9.5, -0.44 + g1[i] * sp * 0.55 - a * 0.1 + Math.sin(t * 0.8) * 0.05, side * 1.38 + g2[i] * sp, P, j);
          mix3(WHITE, TEAL, a * 0.6, tmp, (1 - a) * (1 - a) * 0.9);
        }
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
    bridge(t, P, C) {
      const LC = [AMBER[0] * 0.75 + 0.2, AMBER[1] * 0.75 + 0.2, AMBER[2] * 0.75 + 0.2];
      for (let i = 0; i < N; i++) {
        const j = i * 3, g = i % 20;
        if (g < 12) {                          // two worlds
          const left = g < 6, cx = left ? -4.3 : 4.3, u = r1[i] * 2 - 1, ph = r2[i] * TAU + t * (left ? 0.1 : -0.1), q = Math.sqrt(1 - u * u), R = 1.3 + g3[i] * 0.03;
          P[j] = cx + q * Math.cos(ph) * R; P[j + 1] = u * R; P[j + 2] = q * Math.sin(ph) * R;
          if (left) mix3(LC, WHITE, r3[i] * 0.4, tmp, 0.8); else mix3(TEAL, WHITE, r3[i] * 0.35, tmp, 0.85);
        } else if (g < 19) {                   // arcs of flow between them
          const fwd = r3[i] < 0.68, u = (r1[i] + t * 0.08 * (0.7 + r2[i] * 0.6)) % 1, k = fwd ? u : 1 - u, h = fwd ? 2.1 : -1.5;
          const x0 = -3.0, x2 = 3.0, y1 = h * 2, z1 = (r4[i] - 0.5) * 1.6, m = 1 - k;
          P[j] = m * m * x0 + 2 * m * k * 0 + k * k * x2 + g1[i] * 0.05;
          P[j + 1] = 2 * m * k * y1 + g2[i] * 0.05;
          P[j + 2] = 2 * m * k * z1 + g3[i] * 0.05;
          mix3(LC, TEAL, k, tmp, 0.75);
        } else {                               // the InnoHelix interface ring
          const th = r1[i] * TAU + t * 0.6;
          P[j] = g1[i] * 0.03; P[j + 1] = Math.cos(th) * 0.72; P[j + 2] = Math.sin(th) * 0.72;
          mix3(WHITE, TEAL, 0.2, tmp, 1.0);
        }
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
    loop(t, P, C) {
      for (let i = 0; i < N; i++) {
        const j = i * 3, g = i % 20;
        if (g < 17) {
          const a = r1[i] * TAU + t * (0.12 + r2[i] * 0.05), th = r3[i] * TAU, R = 2.9, r = 0.1 + r4[i] * 0.2;
          P[j] = Math.cos(a) * (R + Math.cos(th) * r); P[j + 1] = Math.sin(a) * (R + Math.cos(th) * r); P[j + 2] = Math.sin(th) * r * 1.6;
          const q = ((a % TAU) + TAU) % TAU / TAU;
          if (q < 0.34) mix3(TEAL, WHITE, q / 0.34, tmp, 0.9);
          else if (q < 0.67) mix3(WHITE, AMBER, (q - 0.34) / 0.33, tmp, 0.9);
          else mix3(AMBER, TEAL, (q - 0.67) / 0.33, tmp, 0.9);
        } else if (g < 19) {
          const rr = Math.sqrt(r2[i]) * 2.4, a = r3[i] * TAU + t * 0.03;
          P[j] = Math.cos(a) * rr; P[j + 1] = Math.sin(a) * rr; P[j + 2] = g1[i] * 0.1;
          mix3(SMOKE, SILVER, r4[i], tmp, 0.45);
        } else {
          const rr = 3.6 + r2[i] * 2.6, a = r3[i] * TAU + t * 0.02, u = r1[i] * 2 - 1;
          P[j] = Math.cos(a) * rr; P[j + 1] = u * 2.2; P[j + 2] = Math.sin(a) * rr * 0.6;
          mix3(SMOKE, SILVER, r4[i], tmp, 0.4);
        }
        C[j] = tmp[0]; C[j + 1] = tmp[1]; C[j + 2] = tmp[2];
      }
    },
  };

  /* ---------- stage placement per chapter (desktop / phone) ---------- */
  const STAGES = {
    helix:   { form: "helix",   d: [3.0, -0.1, 1.0, 0.12, 0, -0.5],  m: [0.6, 1.9, 0.62, 0.12, 0, -0.35] },
    chaos:   { form: "chaos",   d: [0, 0, 1.0, 0, 0, 0],               m: [0, 0.6, 0.62, 0, 0, 0] },
    reactor: { form: "reactor", d: [1.2, -0.4, 0.92, 0.3, -0.38, 0],   m: [0, 1.4, 0.48, 0.3, -0.38, 0] },
    jet:     { form: "jet",     d: [2.4, 0.3, 0.95, 0, 0, 0],          m: [0.2, 2.0, 0.55, 0, 0, 0] },
    bridge:  { form: "bridge",  d: [0, -0.8, 0.88, 0.22, 0, 0],        m: [0, 1.4, 0.45, 0.22, 0, 0] },
    loop:    { form: "loop",    d: [0, 0.1, 1.0, 0.55, -0.28, 0],      m: [0, 0.4, 0.62, 0.55, -0.28, 0] },
  };

  /* ---------- geometry + material ---------- */
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const tgtP = new Float32Array(N * 3), tgtC = new Float32Array(N * 3);
  const fromP = new Float32Array(N * 3), fromC = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("aColor", colAttr);
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

  const makeMat = (op) => new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 1 }, uOpacity: { value: op }, uNear: { value: 9 }, uFar: { value: 24 } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSize;
      uniform float uScale, uNear, uFar;
      varying vec3 vColor; varying float vFog;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = aSize * uScale / d;
        vColor = aColor;
        vFog = 1.0 - smoothstep(uNear, uFar, d);
      }`,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vColor; varying float vFog;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, r);
        float a = soft * soft * (0.55 + 0.45 * smoothstep(0.16, 0.0, r));
        vec3 c = vColor * a * vFog * uOpacity * 1.25;
        gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
      }`,
    transparent: true, depthWrite: false, depthTest: false,
    // pure light: colour adds, and alpha = brightness (valid premultiplied output), so a
    // dim particle glows faintly over the page instead of punching an opaque dark dot in it
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
  });
  const mat = makeMat(1);
  const group = new THREE.Group();
  const cloud = new THREE.Points(geo, mat);
  group.add(cloud);
  scene.add(group);

  // deep dust — a second, sparse depth plane so the world never reads as a void
  const ND = PHONE ? 380 : 760, dpos = new Float32Array(ND * 3), dcol = new Float32Array(ND * 3), dsz = new Float32Array(ND);
  for (let i = 0; i < ND; i++) {
    dpos[i * 3] = (rnd() - 0.5) * 30; dpos[i * 3 + 1] = (rnd() - 0.5) * 18; dpos[i * 3 + 2] = -3 - rnd() * 12;
    const b = 0.25 + rnd() * 0.35; dcol[i * 3] = b; dcol[i * 3 + 1] = b * 1.05; dcol[i * 3 + 2] = b * 1.03;
    dsz[i] = 0.05 + rnd() * 0.08;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3).setUsage(THREE.DynamicDrawUsage));
  dgeo.setAttribute("aColor", new THREE.BufferAttribute(dcol, 3));
  dgeo.setAttribute("aSize", new THREE.BufferAttribute(dsz, 1));
  dgeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
  const dmat = makeMat(0.8); dmat.uniforms.uNear.value = 12; dmat.uniforms.uFar.value = 30;
  const dust = new THREE.Points(dgeo, dmat);
  scene.add(dust);


  /* ---------- state ---------- */
  let formName = "helix", blend = 1;
  const want = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, dim: 1 };
  const cur = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, dim: 0 };
  function applyStage(detail, instant) {
    const st = detail && STAGES[detail.stage];
    want.dim = detail && detail.stage === "none" ? 0 : (detail && detail.dim != null ? detail.dim : 1);
    if (!st) return;                              // "none" (paper chapters): keep the form, just fade out
    const v = innerWidth < 740 ? st.m : st.d;
    want.x = v[0]; want.y = v[1]; want.s = v[2]; want.rx = v[3]; want.ry = v[4]; want.rz = v[5];
    if (st.form !== formName) {
      fromP.set(pos); fromC.set(col);
      formName = st.form; blend = instant ? 1 : 0;
    }
    if (instant) Object.assign(cur, want);
  }
  addEventListener("world:stage", (e) => applyStage(e.detail, STILL));
  const initial = window.__stage || { stage: "helix", dim: 1 };
  applyStage(initial, true);
  if (!STILL) cur.dim = 0;                        // fade in from black on load
  FORMS[formName](STILL ? 4 : 0, tgtP, tgtC);
  pos.set(tgtP); col.set(tgtC);

  /* ---------- input ---------- */
  // pointer in CSS pixels (sx, sy) for the screen-space interaction, plus NDC (x, y) for camera parallax
  const pointer = { x: 0, y: 0, sx: -9999, sy: -9999, has: false, speed: 0, burst: 0 };
  const setPointer = (e) => {
    pointer.sx = e.clientX; pointer.sy = e.clientY;
    pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = -((e.clientY / innerHeight) * 2 - 1);
  };
  addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; pointer.has = true; setPointer(e); }, { passive: true });
  addEventListener("pointerdown", (e) => { setPointer(e); pointer.burst = 1; if (e.pointerType !== "touch") pointer.has = true; }, { passive: true });
  document.addEventListener("mouseleave", () => { pointer.has = false; });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const sc = renderer.getPixelRatio() * h * 0.5;
    mat.uniforms.uScale.value = sc; dmat.uniforms.uScale.value = sc;
    if (window.__stage) applyStage(window.__stage, false);
  }
  addEventListener("resize", resize);
  resize();

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  const smooth = (x) => x * x * (3 - 2 * x);
  let agit = 0, first = true, last = 0, lastScroll = scrollY, lastSX = -9999, lastSY = -9999;
  // persistent per-particle displacement: the cursor pushes particles, they drift back with inertia
  const off = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  const mvp = new THREE.Matrix4();

  function frame() {
    const t = STILL ? 4 : clock.getElapsedTime();
    const dt = Math.min(0.05, t - last); last = t;
    const k = STILL ? 1 : 1 - Math.exp(-dt * 2.4);
    cur.x += (want.x - cur.x) * k; cur.y += (want.y - cur.y) * k; cur.s += (want.s - cur.s) * k;
    cur.rx += (want.rx - cur.rx) * k; cur.ry += (want.ry - cur.ry) * k; cur.rz += (want.rz - cur.rz) * k;
    cur.dim += (want.dim - cur.dim) * (STILL ? 1 : 1 - Math.exp(-dt * 3.2));
    mat.uniforms.uOpacity.value = cur.dim; dmat.uniforms.uOpacity.value = cur.dim * 0.8;

    if (cur.dim > 0.004 || first) {
      if (!STILL) blend = Math.min(1, blend + dt / 1.7);
      group.position.set(cur.x, cur.y, 0);
      group.scale.setScalar(cur.s);
      group.rotation.set(cur.rx, cur.ry, cur.rz);

      const px = pointer.has ? pointer.x : Math.sin(t * 0.21) * 0.3, py = pointer.has ? pointer.y : Math.cos(t * 0.17) * 0.2;
      camera.position.x += (px * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (py * 0.45 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // scrolling stirs the whole cloud a little
      const sv = Math.abs(scrollY - lastScroll); lastScroll = scrollY;
      agit += (Math.min(sv * 0.012, 0.5) - agit) * 0.08;

      // exact screen-space interaction: project every particle with the same matrices the GPU uses,
      // so rotation (the tilted helix), scale and perspective are all accounted for
      group.updateMatrixWorld(); camera.updateMatrixWorld();
      mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(group.matrixWorld);
      const M = mvp.elements, G = group.matrixWorld.elements, s2 = cur.s * cur.s, W = innerWidth, H = innerHeight;
      const mdx = pointer.sx - lastSX, mdy = pointer.sy - lastSY; lastSX = pointer.sx; lastSY = pointer.sy;
      pointer.speed += (Math.min(70, Math.hypot(mdx, mdy)) - pointer.speed) * 0.3;
      const R = Math.min(W, H) * (0.17 + pointer.burst * 0.12), R2 = R * R;
      const force = 0.018 * (1 + pointer.speed * 0.07) + pointer.burst * 0.09;
      const interact = !STILL && (pointer.has || pointer.burst > 0.02);
      pointer.burst *= 0.86;

      FORMS[formName](t, tgtP, tgtC);
      const b = blend, live = !STILL;
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        let x, y, z;
        if (b >= 1) { x = tgtP[j]; y = tgtP[j + 1]; z = tgtP[j + 2]; col[j] = tgtC[j]; col[j + 1] = tgtC[j + 1]; col[j + 2] = tgtC[j + 2]; }
        else {
          const ss = smooth(Math.min(1, Math.max(0, (b - stagger[i] * 0.45) / 0.55)));
          const loose = Math.sin(ss * Math.PI) * 1.1;
          x = fromP[j] + (tgtP[j] - fromP[j]) * ss + scat[j] * loose;
          y = fromP[j + 1] + (tgtP[j + 1] - fromP[j + 1]) * ss + scat[j + 1] * loose;
          z = fromP[j + 2] + (tgtP[j + 2] - fromP[j + 2]) * ss + scat[j + 2] * loose;
          col[j] = fromC[j] + (tgtC[j] - fromC[j]) * ss; col[j + 1] = fromC[j + 1] + (tgtC[j + 1] - fromC[j + 1]) * ss; col[j + 2] = fromC[j + 2] + (tgtC[j + 2] - fromC[j + 2]) * ss;
        }
        if (live) {
          if (agit > 0.01) { x += scat[j] * agit; y += scat[j + 1] * agit; z += scat[j + 2] * agit; }
          if (interact) {
            const X = x + off[j], Y = y + off[j + 1], Z = z + off[j + 2];
            const cw = M[3] * X + M[7] * Y + M[11] * Z + M[15];
            if (cw > 0.1) {
              const ddx = ((M[0] * X + M[4] * Y + M[8] * Z + M[12]) / cw * 0.5 + 0.5) * W - pointer.sx;
              const ddy = (0.5 - (M[1] * X + M[5] * Y + M[9] * Z + M[13]) / cw * 0.5) * H - pointer.sy;
              const d2 = ddx * ddx + ddy * ddy;
              if (d2 < R2) {
                const d = Math.sqrt(d2) + 0.5, fall = 1 - d / R, f = force * fall * fall;
                // radial push plus a little swirl, so the cloud parts like smoke instead of a rigid disc
                const ux = ddx / d, uy = -ddy / d, wx = ux - uy * 0.5, wy = uy + ux * 0.5;
                vel[j] += (G[0] * wx + G[1] * wy) / s2 * f;
                vel[j + 1] += (G[4] * wx + G[5] * wy) / s2 * f;
                vel[j + 2] += (G[8] * wx + G[9] * wy) / s2 * f + scat[j + 2] * f * 0.8;
              }
            }
          }
          vel[j] *= 0.87; vel[j + 1] *= 0.87; vel[j + 2] *= 0.87;
          off[j] = off[j] * 0.972 + vel[j]; off[j + 1] = off[j + 1] * 0.972 + vel[j + 1]; off[j + 2] = off[j + 2] * 0.972 + vel[j + 2];
          x += off[j]; y += off[j + 1]; z += off[j + 2];
        }
        pos[j] = x; pos[j + 1] = y; pos[j + 2] = z;
      }
      posAttr.needsUpdate = true; colAttr.needsUpdate = true;

      if (live) {
        const dp = dgeo.attributes.position.array;
        for (let i = 0; i < ND; i++) { dp[i * 3 + 1] += 0.0025 + (i % 7) * 0.0004; if (dp[i * 3 + 1] > 9) dp[i * 3 + 1] = -9; }
        dgeo.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
      if (first) { first = false; dispatchEvent(new Event("world:ready")); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
