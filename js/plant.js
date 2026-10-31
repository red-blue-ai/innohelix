/* InnoHelix — 3D process explorer (the home hero).
   A procedurally built plant at dusk that walks the value chain left to right:
     01 waste yard → 02 pyrolysis → 03 gas fingerprinting → 04 InnoHelix two-stage module
     → 05 process control & syngas → 06 Fischer–Tropsch → 07 SAF storage & refuelling.
   Hero mode: slow camera drift, a few labels. Explore mode (full screen): orbit / zoom,
   step rail, camera fly-to and an info card per step. Everything is geometry made here:
   no model files, no CDN, runs from file:// (needs window.THREE from vendor/three.classic.js). */
(function () {
  "use strict";
  const root = document.getElementById("plant");
  const THREE = window.THREE;
  if (!root || !THREE) return;

  const qs = new URLSearchParams(location.search);
  const STILL = qs.has("still");
  const PHONE = innerWidth < 740;
  const canvas = root.querySelector(".plant__canvas");
  const labelLayer = root.querySelector(".plant__labels");
  const card = root.querySelector(".plant__card");
  const rail = root.querySelector(".plant__rail");

  /* ---------------------------------------------------------------- content */
  const STEPS = [
    { tag: "up", anchor: [-50, 6.5, 6], cam: { t: [-48, 2, 6], d: 46, az: -0.55, el: 0.5 },
      zh: { t: "固废原料", s: "废塑料 · 废轮胎", b: "低值废塑料、废轮胎与混合有机固废在料场打包、破碎，作为热解原料送入装置。", p: [["原料", "废塑料、废轮胎、复合包装"], ["形态", "打包 / 破碎料"]] },
      en: { t: "Waste feedstock", s: "Plastics · tyres", b: "Low-value plastics, tyres and mixed organic waste are baled and shredded in the yard, then fed to pyrolysis.", p: [["Feed", "Plastics, tyres, composite packaging"], ["Form", "Baled / shredded"]] } },
    { tag: "up", anchor: [-32, 11, 2], cam: { t: [-31, 4, 2], d: 44, az: -0.35, el: 0.42 },
      zh: { t: "热解 / 气化", s: "生成复杂热解气", b: "固废在高温、缺氧条件下裂解，生成组分复杂、波动较大的热解气。这是客户现有的上游装置。", p: [["产物", "H₂、CO、CO₂、CH₄、C₂–C₄"], ["杂质", "焦油、S / Cl / N"]] },
      en: { t: "Pyrolysis / gasification", s: "Complex gas out", b: "Waste is cracked at high temperature with little oxygen, giving a complex, fluctuating gas. This is the customer's existing upstream unit.", p: [["Products", "H₂, CO, CO₂, CH₄, C₂–C₄"], ["Impurities", "Tar, S / Cl / N"]] } },
    { tag: "us", anchor: [-17, 6.5, 8], cam: { t: [-17, 2.5, 8], d: 26, az: -0.2, el: 0.38 },
      zh: { t: "成分识别", s: "先看清气体", b: "识别入口热解气的组分与波动，把它转化为催化剂选择与运行参数。", p: [["输出", "催化剂选择、蒸汽碳比"], ["参数", "温度、空速"], ["研究", "Energy & Fuels 37 (2023)"]] },
      en: { t: "Gas fingerprinting", s: "Read the gas first", b: "We identify what is in the inlet gas and how it fluctuates, and turn that into catalyst choice and operating set-points.", p: [["Output", "Catalyst choice, steam-to-carbon"], ["Set-points", "Temperature, space velocity"], ["Research", "Energy & Fuels 37 (2023)"]] } },
    { tag: "us", anchor: [-2, 17, 2], cam: { t: [-1, 6, 2], d: 34, az: -0.28, el: 0.3 },
      zh: { t: "两级催化重整", s: "InnoHelix 升级模块", b: "一段牺牲性床层承接焦油与多环芳烃，保护二段主重整床；二段深度重整，生成高品质合成气。", p: [["一段", "牺牲性焦油预裂解床"], ["二段", "主重整床"], ["效果", "抗中毒、长寿命、高纯度"]] },
      en: { t: "Two-stage reforming", s: "The InnoHelix module", b: "A sacrificial first bed takes the tar and polyaromatics to protect the main bed, which then reforms deeply into quality syngas.", p: [["Stage 1", "Sacrificial pre-reforming bed"], ["Stage 2", "Main reforming bed"], ["Result", "Poison-resistant, long-lived, pure"]] } },
    { tag: "us", anchor: [17, 12, 6], cam: { t: [17, 4, 5], d: 40, az: -0.3, el: 0.42 },
      zh: { t: "过程控制 · 合成气", s: "稳定输出 H₂ + CO", b: "催化剂、反应器与过程控制耦合运行：实时监测、动态调整，在原料波动时输出稳定的合成气中间体。", p: [["监测", "实时工况分析"], ["输出", "H₂ + CO 合成气"], ["研究", "Energy Convers. Manag."]] },
      en: { t: "Control · syngas", s: "Steady H₂ + CO", b: "Catalyst, reactor and control run as one system: real-time monitoring and dynamic adjustment keep the syngas steady when the feed moves.", p: [["Monitoring", "Real-time condition analysis"], ["Output", "H₂ + CO syngas"], ["Research", "Energy Convers. Manag."]] } },
    { tag: "down", anchor: [32, 26, 0], cam: { t: [33, 9, -2], d: 56, az: -0.3, el: 0.34 },
      zh: { t: "费托合成", s: "下游合成装置", b: "稳定的合成气在费托合成中转化为长链烃，再经加工得到航空燃料组分。", p: [["原料", "H₂ + CO 合成气"], ["产物", "长链烃 → 航空燃料组分"]] },
      en: { t: "Fischer–Tropsch synthesis", s: "Downstream unit", b: "Steady syngas is converted into long-chain hydrocarbons by Fischer–Tropsch synthesis, then refined into jet-fuel components.", p: [["Feed", "H₂ + CO syngas"], ["Product", "Long-chain hydrocarbons → jet fuel"]] } },
    { tag: "down", anchor: [54, 10, 6], cam: { t: [54, 3, 14], d: 58, az: -0.42, el: 0.4 },
      zh: { t: "可持续航空燃料", s: "储存与加注", b: "SAF 是长途航空减碳唯一合规的替代液体燃料。欧盟要求 2030 年最低掺混 6%，2050 年 70%。", p: [["欧盟 2030", "6%"], ["欧盟 2050", "70%"], ["2026 全球占比", "0.8%（IATA 预测）"]] },
      en: { t: "Sustainable aviation fuel", s: "Storage and fuelling", b: "SAF is the only compliant drop-in fuel for decarbonising long-haul flight. The EU requires at least 6% by 2030 and 70% by 2050.", p: [["EU 2030", "6%"], ["EU 2050", "70%"], ["2026 global share", "0.8% (IATA forecast)"]] } },
  ];
  const OVERVIEW = { t: [2, 2, 0], d: 140, az: -0.42, el: 0.52 };
  const TAG = { up: ["上游装置", "Upstream"], us: ["InnoHelix", "InnoHelix"], down: ["下游装置", "Downstream"] };

  /* ---------------------------------------------------------------- renderer */
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !PHONE, powerPreference: "high-performance" }); }
  catch (e) { root.classList.add("is-fallback"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, PHONE ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = !PHONE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const FOG = new THREE.Color(0x1a3533);
  scene.fog = new THREE.Fog(FOG, 140, 470);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 1400);

  /* deterministic randomness so ?still screenshots repeat */
  let seed = 7310;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  /* ---------------------------------------------------------------- canvas textures */
  const tex = (w, h, draw, color = true) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const glowTex = tex(128, 128, (g, w) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.18, "rgba(255,255,255,.55)"); r.addColorStop(0.5, "rgba(255,255,255,.12)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  const windowsTex = tex(256, 256, (g) => {
    g.fillStyle = "#26302f"; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const lit = rnd() < 0.45;
      g.fillStyle = lit ? (rnd() < 0.7 ? "#ffd59a" : "#fff1d6") : "#121a19";
      g.fillRect(x * 32 + 6, y * 32 + 9, 20, 15);
    }
  });
  const flowTex = (base, hi) => {
    const t = tex(32, 256, (g) => {
      g.fillStyle = base; g.fillRect(0, 0, 32, 256);
      for (let i = 0; i < 3; i++) {
        const y = i * 86 + 10, gr = g.createLinearGradient(0, y, 0, y + 50);
        gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.75, hi); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.fillRect(0, y, 32, 50);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const FLOW = {
    raw: flowTex("#6b4a33", "rgba(255,170,90,1)"),       // complex pyrolysis gas
    syn: flowTex("#0d4d49", "rgba(110,235,220,1)"),      // upgraded syngas
    saf: flowTex("#6e5a2c", "rgba(255,226,150,1)"),      // fuel
  };
  const baleTex = tex(64, 64, (g) => {
    const pal = ["#5f6e6b", "#7d6650", "#4c6670", "#6f7350", "#8a7d70", "#556160", "#6a5a63"];
    g.fillStyle = "#4a5553"; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 260; i++) { g.fillStyle = pal[(rnd() * pal.length) | 0]; g.fillRect(rnd() * 64, rnd() * 64, 2 + rnd() * 6, 1 + rnd() * 3); }
    g.fillStyle = "rgba(20,24,24,.6)"; g.fillRect(0, 20, 64, 2); g.fillRect(0, 42, 64, 2);
  });
  const screenTex = tex(256, 128, (g) => {
    g.fillStyle = "#06201e"; g.fillRect(0, 0, 256, 128);
    const cols = ["#5fe0d2", "#ffc27a", "#d9f3ef"];
    cols.forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 256; x += 8) { const y = 70 - k * 18 + Math.sin(x * 0.06 + k) * 10 + (rnd() - 0.5) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); });
    g.fillStyle = "rgba(95,224,210,.5)"; for (let i = 0; i < 6; i++) g.fillRect(10 + i * 40, 104, 26, 10);
  });
  const slotTex = tex(256, 64, (g) => {
    g.fillStyle = "#1d1410"; g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "#ff8a3a"); gr.addColorStop(0.5, "#ffd08a"); gr.addColorStop(1, "#ff6a20"); g.fillStyle = gr; g.fillRect(i * 16 + 4, 6, 8, 52); }
  });
  const groundTex = tex(2048, 2048, (g, W) => {
    const S = W / 300, X = (x) => (x + 150) * S, Z = (z) => (z + 150) * S;   // 300×300 world units
    g.fillStyle = "#0f1a19"; g.fillRect(0, 0, W, W);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * W, 2, 2); }
    g.fillStyle = "#18242300";
    g.fillStyle = "#1a2726"; g.fillRect(X(-70), Z(-40), 140 * S, 80 * S);              // plant pad
    g.fillStyle = "#1f2d2c"; g.fillRect(X(36), Z(16), 40 * S, 22 * S);                  // apron
    // roads: perimeter loop + spine
    g.fillStyle = "#0b1312";
    const road = (x, z, w, h) => g.fillRect(X(x), Z(z), w * S, h * S);
    road(-78, -48, 156, 7); road(-78, 41, 156, 7); road(-78, -48, 7, 96); road(71, -48, 7, 96); road(-78, 18, 116, 6);
    g.strokeStyle = "rgba(200,214,210,.55)"; g.lineWidth = 3; g.setLineDash([26, 26]);
    const dash = (x1, z1, x2, z2) => { g.beginPath(); g.moveTo(X(x1), Z(z1)); g.lineTo(X(x2), Z(z2)); g.stroke(); };
    dash(-74, -44.5, 74, -44.5); dash(-74, 44.5, 74, 44.5); dash(-74.5, -44, -74.5, 44); dash(74.5, -44, 74.5, 44); dash(-74, 21, 36, 21);
    g.setLineDash([]); g.strokeStyle = "rgba(200,214,210,.18)"; g.lineWidth = 2;
    for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(X(-34 + i * 3.2), Z(36)); g.lineTo(X(-34 + i * 3.2), Z(40)); g.stroke(); }   // parking
    g.strokeStyle = "rgba(255,214,140,.35)"; g.lineWidth = 4; g.beginPath(); g.moveTo(X(40), Z(34)); g.lineTo(X(72), Z(22)); g.stroke();  // apron taxi line
  });
  groundTex.anisotropy = 8;

  /* ---------------------------------------------------------------- environment + light */
  {
    const envScene = new THREE.Scene();
    const sg = new THREE.SphereGeometry(50, 32, 16);
    const cols = [], pos = sg.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 50; const c = new THREE.Color().lerpColors(new THREE.Color(0x2a3f3c), new THREE.Color(0xa9c2bd), Math.max(0, y)); if (y < 0) c.lerpColors(new THREE.Color(0x2a3f3c), new THREE.Color(0x101716), -y); cols.push(c.r, c.g, c.b); }
    sg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    envScene.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffd2a6 }));
    sun.position.set(-30, 12, -30); envScene.add(sun);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(envScene, 0.04).texture;
    scene.environmentIntensity = 0.75;
  }
  scene.add(new THREE.HemisphereLight(0xa6cbc5, 0x1b2a28, 0.8));
  const sunLight = new THREE.DirectionalLight(0xffd6ae, 1.55);
  sunLight.position.set(-90, 70, -60);
  sunLight.castShadow = !PHONE;
  sunLight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunLight.shadow.camera, { left: -90, right: 90, top: 70, bottom: -70, near: 10, far: 300 });
  sunLight.shadow.bias = -0.0006; sunLight.shadow.normalBias = 0.05;
  scene.add(sunLight);
  const fill = new THREE.DirectionalLight(0x6fa7a0, 0.35); fill.position.set(80, 40, 90); scene.add(fill);

  /* sky dome: forest-dusk gradient with a warm horizon band */
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x07110f) }, mid: { value: new THREE.Color(0x1b3c39) }, hor: { value: new THREE.Color(0x4f6e66) }, warm: { value: new THREE.Color(0xc9925f) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 top, mid, hor, warm; varying vec3 vP;
      void main(){ float y = vP.y; vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, y)); c = mix(c, top, smoothstep(0.16, 0.6, y));
        float w = pow(max(0., dot(normalize(vec3(-0.7, 0., -0.7)), normalize(vec3(vP.x, 0., vP.z)))), 6.) * (1. - smoothstep(0.0, 0.2, abs(y - .02)));
        c = mix(c, warm, w * .55); if (y < 0.) c = mix(hor * .55, vec3(0.04,0.08,0.075), smoothstep(0., -.1, y)); gl_FragColor = vec4(c, 1.); }`,
  })));

  /* ---------------------------------------------------------------- materials */
  const std = (color, rough = 0.45, metal = 0.55, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
  const MAT = {
    steel: std(0xd7dfdc, 0.32, 0.72),
    steelDark: std(0x7d8b88, 0.4, 0.7),
    white: std(0xe9eeec, 0.5, 0.25),
    frame: std(0x2b3837, 0.6, 0.45),
    concrete: std(0x4f5b59, 0.92, 0.02),
    teal: std(0x008780, 0.42, 0.35),
    rail: std(0xc9a14a, 0.5, 0.5),
    dark: std(0x1a2423, 0.7, 0.3),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fd9d2, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }),
    windows: std(0xffffff, 0.6, 0.1, { map: windowsTex, emissiveMap: windowsTex, emissive: 0xffffff, emissiveIntensity: 0.62 }),
    screen: std(0x0a1f1d, 0.3, 0.2, { emissiveMap: screenTex, emissive: 0xffffff, emissiveIntensity: 1.1 }),
    slots: std(0x1d1410, 0.6, 0.2, { emissiveMap: slotTex, emissive: 0xffffff, emissiveIntensity: 1.6 }),
    bale: std(0xffffff, 0.95, 0.0, { map: baleTex }),
  };
  const flowMat = (k) => std(0xffffff, 0.35, 0.3, { map: FLOW[k], emissiveMap: FLOW[k], emissive: 0xffffff, emissiveIntensity: 0.9 });
  const FLOWMAT = { raw: flowMat("raw"), syn: flowMat("syn"), saf: flowMat("saf") };

  /* ---------------------------------------------------------------- builders */
  const world = new THREE.Group(); scene.add(world);
  const units = STEPS.map(() => { const g = new THREE.Group(); world.add(g); return g; });
  const shadowy = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, opts = {}) => {
    const m = shadowy(new THREE.Mesh(geo, mat), opts.cast !== false, opts.recv !== false);
    m.position.set(x, y, z);
    if (opts.rx) m.rotation.x = opts.rx; if (opts.ry) m.rotation.y = opts.ry; if (opts.rz) m.rotation.z = opts.rz;
    parent.add(m); return m;
  };
  const glow = (parent, x, y, z, size, color, opacity = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.set(x, y, z); s.scale.setScalar(size); parent.add(s); return s;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r, h, seg = 24, r2) => new THREE.CylinderGeometry(r2 == null ? r : r2, r, h, seg);
  /* vessel: cylinder + dome + optional legs */
  const vessel = (parent, x, z, r, h, base = 0, mat = MAT.steel, bands = 3) => {
    add(parent, cyl(r, h, 32), mat, x, base + h / 2, z);
    add(parent, new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, base + h, z);
    for (let i = 1; i <= bands; i++) add(parent, new THREE.TorusGeometry(r * 1.01, 0.09, 6, 40), MAT.teal, x, base + (h * i) / (bands + 1), z, { rx: Math.PI / 2, cast: false });
    if (base > 0) for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.6; add(parent, cyl(0.16, base, 8), MAT.frame, x + Math.cos(a) * r * 0.75, base / 2, z + Math.sin(a) * r * 0.75); }
  };
  const platforms = (parent, x, z, r, ys) => ys.forEach((y) => {
    add(parent, cyl(r + 1.1, 0.12, 32), MAT.frame, x, y, z, { cast: false });
    add(parent, new THREE.TorusGeometry(r + 1.05, 0.04, 4, 40), MAT.rail, x, y + 0.9, z, { rx: Math.PI / 2, cast: false });
  });
  /* pipe through points, straight segments; flow material stripes run along the length */
  const pipe = (parent, pts, r, mat) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = new THREE.Vector3(...pts[i]), b = new THREE.Vector3(...pts[i + 1]), len = a.distanceTo(b);
      const geo = cyl(r, len, 10);
      const uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, uv.getY(k) * len / 5);
      const m = add(parent, geo, mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, { cast: false });
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      if (i > 0) add(parent, new THREE.SphereGeometry(r * 1.05, 10, 8), mat, a.x, a.y, a.z, { cast: false });
    }
  };
  const building = (parent, x, z, w, h, d, ry = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    const wm = MAT.windows.clone(); wm.map = windowsTex.clone(); wm.map.wrapS = wm.map.wrapT = THREE.RepeatWrapping; wm.map.repeat.set(w / 9, h / 6.5); wm.map.needsUpdate = true; wm.emissiveMap = wm.map;
    const sides = [wm, wm, MAT.dark, MAT.dark, wm, wm];
    add(g, box(w, h, d), sides, 0, h / 2, 0);
    add(g, box(w + 0.3, 0.4, d + 0.3), MAT.frame, 0, h + 0.2, 0);
    for (let i = 0; i < 3; i++) add(g, box(1.6, 0.9, 1.4), MAT.steelDark, -w / 3 + i * (w / 3), h + 0.85, (rnd() - 0.5) * (d - 2));
    return g;
  };

  /* ---------------------------------------------------------------- ground, backdrop */
  add(world, new THREE.PlaneGeometry(300, 300), std(0xffffff, 0.95, 0, { map: groundTex }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  add(world, new THREE.PlaneGeometry(2600, 2600), std(0x0c1514, 1, 0), 0, -0.05, 0, { rx: -Math.PI / 2, cast: false, recv: false });
  // mountains (two silhouettes) and far city lights
  [[-300, 0x10211f, 70, 0.012], [-380, 0x0c1a19, 110, 0.007]].forEach(([z, col, hgt, f]) => {
    const sh = new THREE.Shape(); sh.moveTo(-1200, -5);
    for (let x = -1200; x <= 1200; x += 20) sh.lineTo(x, Math.max(4, hgt * (0.45 + 0.35 * Math.sin(x * f) + 0.2 * Math.sin(x * f * 3.7 + 1.3))));
    sh.lineTo(1200, -5);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: col, fog: true }));
    m.position.set(0, 0, z); world.add(m);
  });
  {
    const n = PHONE ? 700 : 1600, p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const cluster = rnd() < 0.7, cx = cluster ? (rnd() < 0.5 ? -220 : 160) : 0;
      p[i * 3] = cx + (rnd() - 0.5) * (cluster ? 220 : 900); p[i * 3 + 1] = 0.5 + rnd() * (cluster ? 6 : 2); p[i * 3 + 2] = -150 - rnd() * 130;
      const warm = rnd() < 0.7; c[i * 3] = warm ? 1 : 0.85; c[i * 3 + 1] = warm ? 0.8 : 0.92; c[i * 3 + 2] = warm ? 0.55 : 1;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    world.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false })));
  }

  /* ---------------------------------------------------------------- 01 waste yard */
  {
    const u = units[0], X = -50, Z = 6;
    const nb = 7 * 4 * 3, bales = new THREE.InstancedMesh(box(2.2, 1.3, 1.5), MAT.bale, nb);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    let k = 0;
    for (let row = 0; row < 4; row++) for (let c = 0; c < 7; c++) for (let lvl = 0; lvl < 3; lvl++) {
      if (lvl === 2 && rnd() < 0.35) { m4.makeScale(0, 0, 0); bales.setMatrixAt(k++, m4); continue; }
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rnd() - 0.5) * 0.12);
      m4.compose(new THREE.Vector3(X - 8 + c * 2.35 + (rnd() - 0.5) * 0.2, 0.65 + lvl * 1.32, Z - 4 + row * 2.6 + (rnd() - 0.5) * 0.3), q, new THREE.Vector3(1, 1, 1));
      bales.setMatrixAt(k, m4); bales.setColorAt(k, col.setHSL(0.1 + rnd() * 0.5, 0.12 + rnd() * 0.1, 0.55 + rnd() * 0.25)); k++;
    }
    shadowy(bales); u.add(bales);
    // shredder hopper + inclined conveyor to the kiln inlet
    add(u, box(4, 3, 3.4), MAT.steelDark, X + 9, 1.5, Z - 3);
    add(u, cyl(1.8, 2.2, 4, 1.2), MAT.steel, X + 9, 4.1, Z - 3, { ry: Math.PI / 4 });
    const conv = add(u, box(1.4, 0.35, 14), MAT.frame, X + 13.2, 4.6, Z - 3, { ry: Math.PI / 2 });
    conv.rotation.z = 0.32;
    // loader truck
    add(u, box(3.2, 1.6, 1.8), MAT.teal, X - 12, 0.9, Z + 9);
    add(u, box(1.4, 1.2, 1.7), MAT.white, X - 10.2, 1.9, Z + 9);
    glow(u, X - 9.4, 1.4, Z + 9.9, 2.2, 0xfff1d0, 0.9);
  }

  /* ---------------------------------------------------------------- 02 pyrolysis */
  {
    const u = units[1], X = -32, Z = 2;
    const kiln = add(u, cyl(2.4, 17, 36), MAT.steelDark, X, 5.6, Z, { rz: Math.PI / 2 - 0.04 });
    for (let i = -1; i <= 1; i++) {
      add(u, new THREE.TorusGeometry(2.55, 0.28, 8, 40), MAT.steel, X + i * 6, 5.6 + i * 0.24, Z, { ry: Math.PI / 2 });
      add(u, box(1.6, 3.4, 4.2), MAT.concrete, X + i * 6, 1.7, Z);
    }
    // hot section: glowing slots of the firebox under the kiln
    const fb = add(u, box(9, 2.4, 5.6), [MAT.dark, MAT.dark, MAT.dark, MAT.dark, MAT.slots, MAT.dark], X, 1.2 + 1.9, Z);
    fb.position.y = 2.2;
    for (let i = 0; i < 4; i++) glow(u, X - 3.4 + i * 2.3, 2.3, Z + 3.1, 3.2, 0xff8a3a, 0.7);
    const kilnGlow = new THREE.PointLight(0xff8840, 30, 22, 1.6); kilnGlow.position.set(X, 2.8, Z + 4.5); u.add(kilnGlow);
    // cyclone + quench tower, stack
    vessel(u, X + 11, Z - 3, 1.3, 7, 2.5, MAT.steel, 2);
    add(u, cyl(0.2, 2.5, 8, 1.3), MAT.steel, X + 11, 1.25, Z - 3);
    add(u, cyl(0.9, 26, 16, 0.75), MAT.white, X - 4, 13, Z - 8);
    for (let i = 0; i < 3; i++) add(u, cyl(0.93, 1.2, 16, 0.9), MAT.steelDark, X - 4, 21 + i * 2.2, Z - 8, { cast: false });
    pipe(u, [[X + 8.6, 6.2, Z], [X + 11, 6.2, Z], [X + 11, 9.5, Z - 3]], 0.45, MAT.steel);
    u.userData.kiln = kiln;
  }

  /* ---------------------------------------------------------------- 03 gas fingerprinting */
  {
    const u = units[2], X = -17, Z = 8;
    add(u, box(5.6, 3.2, 3.6), MAT.white, X, 1.6, Z);
    add(u, box(5.7, 0.35, 3.7), MAT.teal, X, 2.6, Z);
    add(u, box(3.6, 1.5, 0.1), MAT.screen, X - 0.4, 1.7, Z + 1.85, { cast: false });
    glow(u, X - 0.4, 1.7, Z + 2.4, 5, 0x5fe0d2, 0.35);
    for (let i = 0; i < 5; i++) add(u, cyl(0.07, 2.4, 6), MAT.steel, X + 2.1 + (i % 3) * 0.3, 1.2, Z - 1.2 + i * 0.5, { cast: false });
    add(u, cyl(0.05, 3, 6), MAT.steelDark, X - 2.4, 4.7, Z - 1.2);
    vessel(u, X + 5, Z - 4, 1, 6.5, 0.8, MAT.steel, 2);
    pipe(u, [[X + 2.8, 1.8, Z - 0.6], [X + 4, 1.8, Z - 0.6], [X + 4, 6.6, Z - 10], [X + 4, 6.6, Z - 18]], 0.12, MAT.steelDark);
  }

  /* ---------------------------------------------------------------- 04 InnoHelix module */
  const beds = [];
  {
    const u = units[3], X = -2, Z = 2;
    add(u, box(20, 0.7, 11), MAT.frame, X, 0.35, Z);
    const beam = box(0.35, 0.35, 11);
    for (let i = 0; i < 6; i++) add(u, beam, MAT.steelDark, X - 9.6 + i * 3.84, 0.9, Z, { cast: false });
    // highlight decal under the skid
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(26, 17), new THREE.MeshBasicMaterial({
      map: tex(256, 168, (g) => { g.strokeStyle = "rgba(95,224,210,.95)"; g.lineWidth = 5; g.shadowColor = "rgba(95,224,210,1)"; g.shadowBlur = 14; g.beginPath(); g.roundRect(14, 14, 228, 140, 24); g.stroke(); }),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
    decal.rotation.x = -Math.PI / 2; decal.position.set(X, 0.06, Z); u.add(decal); u.userData.decal = decal;
    // two reactors with a cut-away window onto the catalyst bed
    [[X - 4.6, 0xffa64a, 0], [X + 0.6, 0x5fe0d2, 1]].forEach(([rx, color, stage]) => {
      const r = 1.95, base = 2.2, h = 12, z = Z - 0.5;
      const shell = add(u, new THREE.CylinderGeometry(r, r, h, 40, 1, true, Math.PI * 0.18, Math.PI * 1.64), MAT.steel, rx, base + h / 2, z);
      shell.material = MAT.steel.clone(); shell.material.side = THREE.DoubleSide;
      add(u, new THREE.CylinderGeometry(r * 0.99, r * 0.99, h, 20, 1, true, -Math.PI * 0.18, Math.PI * 0.36), MAT.glass, rx, base + h / 2, z, { cast: false, recv: false });
      add(u, new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.steel, rx, base + h, z);
      add(u, new THREE.ConeGeometry(r, 1.6, 32, 1, true), MAT.steel, rx, base - 0.8, z, { rx: Math.PI });
      [0.18, 0.5, 0.82].forEach((f) => add(u, new THREE.TorusGeometry(r * 1.02, 0.12, 6, 48), MAT.teal, rx, base + h * f, z, { rx: Math.PI / 2, cast: false }));
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; add(u, cyl(0.16, base, 8), MAT.frame, rx + Math.cos(a) * 1.4, base / 2, z + Math.sin(a) * 1.4); }
      // packed pellets (quantized lattice reads as engineered catalyst)
      const pts = [];
      for (let y = base + 1.2; y < base + h - 1.2; y += 0.34) for (let a = 0; a < 1; a += 1) for (let rr = 0.25; rr < r - 0.25; rr += 0.36) {
        const ring = Math.max(1, Math.round((Math.PI * 2 * rr) / 0.36));
        for (let s = 0; s < ring; s++) { const th = (s / ring) * Math.PI * 2 + y * 3; pts.push([rx + Math.cos(th) * rr, y, z + Math.sin(th) * rr]); }
      }
      const pm = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.5, metalness: 0.1 });
      const inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.15, 0), pm, pts.length);
      const m4 = new THREE.Matrix4();
      pts.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); inst.setMatrixAt(i, m4); });
      u.add(inst);
      const light = new THREE.PointLight(color, 18, 9, 1.8); light.position.set(rx, base + h / 2, z + 1.2); u.add(light);
      const halo = glow(u, rx, base + h / 2, z + r + 0.4, 9, color, 0.32);
      beds.push({ pm, light, halo, stage });
    });
    // heat exchanger + cabinet + interconnects
    add(u, cyl(1.05, 7, 28), MAT.steel, X + 5.6, 2.6, Z + 2.6, { rz: Math.PI / 2 });
    for (let i = -1; i <= 1; i += 2) { add(u, new THREE.TorusGeometry(1.12, 0.14, 6, 30), MAT.steelDark, X + 5.6 + i * 3.4, 2.6, Z + 2.6, { ry: Math.PI / 2 }); add(u, box(0.4, 1.6, 2), MAT.frame, X + 5.6 + i * 2.6, 1.3, Z + 2.6); }
    add(u, box(2.2, 3.2, 1.2), MAT.white, X + 8.4, 2.3, Z - 3.4);
    add(u, box(1.6, 1.1, 0.06), MAT.screen, X + 8.4, 2.7, Z - 2.77, { cast: false });
    pipe(u, [[X - 4.6, 16.4, Z - 0.5], [X - 4.6, 17.4, Z - 0.5], [X + 0.6, 17.4, Z - 0.5], [X + 0.6, 16.4, Z - 0.5]], 0.34, FLOWMAT.raw);
    pipe(u, [[X + 0.6, 1.2, Z - 0.5], [X + 0.6, 1.2, Z + 2.6], [X + 2.1, 2.6, Z + 2.6]], 0.3, FLOWMAT.syn);
    pipe(u, [[X + 9.1, 2.6, Z + 2.6], [X + 10.4, 2.6, Z + 2.6], [X + 10.4, 7.4, Z - 10.6]], 0.3, FLOWMAT.syn);
    pipe(u, [[X - 4.6, 7.4, Z - 10.6], [X - 4.6, 7.4, Z - 3], [X - 4.6, 1.2, Z - 3], [X - 4.6, 1.2, Z - 0.5]], 0.3, FLOWMAT.raw);
  }

  /* ---------------------------------------------------------------- 05 control + syngas */
  {
    const u = units[4], X = 16, Z = 8;
    building(u, X - 2, Z + 5, 10, 5, 7);
    add(u, box(10.1, 0.5, 0.2), MAT.teal, X - 2, 4.1, Z + 8.55, { cast: false });
    add(u, cyl(0.06, 5, 6), MAT.steelDark, X + 2.6, 9, Z + 6);
    glow(u, X + 2.6, 11.5, Z + 6, 1.2, 0xff5a4a, 0.9);
    // spherical syngas holder on legs with a catwalk
    const R = 4.6, cy = 7.2, sz = Z - 8;
    add(u, new THREE.SphereGeometry(R, 40, 24), MAT.white, X + 2, cy, sz);
    add(u, new THREE.TorusGeometry(R * 1.04, 0.12, 6, 48), MAT.teal, X + 2, cy, sz, { rx: Math.PI / 2, cast: false });
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(u, cyl(0.18, cy, 8), MAT.steelDark, X + 2 + Math.cos(a) * R * 0.86, cy / 2, sz + Math.sin(a) * R * 0.86); }
    // compressor shed
    add(u, box(6, 3, 4), MAT.steelDark, X + 10, 1.5, Z - 6);
    add(u, box(6.2, 0.3, 4.2), MAT.frame, X + 10, 3.1, Z - 6);
  }

  /* ---------------------------------------------------------------- 06 Fischer–Tropsch */
  const steamSources = [];
  {
    const u = units[5], X = 32, Z = 0;
    vessel(u, X - 2, Z, 2.7, 22, 1.2, MAT.steel, 4);
    platforms(u, X - 2, Z, 2.7, [6, 11, 16, 21]);
    add(u, box(0.5, 22, 0.25), MAT.frame, X - 2, 12, Z + 3.2, { cast: false });
    vessel(u, X + 6, Z - 5, 1.5, 30, 0.8, MAT.steel, 5);
    platforms(u, X + 6, Z - 5, 1.5, [8, 15, 22, 29]);
    // air-cooler bank
    add(u, box(11, 0.6, 5), MAT.frame, X + 2, 6, Z + 10);
    for (let i = 0; i < 4; i++) { add(u, cyl(1.1, 0.3, 20), MAT.steelDark, X - 2 + i * 2.7, 6.45, Z + 10, { cast: false }); }
    for (let i = 0; i < 4; i++) add(u, cyl(0.15, 6, 6), MAT.frame, X - 3 + (i % 2) * 10, 3, Z + 8 + Math.floor(i / 2) * 4);
    // cooling towers (hyperbolic lathe) with steam
    const prof = []; for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(6.2 - 2.6 * Math.sin(t * Math.PI * 0.62) + t * 0.6, t * 17)); }
    [[X - 10, Z - 24], [X + 4, Z - 24]].forEach(([cx, cz]) => {
      const m = add(u, new THREE.LatheGeometry(prof, 40), MAT.concrete, cx, 0, cz);
      m.material = MAT.concrete.clone(); m.material.side = THREE.DoubleSide;
      steamSources.push({ x: cx, y: 17.2, z: cz, r: 4, n: PHONE ? 26 : 46, big: true });
    });
  }

  /* ---------------------------------------------------------------- 07 SAF storage + aircraft + flare */
  const flame = [];
  {
    const u = units[6], X = 54, Z = 2;
    [[X - 5, Z - 6], [X + 6, Z - 6], [X + 0.5, Z + 5]].forEach(([tx, tz]) => {
      add(u, cyl(4.4, 8, 40), MAT.white, tx, 4, tz);
      add(u, cyl(4.5, 0.4, 40, 4.1), MAT.steelDark, tx, 8.2, tz);
      add(u, new THREE.TorusGeometry(4.45, 0.08, 6, 48), MAT.teal, tx, 6.6, tz, { rx: Math.PI / 2, cast: false });
    });
    add(u, box(26, 0.8, 0.4), MAT.concrete, X + 0.5, 0.4, Z - 13); add(u, box(26, 0.8, 0.4), MAT.concrete, X + 0.5, 0.4, Z + 11);
    add(u, box(0.4, 0.8, 24), MAT.concrete, X - 12.5, 0.4, Z - 1); add(u, box(0.4, 0.8, 24), MAT.concrete, X + 13.5, 0.4, Z - 1);
    // aircraft on the apron
    const ac = new THREE.Group(); ac.position.set(X + 4, 0, Z + 24); ac.rotation.y = -0.38; u.add(ac);
    add(ac, cyl(1.35, 17, 24), MAT.white, 0, 3.1, 0, { rx: Math.PI / 2 });
    add(ac, new THREE.SphereGeometry(1.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.white, 0, 3.1, 8.5, { rx: Math.PI / 2 });
    add(ac, new THREE.ConeGeometry(1.35, 4.5, 24), MAT.white, 0, 3.4, -10.7, { rx: -Math.PI / 2 });
    const wingShape = new THREE.Shape(); wingShape.moveTo(0, 1.6); wingShape.lineTo(9, -2.6); wingShape.lineTo(9, -3.6); wingShape.lineTo(0, -1.8); wingShape.lineTo(0, 1.6);
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.22, bevelEnabled: false });
    const wingMat = MAT.white.clone(); wingMat.side = THREE.DoubleSide;
    [1, -1].forEach((sd) => {
      const w = add(ac, wingGeo, wingMat, 0.6 * sd, 2.7, 1.2, { rx: Math.PI / 2 }); w.scale.x = sd;
      add(ac, cyl(0.55, 2.8, 16), MAT.steelDark, 3.6 * sd, 1.9, 1.0, { rx: Math.PI / 2 });
      const tw = add(ac, wingGeo, wingMat, 0.3 * sd, 3.6, -9.6, { rx: Math.PI / 2 }); tw.scale.set(0.38 * sd, 0.38, 1);
    });
    const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(3.4, 0); fin.lineTo(1.2, 4.2); fin.lineTo(-0.2, 4.2); fin.lineTo(0, 0);
    add(ac, new THREE.ExtrudeGeometry(fin, { depth: 0.2, bevelEnabled: false }), MAT.teal, -0.1, 3.9, -12.2, { ry: -Math.PI / 2 });
    add(ac, cyl(0.12, 2, 6), MAT.frame, 0, 1, 6); add(ac, cyl(0.14, 2, 6), MAT.frame, 1.8, 1, 0); add(ac, cyl(0.14, 2, 6), MAT.frame, -1.8, 1, 0);
    glow(ac, 9.6, 2.7, -2.4, 1.4, 0x4cff8a, 0.9); glow(ac, -9.6, 2.7, -2.4, 1.4, 0xff4a4a, 0.9);
    // fuel truck
    const tr = new THREE.Group(); tr.position.set(X - 6, 0, Z + 26); tr.rotation.y = 0.9; u.add(tr);
    add(tr, box(2.2, 1.8, 2), MAT.teal, 0, 1.3, 2.6);
    add(tr, cyl(1, 5.2, 18), MAT.steel, 0, 1.7, -0.6, { rx: Math.PI / 2 });
    glow(tr, 0, 1.2, 3.8, 2.2, 0xfff1d0, 0.8);
    // flare stack (lattice) behind the tank farm
    const F = new THREE.Group(); F.position.set(X - 12, 0, Z - 30); u.add(F);
    add(F, cyl(0.35, 34, 10), MAT.steelDark, 0, 17, 0);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = add(F, cyl(0.12, 34.5, 6), MAT.frame, Math.cos(a) * 1.6, 17, Math.sin(a) * 1.6); leg.rotation.z = Math.cos(a) * 0.045; leg.rotation.x = -Math.sin(a) * 0.045; }
    for (let y = 3; y < 33; y += 3) add(F, new THREE.TorusGeometry(1.6 - y * 0.035, 0.06, 4, 3), MAT.frame, 0, y, 0, { rx: Math.PI / 2, cast: false });
    [[3.6, 0xffb35c, 0.95], [2.4, 0xffe2a8, 1], [6.5, 0xff7a2a, 0.45]].forEach(([s, c, o]) => flame.push(glow(F, 0, 35.2, 0, s, c, o)));
    const fl = new THREE.PointLight(0xff9a48, 40, 60, 1.5); fl.position.set(0, 35, 0); F.add(fl); flame.push(fl);
    steamSources.push({ x: X - 12, y: 37, z: Z - 30, r: 0.6, n: 14, big: false });
  }

  /* ---------------------------------------------------------------- pipe rack + process streams */
  {
    const posts = new THREE.InstancedMesh(box(0.4, 6.6, 0.4), MAT.frame, 64), beams = new THREE.InstancedMesh(box(0.3, 0.3, 3.6), MAT.steelDark, 32);
    const m4 = new THREE.Matrix4(); let p = 0, b = 0;
    for (let x = -36; x <= 50 && b < 32; x += 6) {
      m4.makeTranslation(x, 3.3, -9); posts.setMatrixAt(p++, m4); m4.makeTranslation(x, 3.3, -12.4); posts.setMatrixAt(p++, m4);
      m4.makeTranslation(x, 6.6, -10.7); beams.setMatrixAt(b++, m4);
    }
    posts.count = p; beams.count = b; shadowy(posts); shadowy(beams); world.add(posts, beams);
    pipe(world, [[-36, 7.1, -9.6], [-6.6, 7.1, -9.6]], 0.42, FLOWMAT.raw);
    pipe(world, [[8.4, 7.4, -10.6], [30, 7.4, -10.6], [30, 7.4, -3], [30, 3, -3]], 0.4, FLOWMAT.syn);
    pipe(world, [[36, 7.1, -11.8], [49, 7.1, -11.8], [49, 7.1, -6], [49, 3, -6]], 0.36, FLOWMAT.saf);
    pipe(world, [[-36, 7.6, -11.4], [50, 7.6, -11.4]], 0.24, MAT.steel);
    pipe(world, [[-36, 7.0, -12.4], [50, 7.0, -12.4]], 0.3, MAT.steelDark);
    pipe(world, [[-21, 7.1, -9.6], [-21, 7.1, -2], [-19, 3, 4]], 0.32, FLOWMAT.raw);
    pipe(world, [[-31, 9.5, -1], [-36, 9.5, -1], [-36, 7.1, -9.6]], 0.42, FLOWMAT.raw);
  }

  /* ---------------------------------------------------------------- offices, lamps, cars */
  building(world, -48, -34, 12, 7, 8); building(world, -33, -36, 9, 5, 7); building(world, -62, -14, 10, 5, 12, Math.PI / 2); building(world, 62, -32, 9, 6, 9);
  building(world, -38, 31, 18, 4, 8); building(world, -16, 31, 10, 3.5, 7);
  {
    const parked = new THREE.InstancedMesh(box(1.7, 1.1, 3.4), MAT.steelDark, 22), m4 = new THREE.Matrix4(), cc = new THREE.Color();
    for (let i = 0; i < 22; i++) { m4.makeTranslation(-4 + (i % 11) * 3.2, 0.55, 30 + Math.floor(i / 11) * 5.6); parked.setMatrixAt(i, m4); parked.setColorAt(i, cc.setHSL(0.45, 0.05, 0.3 + rnd() * 0.5)); }
    shadowy(parked); world.add(parked);
  }
  const lamps = [];
  for (let x = -70; x <= 70; x += 14) [[x, 39.5], [x, -39.5]].forEach(([lx, lz]) => lamps.push([lx, lz]));
  for (let z = -30; z <= 30; z += 15) [[-70.5, z], [70.5, z]].forEach(([lx, lz]) => lamps.push([lx, lz]));
  {
    const poles = new THREE.InstancedMesh(cyl(0.1, 6, 6), MAT.frame, lamps.length), m4 = new THREE.Matrix4();
    lamps.forEach(([x, z], i) => { m4.makeTranslation(x, 3, z); poles.setMatrixAt(i, m4); glow(world, x, 6.1, z, 4.2, 0xffd9a0, 0.75); });
    world.add(poles);
  }
  const cars = [];
  {
    // perimeter road as plain segments (CurvePath.getPointAt can return null at u≈1)
    const P = [[-74.5, -44.5], [74.5, -44.5], [74.5, 44.5], [-74.5, 44.5], [-74.5, -44.5]];
    const segs = []; let total = 0;
    for (let i = 0; i < P.length - 1; i++) { const [x1, z1] = P[i], [x2, z2] = P[i + 1], len = Math.hypot(x2 - x1, z2 - z1); segs.push({ x1, z1, dx: (x2 - x1) / len, dz: (z2 - z1) / len, len, at: total }); total += len; }
    const loop = { at(u) { let d = (((u % 1) + 1) % 1) * total; for (const sg of segs) { if (d <= sg.len) return { x: sg.x1 + sg.dx * d, z: sg.z1 + sg.dz * d, dx: sg.dx, dz: sg.dz }; d -= sg.len; } const sg = segs[0]; return { x: sg.x1, z: sg.z1, dx: sg.dx, dz: sg.dz }; } };
    const n = PHONE ? 4 : 8;
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group(); world.add(g);
      const truck = i % 3 === 0;
      add(g, box(truck ? 2 : 1.7, truck ? 2 : 1.2, truck ? 5.5 : 3.6), truck ? MAT.white : (i % 2 ? MAT.steelDark : MAT.teal), 0, truck ? 1.3 : 0.8, 0);
      glow(g, 0, 0.9, truck ? 2.9 : 1.9, 2.4, 0xfff4dc, 0.9); glow(g, 0, 0.9, truck ? -2.9 : -1.9, 1.4, 0xff4030, 0.8);
      cars.push({ g, loop, off: i / n, speed: 0.012 + (i % 3) * 0.003, lane: i % 2 ? 1.5 : -1.5 });
    }
  }

  /* ---------------------------------------------------------------- steam */
  const steam = [];
  {
    const smokeTex = tex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,.9)"); r.addColorStop(0.6, "rgba(255,255,255,.25)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    steamSources.push({ x: -36, y: 26.5, z: -6, r: 0.6, n: 18, big: false }); // kiln stack
    steamSources.forEach((s) => {
      for (let i = 0; i < s.n; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xdfe8e6, transparent: true, depthWrite: false, opacity: 0, fog: true }));
        world.add(sp);
        steam.push({ sp, s, ph: rnd(), ang: rnd() * Math.PI * 2, rad: rnd() * s.r });
      }
    });
  }

  /* ---------------------------------------------------------------- labels */
  const labels = STEPS.map((st, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "plabel plabel--" + st.tag; b.dataset.step = i;
    b.innerHTML = `<i>${String(i + 1).padStart(2, "0")}</i><span><b><span lang="zh-CN">${st.zh.t}</span><span lang="en">${st.en.t}</span></b><small><span lang="zh-CN">${st.zh.s}</span><span lang="en">${st.en.s}</span></small></span>`;
    labelLayer.appendChild(b);
    b.addEventListener("click", (e) => { e.stopPropagation(); if (!explore) enter(i); else select(i); });
    return { el: b, p: new THREE.Vector3(...st.anchor), hero: i === 1 || i === 3 || i === 6 };
  });

  /* rail: overview first, then the seven steps */
  { const li = document.createElement("li"); li.innerHTML = `<button type="button" data-step="-1" class="is-active"><i>◎</i><span><span lang="zh-CN">工艺全景</span><span lang="en">Overview</span></span></button>`; rail.appendChild(li); }
  STEPS.forEach((st, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" data-step="${i}"><i>${String(i + 1).padStart(2, "0")}</i><span><span lang="zh-CN">${st.zh.t}</span><span lang="en">${st.en.t}</span></span></button>`;
    rail.appendChild(li);
  });
  rail.addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (!b) return; const i = +b.dataset.step; i < 0 ? overview() : select(i); });

  function fillCard(i) {
    if (i < 0) { card.classList.remove("is-on"); return; }
    const st = STEPS[i], t = TAG[st.tag];
    const params = (L) => st[L].p.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    card.innerHTML = `
      <div class="pcard__top"><i>${String(i + 1).padStart(2, "0")}</i><span class="pcard__tag pcard__tag--${st.tag}"><span lang="zh-CN">${t[0]}</span><span lang="en">${t[1]}</span></span></div>
      <h3><span lang="zh-CN">${st.zh.t}</span><span lang="en">${st.en.t}</span></h3>
      <p><span lang="zh-CN">${st.zh.b}</span><span lang="en">${st.en.b}</span></p>
      <dl lang="zh-CN">${params("zh")}</dl><dl lang="en">${params("en")}</dl>
      <div class="pcard__nav"><button type="button" data-go="${i - 1}" ${i === 0 ? "disabled" : ""} aria-label="previous">←</button><button type="button" data-go="${i + 1}" ${i === STEPS.length - 1 ? "disabled" : ""} aria-label="next">→</button></div>`;
    card.classList.remove("is-on"); void card.offsetWidth; card.classList.add("is-on");
  }
  card.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) select(+b.dataset.go); });

  /* ---------------------------------------------------------------- camera rig */
  const rig = { t: new THREE.Vector3(...OVERVIEW.t), d: OVERVIEW.d, az: OVERVIEW.az, el: OVERVIEW.el, ox: -0.13, oy: 0 };
  let tween = null, explore = false, active = -1, userMoved = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function flyTo(c, dur = 1.5) {
    if (STILL) { rig.t.set(...c.t); rig.d = c.d; rig.az = c.az; rig.el = c.el; tween = null; return; }
    tween = { from: { t: rig.t.clone(), d: rig.d, az: rig.az, el: rig.el }, to: { t: new THREE.Vector3(...c.t), d: c.d, az: c.az, el: c.el }, t0: performance.now(), dur: dur * 1000 };
  }
  function select(i) {
    if (i < 0 || i >= STEPS.length) return;
    active = i; flyTo(STEPS[i].cam); fillCard(i);
    labels.forEach((l, k) => l.el.classList.toggle("is-active", k === i));
    rail.querySelectorAll("[data-step]").forEach((b) => b.classList.toggle("is-active", +b.dataset.step === i));
    const on = rail.querySelector(".is-active"); if (on && explore) on.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
  function overview() {
    active = -1; flyTo(OVERVIEW); fillCard(-1);
    labels.forEach((l) => l.el.classList.remove("is-active"));
    rail.querySelectorAll("[data-step]").forEach((b) => b.classList.toggle("is-active", +b.dataset.step === -1));
  }

  /* ---------------------------------------------------------------- explore mode */
  // explore lifts the plant out of the page (any transformed ancestor would trap position:fixed)
  const home = { parent: root.parentNode, next: root.nextSibling };
  function enter(step) {
    if (root.parentNode !== document.body) document.body.appendChild(root);
    explore = true; root.classList.add("is-explore"); document.documentElement.classList.add("plant-lock");
    resize();
    if (typeof step === "number") select(step); else overview();
    running || loop();
  }
  function exit() {
    explore = false; root.classList.remove("is-explore"); document.documentElement.classList.remove("plant-lock");
    home.parent.insertBefore(root, home.next);
    overview(); resize();
  }
  root.querySelector(".plant__enter").addEventListener("click", () => enter());
  root.querySelector(".plant__close").addEventListener("click", exit);
  addEventListener("keydown", (e) => {
    if (!explore) return;
    if (e.key === "Escape") exit();
    if (e.key === "ArrowRight") select(Math.min(STEPS.length - 1, active + 1));
    if (e.key === "ArrowLeft") active <= 0 ? overview() : select(active - 1);
  });

  /* orbit: drag rotates, wheel / pinch zooms, right-drag or two-finger drag pans */
  const ptrs = new Map(); let pinch0 = 0, d0 = 0, moved = 0;
  canvas.addEventListener("pointerdown", (e) => {
    if (!explore) return;
    canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button });
    tween = null; moved = 0;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); d0 = rig.d; }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!explore || !ptrs.has(e.pointerId)) return;
    const p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); rig.d = Math.min(190, Math.max(18, d0 * pinch0 / Math.max(1, d))); return; }
    if (p.b === 2 || e.shiftKey) {
      const k = rig.d * 0.0016, sa = Math.sin(rig.az), ca = Math.cos(rig.az);
      rig.t.x -= (dx * ca + dy * sa) * k; rig.t.z -= (-dx * sa + dy * ca) * k;
      rig.t.x = Math.max(-80, Math.min(80, rig.t.x)); rig.t.z = Math.max(-50, Math.min(50, rig.t.z));
    } else { rig.az -= dx * 0.005; rig.el = Math.max(0.12, Math.min(1.35, rig.el + dy * 0.004)); }
    userMoved = performance.now();
  });
  const up = (e) => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (moved < 6 && explore && e.button === 0) pick(e);
  };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => explore && e.preventDefault());
  canvas.addEventListener("wheel", (e) => { if (!explore) return; e.preventDefault(); tween = null; rig.d = Math.min(190, Math.max(18, rig.d * Math.exp(e.deltaY * 0.0012))); userMoved = performance.now(); }, { passive: false });

  /* click on a piece of equipment selects its step */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  units.forEach((g, i) => g.traverse((o) => (o.userData.step = i)));
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(units, true).find((h) => h.object.isMesh && h.object.userData.step != null);
    if (hit) select(hit.object.userData.step);
  }

  /* hero: gentle pointer parallax (no drag, so the page still scrolls on touch) */
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => { if (explore || e.pointerType === "touch") return; par.tx = e.clientX / innerWidth - 0.5; par.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  /* ---------------------------------------------------------------- frame */
  let W = 1, H = 1;
  function resize() {
    const r = root.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false); camera.aspect = W / H;
    camera.fov = W / H < 1 ? 52 : 36;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  const v3 = new THREE.Vector3(), sph = new THREE.Vector3();
  let running = false, visible = true, t0 = performance.now(), last = t0;
  function frame(now) {
    const t = STILL ? 6 : (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;

    if (tween) {
      const k = Math.min(1, Math.max(0, (performance.now() - tween.t0) / tween.dur)), e = ease(k), f = tween.from, to = tween.to;
      rig.t.lerpVectors(f.t, to.t, e); rig.d = f.d + (to.d - f.d) * e; rig.el = f.el + (to.el - f.el) * e;
      let da = to.az - f.az; da = Math.atan2(Math.sin(da), Math.cos(da)); rig.az = f.az + da * e;
      if (k >= 1) tween = null;
    } else if (!explore && !STILL) {
      rig.az = OVERVIEW.az + Math.sin(t * 0.045) * 0.22;   // slow cinematic drift in the hero
    }
    // framing: hero puts the plant right of the headline; explore keeps the subject clear of the rail / card
    const portrait = W / H < 1, kf = STILL ? 1 : Math.min(1, dt * 3);
    const wantX = portrait ? 0 : explore ? (active >= 0 ? 0.12 : -0.07) : -0.13;
    const wantY = portrait ? (explore ? (active >= 0 ? 0.22 : 0.04) : 0.14) : explore ? 0 : -0.02;
    rig.ox += (wantX - rig.ox) * kf; rig.oy += (wantY - rig.oy) * kf;
    par.x += (par.tx - par.x) * 0.04; par.y += (par.ty - par.y) * 0.04;
    const az = rig.az + (explore ? 0 : par.x * 0.08), el = rig.el + (explore ? 0 : par.y * 0.04);
    sph.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(rig.d);
    camera.position.copy(rig.t).add(sph);
    camera.lookAt(rig.t);
    camera.setViewOffset(W, H, rig.ox * W, rig.oy * H, W, H);

    // living plant
    Object.values(FLOW).forEach((tx, i) => (tx.offset.y = -t * (0.22 + i * 0.03)));
    beds.forEach((b, i) => { const p = 0.55 + Math.sin(t * 1.6 + i * 1.7) * 0.18 + (active === 3 ? 0.25 : 0); b.pm.emissiveIntensity = p; b.light.intensity = 14 + p * 10; b.halo.material.opacity = 0.22 + p * 0.18; });
    units[3].userData.decal.material.opacity = 0.45 + Math.sin(t * 2) * 0.15 + (active === 3 ? 0.3 : 0);
    flame.forEach((f, i) => { if (f.isSprite) { const s = 1 + Math.sin(t * 9 + i * 2) * 0.12 + Math.sin(t * 23 + i) * 0.06; f.scale.setScalar([3.6, 2.4, 6.5][i] * s); } else f.intensity = 34 + Math.sin(t * 13) * 8; });
    steam.forEach((p) => {
      const life = (t * (p.s.big ? 0.07 : 0.12) + p.ph) % 1, s = p.s;
      const rise = life * (s.big ? 26 : 12), spread = (s.big ? 3 : 1) + life * (s.big ? 9 : 4);
      p.sp.position.set(s.x + Math.cos(p.ang) * p.rad + life * (s.big ? 7 : 4), s.y + rise, s.z + Math.sin(p.ang) * p.rad - life * 2);
      p.sp.scale.setScalar(spread * (s.big ? 2.1 : 1.6));
      p.sp.material.opacity = Math.sin(life * Math.PI) * (s.big ? 0.13 : 0.12);
    });
    cars.forEach((c) => {
      const q = c.loop.at(c.off + t * c.speed);
      c.g.position.set(q.x - q.dz * c.lane, 0, q.z + q.dx * c.lane); c.g.rotation.y = Math.atan2(q.dx, q.dz);
    });

    renderer.render(scene, camera);

    // DOM labels follow their anchors
    labels.forEach((l) => {
      const show = explore || l.hero;
      v3.copy(l.p).project(camera);
      const on = show && v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05;
      l.el.classList.toggle("is-on", on);
      if (on) l.el.style.transform = `translate(${((v3.x + 1) / 2) * W}px, ${((1 - v3.y) / 2) * H}px)`;
    });
    if (!readyFired) { readyFired = true; root.classList.add("is-ready"); }
  }
  let readyFired = false;
  function loop() {
    running = true;
    (function tick(now) {
      if (!visible && !explore) { running = false; return; }
      frame(now);
      requestAnimationFrame(tick);   // keep presenting even in ?still (a lone render never composites headless)
    })(performance.now());
  }
  if ("IntersectionObserver" in window) {
    // a deep link to another page builds the plant while it is hidden (0 x 0): size it when it first shows
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) resize(); if (visible && !running) loop(); }, { threshold: 0.01 }).observe(root);
  }
  overview(); tween = null; Object.assign(rig, { az: OVERVIEW.az, el: OVERVIEW.el, d: OVERVIEW.d }); rig.t.set(...OVERVIEW.t);
  if (qs.has("explore")) enter(qs.get("explore") === "" ? undefined : +qs.get("explore"));
  loop();
})();
