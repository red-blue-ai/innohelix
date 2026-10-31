/* InnoHelix two-stage catalytic upgrading skid: the 3D model, built with the Machine Skill kit (window.LabKit).
   Shared by machine/reformer.html (the cut-open lab) and js/plant.js (the plant scene, lite: no catalyst pellets).

   Research block (step 1 of the skill), an industrial-trial scale skid:
   - two electrically heated fixed-bed reactors in series, tube ID 250 mm, 10 mm wall (alloy 800H class)
     stage 1: sacrificial tar pre-cracking bed, 0.62 m of 10 mm granules (tar, PAHs, C2-C4 first)
     stage 2: main reforming bed, 1.10 m of 12 mm Ni/Al2O3 cylinders (CH4 + H2O, water-gas shift)
   - each tube: weld-neck flanges, blind flange covers with DN80 nozzles, 12 studs, graphite gaskets,
     perforated distributor, 19 mm alumina ball layers above and below the bed, support grid on a ring,
     multipoint thermowell, clamshell ceramic-fibre heater with an exposed coil, mineral wool, aluminium cladding
   - static mixer where superheated steam joins the raw gas, steam superheater, syngas cooler (13 tubes, 3 baffles),
     a normally closed stage-1 bypass with an actuated ball valve, gas analyser cabinet, process control cabinet
   - skid 3.9 x 1.5 m, every reactor and process line on the z = 0 plane, so one half cut opens the whole line */
(function () {
  'use strict'

  function build(K, add, opt) {
    opt = opt || {}
    const { THREE, MAT, GEO, heatGlow, rng } = K
    const lite = !!opt.lite
    const PI = Math.PI

    // ---------------------------------------------------------------- layout (metres)
    const SK = 0.16                       // skid deck top
    const RI = 0.125, RO = 0.135          // reactor tube
    const FL = 0.2                        // tube flange outer radius
    const NR = 0.0445, NI = 0.0395        // DN80 process pipe
    const R1 = { n: 1, x: -0.62, y0: 0.5, y1: 1.95, bed0: 0.8, bed1: 1.42, h0: 0.76, h1: 1.84 }
    const R2 = { n: 2, x: 0.42, y0: 0.5, y1: 2.35, bed0: 0.82, bed1: 1.92, h0: 0.76, h1: 2.24 }
    const YF = 0.3, YX = 0.26, XR = -1.12, XC = -0.1, YFH = 2.32, YBP = 2.56, YCH = 2.74
    const ZB = -0.48, ZC = -0.74
    const CX = { x0: 0.92, x1: 1.66, y: 0.62, r: 0.114 }   // syngas cooler

    // ---------------------------------------------------------------- materials
    const M = {
      teal: MAT.paint({ color: [0.0, 0.2, 0.18], roughness: 0.36, clearcoat: 0.55 }),
      frame: MAT.paint({ color: [0.05, 0.055, 0.06], roughness: 0.5, clearcoat: 0.3 }),
      grey: MAT.paint({ color: [0.6, 0.62, 0.59], roughness: 0.46, clearcoat: 0.25 }),
      dark: MAT.paint({ color: [0.035, 0.04, 0.042], roughness: 0.62, clearcoat: 0.1, finish: 'cast' }),
      deck: MAT.steelDark({ color: [0.16, 0.17, 0.17], roughness: 0.55, finish: 'knurl', rep: [40, 16] }),
      steel: MAT.stainless(),
      flange: MAT.stainless({ roughness: 0.26, finish: 'turned', rep: [1, 8] }),
      bolt: MAT.steel({ color: [0.5, 0.51, 0.52], roughness: 0.34, finish: 'cast' }),
      gasket: MAT.satin({ color: [0.03, 0.03, 0.034], roughness: 0.45 }),
      fiber: MAT.ceramic({ color: [0.86, 0.84, 0.78], roughness: 0.92, cap: [0.9, 0.88, 0.82] }),
      wool: MAT.satin({ color: [0.62, 0.48, 0.24], roughness: 0.96, cap: [0.66, 0.52, 0.27] }),
      clad: MAT.aluminium({ color: [0.84, 0.85, 0.86], metalness: 0.62, roughness: 0.4, finish: 'cast', rep: [7, 9] }),
      band: MAT.stainless({ roughness: 0.22 }),
      bedDark1: MAT.ceramic({ color: [0.06, 0.045, 0.035], roughness: 0.9, cap: [0.07, 0.05, 0.04] }),
      bedDark2: MAT.ceramic({ color: [0.04, 0.05, 0.045], roughness: 0.9, cap: [0.05, 0.06, 0.055] }),
      ballBed: MAT.ceramic({ color: [0.7, 0.69, 0.66], roughness: 0.6, cap: [0.74, 0.73, 0.7] }),
      rubber: MAT.rubber(),
      conduit: MAT.plastic({ color: [0.09, 0.1, 0.1], roughness: 0.5 }),
      glass: MAT.glass({ roughness: 0.05 }),
      chrome: MAT.chrome({ roughness: 0.12 }),
      black: MAT.satin({ color: [0.02, 0.022, 0.024] }),
    }
    // hot parts glow from the solver's temperatures (kelvin, set each tick)
    const hot = (m, T) => heatGlow(m, T)
    const dyn = {
      tube1: hot(MAT.inconel({ roughness: 0.4 }), 1030), tube2: hot(MAT.inconel({ roughness: 0.4 }), 1120),
      coil1: hot(MAT.inconel({ color: [0.52, 0.48, 0.43], roughness: 0.45 }), 1150), coil2: hot(MAT.inconel({ color: [0.52, 0.48, 0.43], roughness: 0.45 }), 1240),
      cat1: hot(MAT.ceramic({ color: [0.24, 0.16, 0.1], roughness: 0.85, cap: [0.3, 0.2, 0.13] }), 1030),
      cat2: hot(MAT.ceramic({ color: [0.2, 0.26, 0.22], roughness: 0.7, cap: [0.25, 0.31, 0.27] }), 1120),
      balls1: hot(MAT.ceramic({ color: [0.86, 0.85, 0.81], roughness: 0.4, cap: [0.9, 0.89, 0.86] }), 1030),
      balls2: hot(MAT.ceramic({ color: [0.86, 0.85, 0.81], roughness: 0.4, cap: [0.9, 0.89, 0.86] }), 1120),
      pellets: [], screens: {},
    }

    // ---------------------------------------------------------------- helpers
    // plain (non-kit) materials still have to respect the section cut, or they float in front of it
    const clip = (m) => { if (K.LAB_PLANES) { m.clippingPlanes = K.LAB_PLANES; m.clipIntersection = true } return m }
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z)
    const at = (g, x, y, z) => { g.translate(x, y, z); return g }
    const mesh = (g, m) => new THREE.Mesh(g, m)
    const box = (w, h, d, r) => GEO.rbox(w, h, d, r ?? Math.min(w, h, d) * 0.12)
    const flip = (g) => {
      const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t }
      const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i))
    }
    // a polyline with rounded bends, sampled densely (pipes and flow paths share it)
    function bendPts(pts, r, step) {
      r = r ?? 0.08; step = step ?? 0.015
      const P = pts.map((p) => V3(p[0], p[1], p[2])), out = []
      const push = (v) => { if (!out.length || out[out.length - 1].distanceTo(v) > 1e-5) out.push(v.clone()) }
      const line = (a, b) => { const n = Math.max(1, Math.ceil(a.distanceTo(b) / step)); for (let i = 0; i <= n; i++) push(a.clone().lerp(b, i / n)) }
      let cur = P[0]
      for (let i = 1; i < P.length - 1; i++) {
        const a = P[i - 1], b = P[i], c = P[i + 1], d0 = b.clone().sub(a), d1 = c.clone().sub(b)
        const rr = Math.min(r, d0.length() / 2, d1.length() / 2)
        const p0 = b.clone().addScaledVector(d0.normalize(), -rr), p1 = b.clone().addScaledVector(d1.normalize(), rr)
        line(cur, p0)
        for (let k = 1; k <= 10; k++) { const t = k / 10, u = 1 - t; push(V3(u * u * p0.x + 2 * u * t * b.x + t * t * p1.x, u * u * p0.y + 2 * u * t * b.y + t * t * p1.y, u * u * p0.z + 2 * u * t * b.z + t * t * p1.z)) }
        cur = p1
      }
      line(cur, P[P.length - 1])
      return out
    }
    // a hollow pipe (closed wall: outer skin, inner skin, annular end caps) so a cut shows the bore
    function hpipe(pts, rO, rI, o) {
      o = o || {}
      const curve = new THREE.CatmullRomCurve3(bendPts(pts, o.bend), false, 'centripetal')
      const L = curve.getLength(), seg = Math.max(8, Math.ceil(L / 0.02)), rad = o.radial ?? 28
      const parts = [new THREE.TubeGeometry(curve, seg, rO, rad, false)]
      if (rI > 0) { const inner = new THREE.TubeGeometry(curve, seg, rI, rad, false); flip(inner); parts.push(inner) }
      for (const [t, s] of [[0, -1], [1, 1]]) {
        const c = rI > 0 ? new THREE.RingGeometry(rI, rO, rad) : new THREE.CircleGeometry(rO, rad)
        c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), curve.getTangentAt(t).multiplyScalar(s)))
        c.translate(...curve.getPointAt(t).toArray()); parts.push(c)
      }
      return GEO.merge(parts)
    }
    // part of a solid of revolution about +Y, the two side faces capped so it cuts and explodes as a solid
    function arcSolid(pts, phi0, phiLen, seg) {
      const g = GEO.lathe(pts, seg ?? 64, { phi0, phiLen }), caps = []
      const tris = THREE.ShapeUtils.triangulateShape(pts.map(([r, y]) => new THREE.Vector2(r, y)), [])
      for (const [phi, s] of [[phi0, -1], [phi0 + phiLen, 1]]) {
        const t = V3(Math.cos(phi), 0, -Math.sin(phi)).multiplyScalar(s), Pt = (k) => V3(pts[k][0] * Math.sin(phi), pts[k][1], pts[k][0] * Math.cos(phi)), pos = []
        for (const [a, b, c] of tris) { const A = Pt(a), B = Pt(b), C = Pt(c); if (B.clone().sub(A).cross(C.clone().sub(A)).dot(t) >= 0) pos.push(A, B, C); else pos.push(A, C, B) }
        const cg = new THREE.BufferGeometry().setFromPoints(pos); cg.computeVertexNormals(); cg.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.length * 2).fill(0), 2)); caps.push(cg)
      }
      return GEO.merge([g, ...caps])
    }
    // a solid of revolution about an arbitrary axis through a point: profile [[r, s]] along the axis
    function latheOn(pts, axis, o, seg) {
      const g = GEO.lathe(pts, seg ?? 64)
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), V3(...axis).normalize()))
      g.translate(o[0], o[1], o[2]); return g
    }
    // a bolted pipe flange pair on an axis, centred where two lengths meet
    function flangePair(o, axis, r, opts) {
      opts = opts || {}
      const R = r ?? 0.1, t = opts.t ?? 0.022, n = opts.n ?? 8, bore = opts.bore ?? NI
      const rings = GEO.merge([latheOn([[bore, -t - 0.002], [R, -t - 0.002], [R, -0.002], [bore, -0.002]], axis, o, 64), latheOn([[bore, 0.002], [R, 0.002], [R, t + 0.002], [bore, t + 0.002]], axis, o, 64)])
      const nuts = GEO.merge([GEO.bolts(n, R * 0.78, R * 0.085, 0.012, { y: t + 0.002, phase: PI / n }), GEO.bolts(n, R * 0.78, R * 0.085, 0.012, { y: -t - 0.014, phase: PI / n })])
      nuts.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), V3(...axis).normalize())); nuts.translate(o[0], o[1], o[2])
      return [mesh(rings, M.flange), mesh(nuts, M.bolt)]
    }
    function studs(n, R, r, y0, y1, phase) {
      const out = []
      for (let i = 0; i < n; i++) { const a = phase + (i / n) * PI * 2; out.push(at(new THREE.CylinderGeometry(r, r, y1 - y0, 10), R * Math.cos(a), (y0 + y1) / 2, R * Math.sin(a))) }
      return GEO.merge(out)
    }
    // a perforated plate (distributor, support grid) lying flat at height y
    function perfPlate(r, t, y, hole, pitch) {
      const sh = new THREE.Shape(); sh.absarc(0, 0, r, 0, PI * 2, false)
      for (let x = -r; x <= r; x += pitch) for (let z = -r; z <= r; z += pitch) {
        if (Math.hypot(x, z) > r - hole * 2.2) continue
        const h = new THREE.Path(); h.absarc(x, z, hole, 0, PI * 2, true); sh.holes.push(h)
      }
      const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 10 })
      g.rotateX(PI / 2); g.translate(0, y + t / 2, 0); g.computeVertexNormals(); return g
    }
    // random close packing in a slab behind the cut plane: the cut shows sectioned pellets in front, whole ones behind
    function packed(geo, m, o) {
      const R = rng(o.seed), pts = [], s = o.d * 1.04, r = o.r
      let row = 0
      for (let z = 0; z >= (o.z0 ?? -0.026); z -= s * 0.86)
        for (let y = o.y0 + o.d / 2; y <= o.y1 - o.d / 2; y += s * 0.88, row++)
          for (let x = -r + o.d / 2 + (row % 2) * s * 0.5; x <= r - o.d / 2; x += s) {
            const px = x + (R() - 0.5) * s * 0.45, py = y + (R() - 0.5) * s * 0.35, pz = z + (R() - 0.5) * s * 0.35
            if (px * px + pz * pz > (r - o.d * 0.55) ** 2) continue
            pts.push([px, py, pz])
          }
      const im = new THREE.InstancedMesh(geo, m, pts.length)
      const q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V3(1, 1, 1), M4 = new THREE.Matrix4(), p = V3(0, 0, 0)
      pts.forEach((c, i) => {
        e.set(R() * 6.28, R() * 6.28, R() * 6.28); q.setFromEuler(e)
        const k = 1 + (R() - 0.5) * 2 * (o.jit ?? 0.12)
        if (o.aniso) sc.set(k * (0.8 + R() * 0.4), k * (0.8 + R() * 0.4), k * (0.8 + R() * 0.4)); else sc.setScalar(k)
        M4.compose(p.set(c[0], c[1], c[2]), q, sc); im.setMatrixAt(i, M4)
      })
      im.instanceMatrix.needsUpdate = true
      im.userData.ys = pts.map((c) => c[1])
      im.frustumCulled = false
      return im
    }
    // canvas screens (HMI, analyser); the page draws on them
    function screen(w, h, px, py) {
      const c = document.createElement('canvas'); c.width = px; c.height = py
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
      const m = clip(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.25, roughness: 0.25, metalness: 0 }))
      return { canvas: c, ctx: c.getContext('2d'), tex, mesh: new THREE.Mesh(new THREE.PlaneGeometry(w, h), m) }
    }
    function plate(text, w, h, px, py, fg, bg) {
      const c = document.createElement('canvas'); c.width = px; c.height = py
      const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, px, py); g.fillStyle = fg
      g.font = `600 ${Math.round(py * 0.36)}px "DM Sans", Inter, Arial, sans-serif`; g.textBaseline = 'middle'
      g.fillText(text, py * 0.35, py * 0.52)
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), clip(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.2 })))
    }

    const anchors = {}

    // ---------------------------------------------------------------- skid
    const skid = new THREE.Group()
    {
      const beams = []
      const BX = 1.95, BZ0 = -0.95, BZ1 = 0.55, BH = 0.16, BW = 0.1
      beams.push(at(box(BX * 2, BH, BW, 0.008), 0, BH / 2, BZ1 - BW / 2), at(box(BX * 2, BH, BW, 0.008), 0, BH / 2, BZ0 + BW / 2))
      for (const x of [-BX + BW / 2, BX - BW / 2]) beams.push(at(box(BW, BH, BZ1 - BZ0 - 0.2, 0.008), x, BH / 2, (BZ0 + BZ1) / 2))
      for (const x of [XR, R1.x, XC, R2.x, 1.05, 1.5]) beams.push(at(box(0.08, BH - 0.02, BZ1 - BZ0 - 0.2, 0.006), x, (BH - 0.02) / 2, (BZ0 + BZ1) / 2))
      skid.add(mesh(GEO.merge(beams.map((g) => g.index ? g.toNonIndexed() : g)), M.frame))
      skid.add(mesh(at(box(BX * 2 - 0.2, 0.008, BZ1 - BZ0 - 0.2, 0.003), 0, BH - 0.004, (BZ0 + BZ1) / 2), M.deck))
      // lifting lugs at the corners
      const lug = new THREE.Shape(); lug.moveTo(-0.06, 0); lug.lineTo(0.06, 0); lug.lineTo(0.035, 0.09); lug.absarc(0, 0.09, 0.035, 0, PI, false); lug.lineTo(-0.06, 0)
      const hole = new THREE.Path(); hole.absarc(0, 0.09, 0.016, 0, PI * 2, true); lug.holes.push(hole)
      const lugs = []
      for (const x of [-BX + 0.2, BX - 0.2]) for (const z of [BZ0, BZ1]) lugs.push(at(GEO.extrude(lug, 0.02, 0.002), x, BH, z + (z > 0 ? -0.05 : 0.05)))
      skid.add(mesh(GEO.merge(lugs), M.frame))
      // forklift pockets in the long beams
      const pk = []
      for (const x of [-0.85, 0.85]) for (const z of [BZ1 + 0.001, BZ0 - 0.001]) pk.push(at(box(0.3, 0.075, 0.004, 0.002), x, BH * 0.5, z))
      skid.add(mesh(GEO.merge(pk), M.black))
      const np = plate('INNOHELIX  ·  TWO-STAGE CATALYTIC UPGRADING MODULE', 0.9, 0.07, 1024, 80, '#0b1716', '#c9d1cd')
      np.position.set(-1.2, 0.085, BZ1 + 0.001); skid.add(np)
    }
    add(skid, { name: 'Skid frame', count: 22 })

    // ---------------------------------------------------------------- the two reactors
    function reactor(R) {
      const g = new THREE.Group(); g.position.set(R.x, 0, 0)
      add(g, { name: R.n === 1 ? 'Stage 1 reactor' : 'Stage 2 reactor', count: 0 })
      const tubeM = dyn['tube' + R.n], coilM = dyn['coil' + R.n], catM = dyn['cat' + R.n], ballM = dyn['balls' + R.n]
      // reactor tube
      add(mesh(GEO.tube(RO, RI, R.y1 - R.y0, 96, R.y0), tubeM), { parent: g, name: 'Reactor tube' })
      // weld neck flanges
      const wn = (y, s) => GEO.lathe([[RI, y], [FL, y], [FL, y + s * 0.04], [0.168, y + s * 0.046], [RO + 0.006, y + s * 0.1], [RI, y + s * 0.1]], 96)
      add(mesh(GEO.merge([wn(R.y0, 1), wn(R.y1, -1)]), M.flange), { parent: g, name: 'Flanges' })
      // support lugs and legs to the deck
      const legs = []
      for (let i = 0; i < 4; i++) {
        const a = PI / 4 + (i * PI) / 2, c = Math.cos(a), s = Math.sin(a)
        const lugG = box(0.16, 0.08, 0.014, 0.003); lugG.rotateY(-a); lugG.translate(c * (RO + 0.08), 0.66, s * (RO + 0.08)); legs.push(lugG)
        legs.push(at(box(0.06, 0.62 - SK, 0.06, 0.006), c * 0.269, (0.62 + SK) / 2, s * 0.269))
        legs.push(at(box(0.12, 0.012, 0.12, 0.003), c * 0.269, SK + 0.006, s * 0.269))
      }
      add(mesh(GEO.merge(legs), M.frame), { parent: g, name: 'Supports', count: 12 })
      // covers: gasket, blind flange, nozzle, studs and nuts (top lifts off when exploded)
      const cover = (y, s) => {
        const c = new THREE.Group(), yb = y + s * 0.003, yt = y + s * 0.043
        c.add(mesh(GEO.tube(0.168, RI + 0.004, 0.003, 96, Math.min(y, yb)), M.gasket))
        c.add(mesh(GEO.lathe([[NI, yb], [FL, yb], [FL, yt], [NI, yt]], 96), M.flange))
        const nl = s > 0 ? 0.13 : 0.1
        c.add(mesh(GEO.tube(NR, NI, nl, 48, s > 0 ? yt - 0.004 : yt - nl + 0.004), M.steel))
        const yn = yt + s * (nl - 0.02)
        c.add(mesh(GEO.lathe([[NI, yn], [0.095, yn], [0.095, yn + s * 0.022], [NI, yn + s * 0.022]], 64), M.flange))
        c.add(mesh(GEO.merge([GEO.bolts(12, 0.182, 0.0135, 0.016, { y: s > 0 ? yt : yt - 0.016, phase: PI / 12 }), GEO.bolts(12, 0.182, 0.0135, 0.016, { y: s > 0 ? y - 0.056 : y + 0.04, phase: PI / 12 })]), M.bolt))
        c.add(mesh(studs(12, 0.182, 0.0075, Math.min(y - s * 0.062, yt + s * 0.026), Math.max(y - s * 0.062, yt + s * 0.026), PI / 12), M.bolt))
        return c
      }
      const top = cover(R.y1, 1), bot = cover(R.y0, -1)
      add(top, { parent: g, name: 'Top cover', count: 28 })
      add(bot, { parent: g, name: 'Bottom cover', count: 27 })
      // multipoint thermowell, offset clear of the nozzle flange; it withdraws upward when exploded
      const tw = 0.108, yTip = R.bed0 + 0.08, yTop = R.y1 + 0.24
      const well = new THREE.Group()
      well.add(mesh(at(GEO.lathe([[0, yTip], [0.006, yTip + 0.002], [0.0105, yTip + 0.012], [0.0105, yTop], [0, yTop]], 32), tw, 0, 0), M.steel))
      well.add(mesh(at(GEO.lathe([[0, 0], [0.024, 0], [0.026, 0.006], [0.026, 0.05], [0.02, 0.058], [0, 0.06]], 32), tw, yTop, 0), M.grey))
      well.add(mesh(at(box(0.016, 0.03, 0.016, 0.003), tw + 0.03, yTop + 0.03, 0), M.bolt))
      add(well, { parent: g, name: 'Thermowell', explode: [0, 0.18, 0], count: 3 })
      anchors['tc' + R.n] = { obj: well, pts: [[tw, R.bed1 - 0.06, 0], [tw, (R.bed0 + R.bed1) / 2, 0], [tw, R.bed0 + 0.1, 0]] }
      // internals: distributor, ball layers, bed, support grid
      add(mesh(perfPlate(RI - 0.002, 0.006, R.y1 - 0.18, 0.006, 0.026), M.steel), { parent: g, name: 'Gas distributor' })
      const ring = GEO.lathe([[RI - 0.016, R.bed0 - 0.124], [RI - 0.0005, R.bed0 - 0.124], [RI - 0.0005, R.bed0 - 0.108], [RI - 0.016, R.bed0 - 0.108]], 96)
      add(mesh(GEO.merge([perfPlate(RI - 0.002, 0.008, R.bed0 - 0.108, 0.007, 0.024), ring]), M.steel), { parent: g, name: 'Support grid' })
      const slab = (a, b, m) => mesh(GEO.lathe([[0, a], [RI - 0.001, a], [RI - 0.001, b], [0, b]], 64), m)
      add(slab(R.bed1, R.bed1 + 0.08, M.ballBed), { parent: g, name: 'Inert alumina balls' })
      add(slab(R.bed0 - 0.1, R.bed0, M.ballBed), { parent: g, name: 'Inert alumina balls' })
      add(slab(R.bed0, R.bed1, R.n === 1 ? M.bedDark1 : M.bedDark2), { parent: g, name: R.n === 1 ? 'Sacrificial bed' : 'Main reforming bed' })
      if (!lite) {
        const pg = R.n === 1 ? new THREE.IcosahedronGeometry(0.0052, 0) : new THREE.CylinderGeometry(0.006, 0.006, 0.0105, 7)
        const pel = packed(pg, catM, { r: RI, y0: R.bed0, y1: R.bed1, d: R.n === 1 ? 0.0105 : 0.0122, z0: -0.022, seed: 11 + R.n, aniso: R.n === 1, jit: R.n === 1 ? 0.25 : 0.06 })
        const bg = new THREE.SphereGeometry(0.0095, 9, 6)
        const b1 = packed(bg, ballM, { r: RI, y0: R.bed1, y1: R.bed1 + 0.08, d: 0.019, z0: -0.02, seed: 21 + R.n })
        const b2 = packed(bg, ballM, { r: RI, y0: R.bed0 - 0.1, y1: R.bed0, d: 0.019, z0: -0.02, seed: 31 + R.n })
        const pack = new THREE.Group(); pack.add(pel, b1, b2)
        add(pack, { parent: g, name: R.n === 1 ? 'Tar cracking granules' : 'Ni reforming catalyst', count: pel.count + b1.count + b2.count, shadow: false })
        dyn.pellets.push({ n: R.n, mesh: pel, all: [pel, b1, b2], y0: R.bed0, y1: R.bed1 })
      }
      // heater coil (exposed Fe-Cr-Al element) and the clamshell heater, insulation and cladding halves
      const turns = Math.round((R.h1 - R.h0 - 0.06) / 0.022)
      add(mesh(at(GEO.spring(0.1475, 0.0042, turns, R.h1 - R.h0 - 0.06, turns * 12), 0, R.h0 + 0.03, 0), coilM), { parent: g, name: 'Heating element', count: 1 })
      const a = R.h0 - 0.05, b = R.h1 + 0.05
      const halves = (pts, m, name, ex, xray, extra) => {
        for (const [phi0, front] of [[-PI / 2, true], [PI / 2, false]]) {
          const hm = mesh(arcSolid(pts, phi0, PI, 72), m)
          if (extra) extra(hm, front, phi0)
          add(hm, { parent: g, name, explode: front ? [(R.n === 1 ? -1 : 1) * ex * 0.62, 0, ex] : [0, 0, 0], xray })
        }
      }
      halves([[0.158, R.h0], [0.24, R.h0], [0.24, R.h1], [0.158, R.h1]], M.fiber, 'Ceramic fibre heater', 0.34, 'shell')
      halves([[RO + 0.004, a], [0.296, a], [0.296, b], [RO + 0.004, b], [RO + 0.004, R.h1], [0.24, R.h1], [0.24, R.h0], [RO + 0.004, R.h0]], M.wool, 'Mineral wool', 0.56, 'shell')
      halves([[RO + 0.004, a - 0.004], [0.302, a - 0.004], [0.302, b + 0.004], [RO + 0.004, b + 0.004], [RO + 0.004, b], [0.296, b], [0.296, a], [RO + 0.004, a]], M.clad, 'Cladding', 0.8, 'shell', (hm, front, phi0) => {
        const bands = []
        for (const y of [a + 0.2, b - 0.2]) bands.push(arcSolid([[0.302, y - 0.035], [0.308, y - 0.035], [0.308, y + 0.035], [0.302, y + 0.035]], phi0, PI, 72))
        hm.add(mesh(GEO.merge(bands), M.teal))
        if (!front) { // heater terminal box on the back, where the conduit lands
          const tb = mesh(at(box(0.18, 0.22, 0.1, 0.012), 0, (a + b) / 2 + 0.1, -0.35), M.grey); hm.add(tb)
          hm.add(mesh(at(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 16), 0, (a + b) / 2 + 0.225, -0.35), M.bolt))
        }
      })
      anchors['heater' + R.n] = { obj: g, at: [-0.1475, (R.h0 + R.h1) / 2 + 0.16, 0] }
      anchors['bed' + R.n] = { obj: g, at: [-0.06, (R.bed0 + R.bed1) / 2, 0] }
      anchors['clad' + R.n] = { obj: g, at: [0.0, b - 0.15, 0.302] }
      return g
    }
    reactor(R1); reactor(R2)

    // ---------------------------------------------------------------- process piping (all on z = 0)
    const piping = new THREE.Group()
    add(piping, { name: 'Process piping', count: 0 })
    const P = {
      feed: [[-1.96, YF, 0], [XR, YF, 0], [XR, 0.745, 0]],
      riser: [[XR, 1.295, 0], [XR, YBP, 0]],
      feedHdr: [[XR, YFH, 0], [R1.x, YFH, 0], [R1.x, R1.y1 + 0.172, 0]],
      cross: [[R1.x, R1.y0 - 0.13, 0], [R1.x, YX, 0], [XC, YX, 0], [XC, YCH, 0], [R2.x, YCH, 0], [R2.x, R2.y1 + 0.172, 0]],
      out: [[R2.x, R2.y0 - 0.13, 0], [R2.x, YX, 0], [0.68, YX, 0], [0.68, CX.y, 0], [CX.x0 - 0.18, CX.y, 0]],
      syn: [[CX.x1 + 0.18, CX.y, 0], [1.96, CX.y, 0]],
      bypass: [[XR, YBP, 0], [XC - 0.01, YBP, 0]],
      steam: [[0.82, 0.5, -0.6], [0.68, 0.5, -0.6], [0.68, YX, -0.6], [0.68, YX, ZB], [XR, YX, ZB], [XR, 0.62, ZB], [XR, 0.62, -NR]],
    }
    const pipeM = M.steel
    piping.add(mesh(hpipe(P.feed, NR, NI), pipeM), mesh(hpipe(P.riser, NR, NI), pipeM), mesh(hpipe(P.feedHdr, NR, NI), pipeM), mesh(hpipe(P.out, NR, NI), pipeM), mesh(hpipe(P.syn, NR, NI), pipeM), mesh(hpipe(P.bypass, NR, NI), pipeM))
    // the hot crossover is insulated: steel, mineral wool, aluminium jacket
    const jacket = [[R1.x, 0.32, 0], [R1.x, YX, 0], [XC, YX, 0], [XC, YCH, 0], [R2.x, YCH, 0], [R2.x, R2.y1 + 0.21, 0]]
    piping.add(mesh(hpipe(P.cross, NR, NI), pipeM), mesh(hpipe(jacket, 0.085, NR + 0.0005), M.wool), mesh(hpipe(jacket, 0.0875, 0.085), M.clad))
    // steam line, insulated
    piping.add(mesh(hpipe(P.steam, 0.0167, 0.0137, { bend: 0.06 }), pipeM), mesh(hpipe(P.steam.slice(0, -1), 0.04, 0.0172, { bend: 0.06 }), M.wool), mesh(hpipe(P.steam.slice(0, -1), 0.0415, 0.04, { bend: 0.06 }), M.clad))
    // flanged joints
    const fp = (o, ax, r, op) => piping.add(...flangePair(o, ax, r, op))
    fp([-1.9, YF, 0], [1, 0, 0])
    // the line's own flange bolted to each reactor nozzle flange
    const mate = (x, y, s) => {
      const y0 = y + s * 0.002, y1 = y + s * 0.024
      piping.add(mesh(GEO.lathe([[NI, Math.min(y0, y1)], [0.095, Math.min(y0, y1)], [0.095, Math.max(y0, y1)], [NI, Math.max(y0, y1)]], 64).translate(x, 0, 0), M.flange))
      piping.add(mesh(GEO.merge([GEO.bolts(8, 0.074, 0.008, 0.011, { y: s > 0 ? y1 : y1 - 0.011, phase: PI / 8 }), GEO.bolts(8, 0.074, 0.008, 0.011, { y: s > 0 ? y - 0.022 - 0.011 : y + 0.022, phase: PI / 8 })]).translate(x, 0, 0), M.bolt))
    }
    mate(R1.x, R1.y1 + 0.175, 1); mate(R2.x, R2.y1 + 0.175, 1); mate(R1.x, R1.y0 - 0.145, -1); mate(R2.x, R2.y0 - 0.145, -1)
    fp([CX.x0 - 0.18, CX.y, 0], [1, 0, 0]); fp([CX.x1 + 0.18, CX.y, 0], [1, 0, 0]); fp([1.9, CX.y, 0], [1, 0, 0])
    // tees where the feed header and the bypass leave the riser
    piping.add(mesh(at(new THREE.SphereGeometry(NR * 1.18, 24, 16), XR, YFH, 0), pipeM), mesh(at(new THREE.SphereGeometry(NR * 1.18, 24, 16), XR, YBP, 0), pipeM), mesh(at(new THREE.SphereGeometry(NR * 1.18, 24, 16), XC, YBP, 0), pipeM))
    // pressure gauges: inlet riser and syngas outlet (dial faces drawn by the page)
    const gauge = (o, ax, key) => {
      const gg = new THREE.Group(); gg.position.set(...o)
      gg.add(mesh(latheOn([[0, 0], [0.008, 0], [0.008, 0.09], [0, 0.09]], ax, [0, 0, 0], 16), M.steel))
      const face = new THREE.Group(); face.position.set(ax[0] * 0.11, ax[1] * 0.11, ax[2] * 0.11)
      face.add(mesh(GEO.lathe([[0, -0.018], [0.052, -0.018], [0.055, -0.012], [0.055, 0.016], [0.05, 0.02], [0, 0.02]], 48).rotateX(PI / 2), M.chrome))
      const dc = document.createElement('canvas'); dc.width = dc.height = 256
      const dt = new THREE.CanvasTexture(dc); dt.colorSpace = THREE.SRGBColorSpace
      const dial = new THREE.Mesh(new THREE.CircleGeometry(0.047, 48), clip(new THREE.MeshStandardMaterial({ map: dt, roughness: 0.5 }))); dial.position.z = 0.0205; face.add(dial)
      const needle = new THREE.Mesh(at(box(0.0035, 0.04, 0.002, 0.0008), 0, 0.016, 0), clip(new THREE.MeshStandardMaterial({ color: 0xd8462b, roughness: 0.4 }))); needle.position.z = 0.023; face.add(needle)
      const gl = mesh(new THREE.CircleGeometry(0.049, 48), M.glass); gl.position.z = 0.026; face.add(gl)
      face.lookAt(new THREE.Vector3(0, 0, 10)); gg.add(face)
      dyn.screens[key] = { canvas: dc, ctx: dc.getContext('2d'), tex: dt, needle }
      piping.add(gg)
      anchors[key] = { obj: gg, at: [face.position.x, face.position.y, face.position.z + 0.03] }
    }
    gauge([XR, 1.62, NR], [0, 0, 1], 'gaugeIn'); gauge([1.78, CX.y + NR, 0], [0, 1, 0], 'gaugeOut')
    gauge([R1.x + 0.185, R1.y1 - 0.075, -0.08], [1, 0, 0], 'gaugeR1'); gauge([R2.x + 0.185, R2.y1 - 0.075, -0.08], [1, 0, 0], 'gaugeR2')
    // gate valves with handwheels: raw gas inlet and the cooling water inlet
    const handValve = (o, axis, r, stem) => {
      const v = new THREE.Group(); v.position.set(...o)
      v.add(mesh(latheOn([[0, -0.07], [r * 1.05, -0.07], [r * 1.05, -0.05], [r * 1.45, -0.04], [r * 1.6, 0], [r * 1.45, 0.04], [r * 1.05, 0.05], [r * 1.05, 0.07], [0, 0.07]], axis, [0, 0, 0], 48), M.steel))
      v.add(mesh(GEO.lathe([[0, 0], [r * 0.9, 0], [r * 0.9, stem * 0.45], [r * 0.5, stem * 0.55], [r * 0.5, stem * 0.8], [0, stem * 0.8]], 32), M.steel))
      v.add(mesh(at(new THREE.CylinderGeometry(0.006, 0.006, stem * 0.3, 12), 0, stem * 0.92, 0), M.chrome))
      const wheel = new THREE.Group(); wheel.position.y = stem
      wheel.add(mesh(new THREE.TorusGeometry(r * 2.2, r * 0.22, 12, 40).rotateX(PI / 2), M.teal))
      for (let k = 0; k < 4; k++) wheel.add(mesh(at(new THREE.CylinderGeometry(r * 0.12, r * 0.12, r * 4.3, 8).rotateZ(PI / 2), 0, 0, 0).rotateY((k * PI) / 4), M.teal))
      wheel.add(mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, r * 0.4, 16), M.teal))
      v.add(wheel)
      return v
    }
    piping.add(handValve([-1.62, YF, 0], [1, 0, 0], 0.045, 0.24), handValve([1.52, CX.y + CX.r + 0.115, 0], [0, 1, 0], 0.02, 0.12))

    // static mixer on the riser: housing, flanges and six alternating helical elements
    {
      const y0 = 0.74, y1 = 1.3
      const mx = new THREE.Group()
      mx.add(mesh(GEO.tube(0.0565, 0.05, y1 - y0, 64, y0), M.steel))
      for (const y of [y0, y1]) mx.add(...flangePair([XR, y, 0], [0, 1, 0], 0.1, { bore: 0.05 }).map((m) => { m.position.x -= XR; return m }))
      const els = []
      for (let k = 0; k < 6; k++) {
        const L = (y1 - y0 - 0.04) / 6, yb = y0 + 0.02 + k * L, secs = [], hand = k % 2 ? 1 : -1, w = 0.049, t = 0.0025
        for (let i = 0; i <= 24; i++) { const th = hand * (i / 24) * PI + (k * PI) / 2, c = Math.cos(th), s = Math.sin(th), y = yb + (i / 24) * (L - 0.004); secs.push([V3(-w * c - t * s, y, -w * s + t * c), V3(w * c - t * s, y, w * s + t * c), V3(w * c + t * s, y, w * s - t * c), V3(-w * c + t * s, y, -w * s - t * c)]) }
        els.push(loft(secs))
      }
      mx.add(mesh(GEO.merge(els), M.steel))
      mx.position.x = XR
      add(mx, { parent: piping, name: 'Static mixer', count: 9 })
      anchors.mixer = { obj: mx, at: [0, (y0 + y1) / 2, 0] }
    }
    function loft(secs) {
      const pos = [], idx = [], N = secs.length, Mn = secs[0].length
      secs.forEach((s) => s.forEach((p) => pos.push(p.x, p.y, p.z)))
      for (let j = 0; j < N - 1; j++) for (let q = 0; q < Mn; q++) { const q2 = (q + 1) % Mn, a = j * Mn + q, b = j * Mn + q2, c = (j + 1) * Mn + q, e = (j + 1) * Mn + q2; idx.push(a, c, b, b, c, e) }
      const capA = pos.length / 3; secs[0].forEach((p) => pos.push(p.x, p.y, p.z)); idx.push(capA, capA + 1, capA + 2, capA, capA + 2, capA + 3)
      const capB = pos.length / 3; secs[N - 1].forEach((p) => pos.push(p.x, p.y, p.z)); idx.push(capB, capB + 2, capB + 1, capB, capB + 3, capB + 2)
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx)
      g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2)); g.computeVertexNormals(); return g
    }

    // stage-1 bypass valve (actuated ball valve, normally closed)
    {
      const v = new THREE.Group(); v.position.set(R1.x, YBP, 0)
      v.add(mesh(latheOn([[0, -0.11], [0.05, -0.11], [0.05, -0.08], [0.07, -0.06], [0.078, 0], [0.07, 0.06], [0.05, 0.08], [0.05, 0.11], [0, 0.11]], [1, 0, 0], [0, 0, 0], 64), M.steel))
      for (const x of [-0.11, 0.11]) v.add(...flangePair([x, 0, 0], [1, 0, 0], 0.1).map((m) => m))
      v.add(mesh(at(new THREE.CylinderGeometry(0.016, 0.016, 0.1, 20), 0, 0.12, 0), M.steel))
      v.add(mesh(at(box(0.26, 0.11, 0.13, 0.012), 0, 0.22, 0), M.teal))
      for (const x of [-0.13, 0.13]) v.add(mesh(at(GEO.lathe([[0, 0], [0.05, 0], [0.052, 0.01], [0.052, 0.012], [0, 0.012]], 32).rotateZ(x > 0 ? -PI / 2 : PI / 2), x, 0.22, 0), M.grey))
      const ind = new THREE.Group(); ind.position.set(0, 0.278, 0)
      ind.add(mesh(GEO.lathe([[0, 0], [0.034, 0], [0.036, 0.006], [0.03, 0.03], [0, 0.034]], 32), M.glass))
      const arrow = mesh(at(box(0.05, 0.008, 0.012, 0.003), 0, 0.012, 0), clip(new THREE.MeshStandardMaterial({ color: 0xf2b134, roughness: 0.5 }))); ind.add(arrow)
      v.add(ind)
      add(v, { parent: piping, name: 'Stage 1 bypass valve', count: 22 })
      dyn.bypassArrow = arrow
      anchors.bypass = { obj: v, at: [0, 0.3, 0] }
    }
    // steam control valve with a diaphragm actuator, on the steam line run
    {
      const v = new THREE.Group(); v.position.set(XR, 0.62, -0.3)
      v.add(mesh(latheOn([[0, -0.06], [0.026, -0.06], [0.026, -0.045], [0.042, -0.03], [0.046, 0], [0.042, 0.03], [0.026, 0.045], [0.026, 0.06], [0, 0.06]], [0, 0, 1], [0, 0, 0], 48), M.steel))
      v.add(mesh(at(GEO.lathe([[0, 0], [0.03, 0], [0.03, 0.05], [0.02, 0.06], [0, 0.06]], 32), 0, 0.03, 0), M.steel))
      for (const x of [-0.022, 0.022]) v.add(mesh(at(box(0.01, 0.14, 0.02, 0.003), x, 0.15, 0), M.steel))
      v.add(mesh(at(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 12), 0, 0.15, 0), M.chrome))
      v.add(mesh(at(GEO.lathe([[0, 0], [0.11, 0], [0.12, 0.012], [0.12, 0.022], [0.1, 0.06], [0.03, 0.08], [0, 0.082]], 64), 0, 0.22, 0), M.teal))
      v.add(mesh(at(GEO.bolts(16, 0.115, 0.006, 0.01, { y: 0 }), 0, 0.232, 0), M.bolt))
      add(v, { parent: piping, name: 'Steam control valve', count: 20 })
      anchors.steamValve = { obj: v, at: [0, 0.29, 0] }
    }

    // ---------------------------------------------------------------- steam superheater (back right)
    {
      const s = new THREE.Group()
      const ax = (pts) => { const g = GEO.lathe(pts, 72); g.rotateZ(-PI / 2); return g }
      s.add(mesh(ax([[0, 0.9], [0.06, 0.9], [0.1, 0.92], [0.11, 0.96], [0.11, 1.56], [0.1, 1.6], [0.06, 1.62], [0, 1.62]]), M.clad))
      for (const x of [1.02, 1.2, 1.38]) s.add(mesh(ax([[0.11, x - 0.01], [0.113, x - 0.01], [0.113, x + 0.01], [0.11, x + 0.01]]), M.band))
      s.add(mesh(at(ax([[0, 0], [0.0167, 0], [0.0167, 0.1], [0, 0.1]]), 0.8, 0, 0), M.steel))
      const sad = []
      for (const x of [1.05, 1.47]) sad.push(at(box(0.06, 0.25, 0.18, 0.006), x, SK - 0.5 + 0.125, 0))
      s.add(mesh(GEO.merge(sad), M.frame))
      s.add(mesh(at(box(0.2, 0.12, 0.16, 0.012), 1.26, 0.16, 0), M.grey))
      s.position.set(0, 0.5, -0.6)
      add(s, { name: 'Steam superheater', explode: [0, 0.35, -0.2], count: 9 })
      anchors.superheater = { obj: s, at: [1.26, 0.16, 0.06] }
    }

    // ---------------------------------------------------------------- syngas cooler (shell and tube, on the line)
    {
      const c = new THREE.Group()
      const ax = (pts, seg) => { const g = GEO.lathe(pts, seg ?? 72); g.rotateZ(-PI / 2); g.translate(0, CX.y, 0); return g }
      c.add(mesh(ax([[CX.r - 0.008, CX.x0], [CX.r, CX.x0], [CX.r, CX.x1], [CX.r - 0.008, CX.x1]], 96), M.steel))
      // channel heads with axial nozzles and body flanges
      for (const [x, s] of [[CX.x0, -1], [CX.x1, 1]]) {
        const pts = [[CX.r - 0.008, x], [0.16, x], [0.16, x + s * 0.03], [0.13, x + s * 0.035], [0.12, x + s * 0.07], [0.08, x + s * 0.11], [NR, x + s * 0.13], [NR, x + s * 0.18], [NI, x + s * 0.18], [NI, x + s * 0.125], [0.075, x + s * 0.105], [0.112, x + s * 0.066], [0.12, x + s * 0.035], [CX.r - 0.008, x + s * 0.03]]
        c.add(mesh(ax(s > 0 ? pts : pts.map(([r, y]) => [r, y]), 96), M.steel))
        c.add(mesh(GEO.bolts(16, 0.143, 0.009, 0.012, { y: x + (s > 0 ? -0.012 : 0), phase: 0.1 }).rotateZ(-PI / 2).translate(0, CX.y, 0), M.bolt))
        c.add(mesh(ax([[0, x - 0.01], [CX.r - 0.008, x - 0.01], [CX.r - 0.008, x + 0.01], [0, x + 0.01]], 72), M.flange))
      }
      // 13 tubes on a triangular pitch, 3 segmental baffles
      const tubes = []
      const tp = [[0, 0]]; for (let k = 0; k < 6; k++) tp.push([0.032 * Math.cos((k * PI) / 3), 0.032 * Math.sin((k * PI) / 3)]); for (let k = 0; k < 6; k++) tp.push([0.064 * Math.cos((k * PI) / 3 + PI / 6) * 0.87, 0.064 * Math.sin((k * PI) / 3 + PI / 6) * 0.87])
      for (const [yy, zz] of tp) { const g = GEO.tube(0.0125, 0.0105, CX.x1 - CX.x0 - 0.02, 24, CX.x0 + 0.01); g.rotateZ(-PI / 2); g.translate(0, CX.y + yy, zz); tubes.push(g) }
      c.add(mesh(GEO.merge(tubes), M.steel))
      const baf = []
      ;[[1.105, 1], [1.29, -1], [1.475, 1]].forEach(([x, s]) => {
        const sh = new THREE.Shape(), r = CX.r - 0.01, h = 0.045 * s, a0 = Math.asin(h / r)
        if (s > 0) { sh.moveTo(r * Math.cos(a0), h); sh.absarc(0, 0, r, a0, PI - a0, true) } else { sh.moveTo(-r * Math.cos(a0), h); sh.absarc(0, 0, r, PI - a0, a0, true) }
        sh.closePath()
        const g = GEO.extrude(sh, 0.005, 0.0008); g.rotateY(PI / 2); g.translate(x, CX.y, 0); baf.push(g)
      })
      c.add(mesh(GEO.merge(baf), M.steel))
      // cooling water nozzles and saddles
      for (const [x, s] of [[1.52, 1], [1.06, -1]]) {
        const yA = CX.y + s * (CX.r - 0.004), yB = CX.y + s * (CX.r + 0.1)
        c.add(mesh(GEO.tube(0.024, 0.02, Math.abs(yB - yA), 32, Math.min(yA, yB)).translate(x, 0, 0), M.steel))
        c.add(mesh(GEO.lathe([[0.02, 0], [0.06, 0], [0.06, 0.016], [0.02, 0.016]], 48).translate(x, s > 0 ? yB : yB - 0.016, 0), M.flange))
      }
      for (const x of [1.0, 1.58]) {
        const sh = new THREE.Shape(); sh.moveTo(-0.13, SK); sh.lineTo(0.13, SK); sh.lineTo(0.13, CX.y - 0.06); sh.absarc(0, CX.y, CX.r + 0.004, -0.33, -PI + 0.33, true); sh.lineTo(-0.13, SK)
        const g = GEO.extrude(sh, 0.05, 0.004); g.rotateY(PI / 2); g.translate(x, 0, 0); c.add(mesh(g, M.frame))
      }
      add(c, { name: 'Syngas cooler', count: 13 + 3 + 12 })
      anchors.cooler = { obj: c, at: [1.3, CX.y + CX.r, 0] }
    }

    // ---------------------------------------------------------------- cabinets: gas analyser (step 03) and process control (step 05)
    {
      const an = new THREE.Group(), x0 = -1.6, w = 0.56, h = 1.5, d = 0.32, yb = SK + 0.08
      an.add(mesh(at(box(w + 0.04, 0.08, d + 0.02, 0.01), 0, SK + 0.04, 0), M.dark))
      an.add(mesh(at(box(w, h, d, 0.016), 0, yb + h / 2, 0), M.steel))
      // glazed door: analyser modules and sample conditioning behind glass
      const gl = mesh(at(box(w - 0.12, h - 0.62, 0.006, 0.004), 0, yb + h - 0.42, d / 2 + 0.004), M.glass); an.add(gl)
      for (let k = 0; k < 3; k++) {
        an.add(mesh(at(box(w - 0.18, 0.13, 0.2, 0.008), 0, yb + h - 0.22 - k * 0.17, d / 2 - 0.12), M.black))
        const led = mesh(at(box(0.08, 0.03, 0.004, 0.002), -0.12, yb + h - 0.22 - k * 0.17, d / 2 - 0.018), clip(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x39d3c2, emissiveIntensity: 2.2 }))); an.add(led)
      }
      const sc = screen(0.3, 0.17, 512, 290); sc.mesh.position.set(0, yb + 0.42, d / 2 + 0.003); an.add(sc.mesh)
      an.add(mesh(at(box(0.34, 0.21, 0.01, 0.006), 0, yb + 0.42, d / 2 - 0.002), M.black))
      an.add(mesh(at(box(0.02, 0.14, 0.03, 0.006), w / 2 - 0.05, yb + 0.8, d / 2 + 0.015), M.chrome))
      const tag = plate('GAS ID  ·  03', 0.26, 0.04, 512, 80, '#e9f2ef', '#0e3c39'); tag.position.set(0, yb + h - 0.04, d / 2 + 0.003); an.add(tag)
      an.position.set(x0, 0, ZC)
      dyn.screens.gasid = sc
      add(an, { name: 'Gas analyser', explode: [0, 0, -0.25], count: 12 })
      anchors.analyser = { obj: an, at: [0, yb + h - 0.25, d / 2] }
      // sample lines: raw gas tap on the riser, syngas tap after the cooler (back along the skid edge)
      piping.add(mesh(GEO.pipe(bendPts([[XR, 0.42, -NR], [XR, 0.42, -0.3], [-1.26, 0.42, -0.3], [-1.26, 0.95, -0.3], [-1.26, 0.95, -0.66], [-1.32, 0.95, -0.66]], 0.03, 0.01), 0.0045, { seg: 160, radial: 8 }), M.steel))
      piping.add(mesh(GEO.pipe(bendPts([[1.84, CX.y + NR, 0], [1.84, CX.y + 0.1, 0], [1.84, CX.y + 0.1, -0.3], [1.84, 0.2, -0.3], [1.84, 0.2, -0.925], [-1.6, 0.2, -0.925], [-1.6, 0.25, -0.925]], 0.04, 0.02), 0.0045, { seg: 600, radial: 8 }), M.steel))
    }
    {
      const cb = new THREE.Group(), w = 0.92, h = 1.82, d = 0.32, yb = SK + 0.1
      cb.add(mesh(at(box(w + 0.02, 0.1, d + 0.02, 0.01), 0, SK + 0.05, 0), M.dark))
      cb.add(mesh(at(box(w, h, d, 0.014), 0, yb + h / 2, 0), M.grey))
      cb.add(mesh(at(box(w + 0.04, 0.03, d + 0.04, 0.01), 0, yb + h + 0.015, 0), M.grey))
      for (const s of [-1, 1]) cb.add(mesh(at(box(w / 2 - 0.012, h - 0.04, 0.014, 0.006), s * (w / 4), yb + h / 2, d / 2 + 0.004), M.grey))
      for (const s of [-1, 1]) cb.add(mesh(at(box(0.018, 0.16, 0.03, 0.006), s * 0.03, yb + h / 2, d / 2 + 0.02), M.chrome))
      const sc = screen(0.34, 0.21, 640, 396); sc.mesh.position.set(-w / 4, yb + h * 0.66, d / 2 + 0.0125); cb.add(sc.mesh)
      cb.add(mesh(at(box(0.38, 0.25, 0.012, 0.008), -w / 4, yb + h * 0.66, d / 2 + 0.006), M.black))
      const lamps = [0x39d37a, 0xf2b134, 0xd8462b]
      lamps.forEach((c, k) => {
        cb.add(mesh(at(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 24).rotateX(PI / 2), w / 4 - 0.07 + k * 0.07, yb + h * 0.74, d / 2 + 0.018), M.chrome))
        const lm = clip(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: k === 0 ? 2.4 : 0.05 }))
        const l = mesh(at(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 24).rotateX(PI / 2), w / 4 - 0.07 + k * 0.07, yb + h * 0.74, d / 2 + 0.03), lm); cb.add(l)
        dyn['lamp' + k] = lm
      })
      cb.add(mesh(at(GEO.lathe([[0, 0], [0.04, 0], [0.04, 0.006], [0, 0.006]], 32).rotateX(PI / 2), w / 4, yb + h * 0.6, d / 2 + 0.014), clip(new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.5 }))))
      cb.add(mesh(at(GEO.lathe([[0, 0], [0.012, 0], [0.012, 0.02], [0.026, 0.024], [0.028, 0.034], [0, 0.04]], 32).rotateX(PI / 2), w / 4, yb + h * 0.6, d / 2 + 0.018), clip(new THREE.MeshStandardMaterial({ color: 0xc8261b, roughness: 0.35 }))))
      const tag = plate('INNOHELIX  PCS  ·  05', 0.36, 0.045, 640, 80, '#e9f2ef', '#0e3c39'); tag.position.set(-w / 4, yb + h - 0.08, d / 2 + 0.012); cb.add(tag)
      cb.position.set(-0.16, 0, ZC)
      dyn.screens.hmi = sc
      add(cb, { name: 'Process control cabinet', explode: [0, 0, -0.2], count: 14 })
      anchors.control = { obj: cb, at: [-w / 4, yb + h * 0.66 + 0.12, d / 2] }
      // power conduits to the two heater terminal boxes and the superheater
      const conduits = [
        [[-0.42, yb + h + 0.03, ZC], [-0.42, 2.12, ZC], [R1.x, 2.12, -0.4], [R1.x, 1.62, -0.35], [R1.x, (R1.h0 + R1.h1) / 2 + 0.24, -0.35]],
        [[0.1, yb + h + 0.03, ZC], [0.1, 2.18, ZC], [R2.x, 2.18, -0.42], [R2.x, (R2.h0 + R2.h1) / 2 + 0.24, -0.35]],
        [[0.24, yb + h + 0.03, ZC], [0.24, 2.27, ZC], [1.26, 2.27, ZC], [1.26, 0.9, -0.6], [1.26, 0.72, -0.6]],
      ]
      for (const c of conduits) piping.add(mesh(GEO.pipe(bendPts(c, 0.1, 0.02), 0.013, { seg: 220, radial: 10 }), M.conduit))
    }

    // ---------------------------------------------------------------- flow paths for the streaks (machine metres)
    const thru = (R, off) => [[R.x, R.y1 + 0.17, 0], [R.x + off * 0.4, R.y1 - 0.12, 0], [R.x + off, R.y1 - 0.24, 0], [R.x + off, R.bed0 - 0.14, 0], [R.x + off * 0.4, R.y0 + 0.04, 0], [R.x, R.y0 - 0.1, 0]]
    const offs = [-0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09]
    const flowPaths = offs.map((o) => {
      const pts = [...P.feed.slice(0, 2), [XR, YFH, 0], [R1.x, YFH, 0], ...thru(R1, o), [R1.x, YX, 0], [XC, YX, 0], [XC, YCH, 0], [R2.x, YCH, 0], ...thru(R2, -o), [R2.x, YX, 0], [0.68, YX, 0], [0.68, CX.y, 0], [CX.x0 - 0.12, CX.y, 0], [CX.x0 + 0.02, CX.y + (o < -0.02 ? -0.032 : o > 0.02 ? 0.032 : 0), 0], [CX.x1 - 0.02, CX.y + (o < -0.02 ? -0.032 : o > 0.02 ? 0.032 : 0), 0], [CX.x1 + 0.12, CX.y, 0], [1.96, CX.y, 0]]
      const dense = bendPts(pts, 0.05, 0.02)
      // arc length marks: end of stage 1 bed, end of stage 2 bed
      let L = 0; const acc = [0]; for (let i = 1; i < dense.length; i++) { L += dense[i].distanceTo(dense[i - 1]); acc.push(L) }
      const mark = (pred) => { const i = dense.findIndex(pred); return i < 0 ? 1 : acc[i] / L }
      const u1 = mark((p) => Math.abs(p.x - R1.x) < 0.12 && p.y < R1.bed0 - 0.1)
      const u2 = mark((p) => Math.abs(p.x - R2.x) < 0.12 && p.y < R2.bed0 - 0.1 && p.x > 0)
      return { pts: dense.map((v) => v.toArray()), u1, u2 }
    })
    const bypassPath = (() => {
      const pts = [...P.feed.slice(0, 2), [XR, YBP, 0], [XC, YBP, 0], [XC, YCH, 0], [R2.x, YCH, 0], ...thru(R2, 0), [R2.x, YX, 0], [0.68, YX, 0], [0.68, CX.y, 0], [1.96, CX.y, 0]]
      const dense = bendPts(pts, 0.05, 0.02)
      let L = 0; const acc = [0]; for (let i = 1; i < dense.length; i++) { L += dense[i].distanceTo(dense[i - 1]); acc.push(L) }
      const i2 = dense.findIndex((p) => Math.abs(p.x - R2.x) < 0.12 && p.y < R2.bed0 - 0.1 && p.x > 0)
      return { pts: dense.map((v) => v.toArray()), u1: 0, u2: i2 < 0 ? 1 : acc[i2] / L }
    })()
    const steamPath = { pts: bendPts(P.steam, 0.06, 0.02).map((v) => v.toArray()) }

    return { R1, R2, SK, RI, anchors, dyn, paths: { main: flowPaths, bypass: bypassPath, steam: steamPath }, size: 3.9 }
  }

  window.InnoReformer = { build }
})()
