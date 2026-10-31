/* InnoHelix two-stage catalytic upgrading module: the cut-open lab page (Machine Skill kit, window.LabKit).
   The model lives in reformer-model.js; this file is the solver, the labels, the screens and the controls. */
(function () {
  'use strict'
  const K = window.LabKit
  const { THREE, Lab, clamp, lerp, smoothstep, approach, fmt, ease } = K
  const q = new URLSearchParams(location.search)
  const EN = q.get('lang') === 'en'
  const L = (zh, en) => (EN ? en : zh)
  const IN_SITE = q.has('site') || window.top !== window
  const INLINE = q.has('site')          // embedded in the product page: start when scrolled into view, no scroll trap
  document.documentElement.lang = EN ? 'en' : 'zh-CN'
  document.title = L('两级催化重整模块 · InnoHelix', 'Two-stage upgrading module · InnoHelix')

  K.setCaps('red', [0.5, 0.075, 0.045])

  // ------------------------------------------------------------------ 1. the lab
  const lab = new Lab({
    prompt: L('两级催化重整模块 · 示意模型，读数实时计算', 'Two-stage upgrading module · illustrative, computed live'),
    no: 4,
    title: L('两级催化重整', 'Two-stage reforming'),
    sub: L('复杂热解气 → 稳定合成气', 'pyrolysis gas to stable syngas'),
    size: 3.9,
    theme: 'night',
    bg: 0x0b1716,
    exposure: 1.05,
    view: { az: 24, el: 14, dist: 2.02, target: [0.12, 1.3, -0.15], fov: 30, frameX: -0.12 },
    cut: { a: [0, 0, 1], center: [0, 1.2, 0], reach: 0.3, offset: -0.003 },
    pills: [],
    autoOrbit: false,
  })
  lab.$('.lab-prompt b').textContent = 'InnoHelix'
  // a darker floor: the side column must stay legible from any orbit angle
  lab.floor.material.color.set(0x0c1614); lab.floor.material.roughness = 0.8; lab.floor.material.envMapIntensity = 0.3

  // ------------------------------------------------------------------ 2. the parts
  const model = window.InnoReformer.build(K, (obj, o) => lab.add(obj, o), {})
  const A = model.anchors, D = model.dyn, R1 = model.R1, R2 = model.R2

  // ------------------------------------------------------------------ 3. the solver
  // Example feed: waste plastic / tyre pyrolysis gas, mol per 100 mol dry gas; tar lumped as naphthalene (C10H8)
  const FEED = { H2: 20, CO: 12, CO2: 8, CH4: 30, C2H4: 24, N2: 6, TAR: 0.4 }
  const F_DRY = 40                                   // reference flow of the model skid: sets residence time and gas velocity only
  const P_OUT = 1.3                                  // bar abs at the stage 2 outlet
  const A_T = Math.PI * model.RI ** 2, V1 = A_T * (R1.bed1 - R1.bed0), V2 = A_T * (R2.bed1 - R2.bed0)
  const Rg = 8.314
  const kSMR = (T) => Math.exp(30.114 - 26830 / T)   // CH4 + H2O = CO + 3 H2, bar^2
  const kWGS = (T) => Math.exp(4400 / T - 4.036)     // CO + H2O = CO2 + H2
  const kCrack = (T) => Math.exp(9.73 - 9003 / T)    // CH4 = C + 2 H2, bar
  const kBoud = (T) => Math.exp(20747 / T - 21.14)   // 2 CO = C + CO2, 1/bar
  const tot = (n) => n.H2 + n.CO + n.CO2 + n.CH4 + n.H2O + n.N2
  const Qact = (nTot, T, P) => (F_DRY * nTot / 100) / 3600 * (T / 273.15) * (1.01325 / P)   // m3/s at T, P
  const ergun = (u, rho, eps, dp, Lb, mu = 4.0e-5) => Lb * (150 * mu * (1 - eps) ** 2 * u / (eps ** 3 * dp * dp) + 1.75 * rho * (1 - eps) * u * u / (eps ** 3 * dp))
  function wgsY(n, x1, K2) {
    const a = n.CO + x1, b = n.H2O - x1, c = n.CO2, d = n.H2 + 3 * x1
    const qa = 1 - K2, qb = c + d + K2 * (a + b), qc = c * d - K2 * a * b, lo = -Math.min(c, d), hi = Math.min(a, b)
    if (Math.abs(qa) < 1e-9) return clamp(-qc / qb, lo, hi)
    const s = Math.sqrt(Math.max(0, qb * qb - 4 * qa * qc)), r1 = (-qb + s) / (2 * qa), r2 = (-qb - s) / (2 * qa)
    return r1 >= lo - 1e-9 && r1 <= hi + 1e-9 ? r1 : r2
  }
  const after = (n, x1, y) => ({ H2: n.H2 + 3 * x1 + y, CO: n.CO + x1 - y, CO2: n.CO2 + y, CH4: n.CH4 - x1, H2O: n.H2O - x1 - y, N2: n.N2 })
  function equilibrium(n, T, P, eta) {
    const K1 = kSMR(T), K2 = kWGS(T)
    let lo = 0, hi = Math.min(n.CH4, n.H2O) * 0.999999
    for (let i = 0; i < 60; i++) {
      const x = (lo + hi) / 2, m = after(n, x, wgsY(n, x, K2)), N = tot(m)
      if (m.CO * m.H2 ** 3 / (m.CH4 * m.H2O) * (P / N) ** 2 > K1) hi = x; else lo = x
    }
    const x1 = lo * eta
    return after(n, x1, wgsY(n, x1, K2))
  }
  function solve(st) {
    const T2 = st.T2 + 273.15, T1 = st.T1 + 273.15, f = st.feed
    const C_HC = f.CH4 + 2 * f.C2H4 + 10 * f.TAR
    const H2O = st.sc * C_HC
    const dry0 = f.H2 + f.CO + f.CO2 + f.CH4 + f.C2H4 + f.N2
    const wet0 = dry0 + H2O + f.TAR
    // stage 1: first order tar and C2-C4 cracking / reforming on the sacrificial bed, residence time from the real flow
    const tau = 0.45 * V1 / Qact(wet0, T1, P_OUT + 0.03)
    const kT = 2.9e6 * Math.exp(-100000 / (Rg * T1)), kC = 1.8e5 * Math.exp(-80000 / (Rg * T1))
    const thru = 1 - st.bypass
    const Xt = thru * (1 - Math.exp(-kT * tau)), Xc = thru * (1 - Math.exp(-kC * tau))
    const n = { H2: f.H2, CO: f.CO, CO2: f.CO2, CH4: f.CH4, H2O, N2: f.N2 }
    // everything heavier than CH4 ends up steam reformed (in stage 1, or on the main bed if it slipped through)
    n.CO += 2 * f.C2H4 + 10 * f.TAR; n.H2 += 4 * f.C2H4 + 14 * f.TAR; n.H2O -= 2 * f.C2H4 + 10 * f.TAR
    const tarSlip = f.TAR * (1 - Xt)
    // stage 2: CH4 reforming + water-gas shift at equilibrium (15 K approach), scaled by the catalyst activity
    const eta = 1 - Math.exp(-6 * st.a2)
    const m = equilibrium(n, T2 - 15, P_OUT, eta)
    const N = tot(m), dry = N - m.H2O, p = (k) => (m[k] / N) * P_OUT
    const aC = Math.max(kCrack(T2) * p('CH4') / p('H2') ** 2, kBoud(T2) * p('CO') ** 2 / p('CO2'))
    // pressure drop: Ergun on both beds (coke fills the main bed voids as the activity falls)
    const Mw = (m.H2 * 2 + m.CO * 28 + m.CO2 * 44 + m.CH4 * 16 + m.H2O * 18 + m.N2 * 28) / N / 1000
    const u2 = Qact(N, T2, P_OUT) / A_T, rho2 = P_OUT * 1e5 * Mw / (Rg * T2)
    const dP2 = ergun(u2, rho2, 0.45 - 0.15 * (1 - st.a2), 0.012, R2.bed1 - R2.bed0)
    const u1 = Qact(wet0, T1, P_OUT) * thru / A_T, rho1 = P_OUT * 1e5 * 0.02 / (Rg * T1)
    const dP1 = ergun(u1, rho1, 0.45, 0.01, R1.bed1 - R1.bed0)
    return {
      r: m.H2 / m.CO, XCH4: (1 - m.CH4 / f.CH4) * 100, Xt: Xt * 100, Xc: Xc * 100, aC, tarSlip,
      dry: { H2: (m.H2 / dry) * 100, CO: (m.CO / dry) * 100, CO2: (m.CO2 / dry) * 100, CH4: (m.CH4 / dry) * 100 },
      dP1, dP2, u2, Q: Qact(N, T2, P_OUT),
      tarG: (f.TAR / dry0) * 128 / 0.022414,
    }
  }

  const t2 = lab.slider({ id: 't2', label: L('二段床温', 'Stage 2 bed'), min: 700, max: 950, value: 860, unit: '°C', ends: ['700 °C', '950 °C'] })
  const sc = lab.slider({ id: 'sc', label: L('水碳比 S/C', 'Steam to carbon'), min: 0.8, max: 3.0, value: 1.1, digits: 2, ends: [L('少蒸汽', 'lean'), L('多蒸汽', 'wet')] })
  lab.hero({ label: L('合成气 H₂/CO', 'Syngas H₂/CO'), unit: L('摩尔比', 'mol/mol'), max: 4, digits: 2 })

  const S = { T2: 860, T1: 770, sc: 1.1, a2: 1, bypass: 0, feed: { ...FEED }, jit: { H2: 0, CO: 0, CH4: 0, C2H4: 0, TAR: 0 }, hist: [], out: null }
  S.out = solve(S)
  let screenT = 0, cokeY = Infinity

  // flow streaks: raw gas amber, pre-reformed gold, syngas teal; steam pale blue
  const AMBER = [0.5, 0.24, 0.06], GOLD = [0.5, 0.38, 0.16], TEAL = [0.1, 0.46, 0.4]
  const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
  const gasColor = (u1, u2, u) => u < u1 ? mix3(AMBER, GOLD, smoothstep(u1 - 0.06, u1, u)) : mix3(GOLD, TEAL, smoothstep(u2 - 0.1, u2, u))
  const mainFlow = lab.flow({ paths: model.paths.main.map((p) => p.pts), count: 560, length: 0.028, speed: 0.04, color: (k, u) => gasColor(model.paths.main[k].u1, model.paths.main[k].u2, u) })
  const bypFlow = lab.flow({ paths: [model.paths.bypass.pts], count: 260, length: 0.035, speed: 0.045, seed: 9, color: (k, u) => (u < model.paths.bypass.u2 - 0.08 ? AMBER : mix3(AMBER, TEAL, smoothstep(model.paths.bypass.u2 - 0.08, model.paths.bypass.u2, u) * 0.7)) })
  const steamFlow = lab.flow({ paths: [model.paths.steam.pts], count: 90, length: 0.05, speed: 0.08, seed: 5, color: () => [0.34, 0.42, 0.52] })

  // the main bed shows coke creeping down from the top when it has to take the tar
  const bed2 = D.pellets.find((p) => p.n === 2)
  {
    const glow = D.cat2.userData.extraShader
    D.cat2.userData.extraKey = 'heatcoke'
    D.cat2.userData.extraShader = (sh) => { glow(sh); sh.fragmentShader = sh.fragmentShader.replace('if (!labCap) totalEmissiveRadiance += bb * k * k * 6.0;', 'float coke = 1.0;\n#ifdef USE_COLOR\ncoke = vColor.r;\n#endif\nif (!labCap) totalEmissiveRadiance += bb * k * k * 6.0 * coke;') }
    D.cat2.needsUpdate = true
  }
  const WHITE = new THREE.Color(1, 1, 1), COKE = new THREE.Color(0.1, 0.09, 0.085), tmpC = new THREE.Color()
  if (bed2) { for (let i = 0; i < bed2.mesh.count; i++) bed2.mesh.setColorAt(i, WHITE); bed2.mesh.instanceColor.needsUpdate = true }
  function recolor(yF) {
    if (!bed2) return
    const ys = bed2.mesh.userData.ys
    for (let i = 0; i < ys.length; i++) bed2.mesh.setColorAt(i, tmpC.copy(WHITE).lerp(COKE, smoothstep(yF - 0.02, yF + 0.02, ys[i])))
    bed2.mesh.instanceColor.needsUpdate = true
  }

  lab.onTick((dt) => {
    // the plant follows the set-points with its thermal mass; stage 1 runs 90 K under stage 2
    S.T2 = approach(S.T2, t2.value, 4.5, dt); S.T1 = S.T2 - 90; S.sc = approach(S.sc, sc.value, 1.2, dt)
    S.bypass = approach(S.bypass, lab.broken ? 1 : 0, 0.6, dt)
    // the feed is never steady: slow wander of the main species (what the analyser is there to see)
    for (const k in S.jit) { S.jit[k] += (-S.jit[k] * 0.25 + (Math.random() - 0.5) * 0.35) * dt; S.feed[k] = FEED[k] * (1 + clamp(S.jit[k], -0.12, 0.12)) }
    const o = solve(S)
    S.out = o
    // main bed activity: tar slip poisons, steam gasifies the coke back off, carbon activity above 1 lays more down
    const kr = 0.06 * S.sc, kd = 0.6, kc = 0.4
    S.a2 = clamp(S.a2 + (kr * (1 - S.a2) - kd * o.tarSlip * S.a2 - kc * Math.max(0, o.aC - 1) * S.a2) * dt, 0.02, 1)
    if (Math.abs(S.a2 - 1) < 1e-4 && !lab.broken) S.a2 = 1
    const yF = R2.bed1 - (1 - S.a2) * (R2.bed1 - R2.bed0) * 1.15
    if (Math.abs(yF - cokeY) > 0.004) { cokeY = yF; recolor(yF) }

    // heat: beds, tubes, coils and ball layers glow at their solver temperatures
    const K1 = S.T1 + 273.15, K2 = S.T2 + 273.15
    D.cat1.userData.heat.value = K1 - 70; D.balls1.userData.heat.value = K1 - 110; D.tube1.userData.heat.value = K1 - 90; D.coil1.userData.heat.value = K1 + 120
    D.cat2.userData.heat.value = K2 - 70; D.balls2.userData.heat.value = K2 - 110; D.tube2.userData.heat.value = K2 - 90; D.coil2.userData.heat.value = K2 + 120

    // flows: visible inside the cut or the x-ray, speed from the real volumetric flow
    const see = Math.max(lab.state.cut, lab.state.xray * 0.8)
    const v = 0.035 * (o.Q / 0.09)
    mainFlow.opacity = see * (1 - S.bypass * 0.85); mainFlow.speed = v
    bypFlow.opacity = see * S.bypass; bypFlow.speed = v * 1.1
    steamFlow.opacity = see * clamp(S.sc / 1.5, 0.3, 1); steamFlow.speed = 0.06 + 0.03 * S.sc
    for (const p of D.pellets) for (const m of p.all) m.visible = lab.state.cut > 0.002
    if (D.bypassArrow) D.bypassArrow.parent.rotation.y = S.bypass * Math.PI / 2
    D.lamp1.emissiveIntensity = o.aC > 1 || S.a2 < 0.6 ? 2.4 : 0.05
    D.lamp2.emissiveIntensity = lab.broken && Math.floor(lab.time * 3) % 2 === 0 ? 2.6 : 0.05

    // the hero: H2/CO for Fischer-Tropsch (cobalt FT wants about 2.0 to 2.2)
    const bad = (lab.broken && S.a2 < 0.6) || o.aC > 1
    const state = lab.broken && S.a2 < 0.6 ? L('主催化剂失活', 'main bed poisoned')
      : o.aC > 1 ? L('积碳风险', 'carbon forming')
      : o.r >= 1.9 && o.r <= 2.25 ? L('满足费托进料', 'ready for FT')
      : o.r < 1.9 ? L('氢碳比偏低', 'short of hydrogen') : L('高于费托窗口', 'above the FT window')
    lab.setHero(o.r, {
      state, bad,
      sub: L(`CH₄ 转化 ${fmt(o.XCH4, 1)} % · 焦油转化 ${fmt(o.Xt, 1)} % · 碳活度 <span class="${o.aC > 1 ? 'bad' : ''}">${fmt(o.aC, 2)}</span>`,
        `CH₄ ${fmt(o.XCH4, 1)} % converted · tar ${fmt(o.Xt, 1)} % · carbon activity <span class="${o.aC > 1 ? 'bad' : ''}">${fmt(o.aC, 2)}</span>`),
    })

    screenT -= dt
    if (screenT <= 0) { screenT = 0.25; S.hist.push(o.r); if (S.hist.length > 150) S.hist.shift(); drawHMI(state, bad); drawGasId(); drawGauges() }
  })

  // ------------------------------------------------------------------ labels (live values from the solver)
  const lbl = (a, zh, en, value, side, at) => lab.label(a.obj, L(zh, en), { at: at ?? a.at, value, side })
  const prof = (T, d) => `${fmt(T - d[0])} / ${fmt(T - d[1])} / ${fmt(T - d[2])} °C`
  lbl(A.bypass, '一段旁通阀', 'Stage 1 bypass', () => (S.bypass > 0.5 ? L('打开', 'open') : L('关闭', 'closed')), 'left')
  lbl(A.analyser, '气体成分识别 · 03', 'Gas fingerprinting · 03', () => `H₂ ${fmt(S.feed.H2)} % · CH₄ ${fmt(S.feed.CH4)} %`, 'left')
  lbl(A.control, '过程控制 · 05', 'Process control · 05', () => `H₂/CO ${fmt(S.out.r, 2)}`, 'left')
  lbl(A.bed1, '一段 · 牺牲性焦油预裂解床', 'Stage 1 · sacrificial tar bed', () => L(`${fmt(S.T1)} °C · 焦油转化 ${fmt(S.out.Xt, 1)} %`, `${fmt(S.T1)} °C · tar ${fmt(S.out.Xt, 1)} % converted`), 'left')
  lbl(A.mixer, '静态混合器 · 蒸汽注入', 'Static mixer · steam in', () => `S/C ${fmt(S.sc, 2)}`, 'left')
  lbl(A.tc2, '多点热电偶', 'Multipoint thermocouple', () => prof(S.T2, [30, 10, 2]), 'right', A.tc2.pts[0])
  lbl(A.heater2, '电加热元件', 'Heating element', () => `${fmt(S.T2 + 120)} °C`, 'right')
  lbl(A.bed2, '二段 · 主重整床', 'Stage 2 · main reforming bed', () => (S.a2 < 0.98 ? L(`${fmt(S.T2)} °C · 活性 ${fmt(S.a2 * 100)} %`, `${fmt(S.T2)} °C · activity ${fmt(S.a2 * 100)} %`) : L(`${fmt(S.T2)} °C · CH₄ 转化 ${fmt(S.out.XCH4, 1)} %`, `${fmt(S.T2)} °C · CH₄ ${fmt(S.out.XCH4, 1)} %`)), 'right')
  lbl(A.superheater, '蒸汽过热器', 'Steam superheater', () => '420 °C', 'right')
  lbl(A.cooler, '合成气冷却器', 'Syngas cooler', () => L(`出口 ${fmt(32 + (S.T2 - 32) * 0.12)} °C`, `out ${fmt(32 + (S.T2 - 32) * 0.12)} °C`), 'right')

  lab._updateLabels = function () {
    const on = this.state.labels, W = innerWidth, H = innerHeight, svg = this.$('.lab-labels svg')
    const ctr = new THREE.Vector3().setFromMatrixPosition(this.machine.matrixWorld).project(this.camera), items = []
    for (const Lb of this.labels) {
      const p = Lb.at.clone(); Lb.obj.updateWorldMatrix(true, false); p.applyMatrix4(Lb.obj.matrixWorld)
      const sp = p.project(this.camera)
      if (!(on > 0.01 && sp.z < 1 && Lb.obj.visible !== false)) { Lb.el.style.opacity = '0'; continue }
      if (Lb.value) Lb.small.textContent = Lb.value()
      items.push({ L: Lb, x: (sp.x * 0.5 + 0.5) * W, y: (-sp.y * 0.5 + 0.5) * H, side: Lb.side ?? (sp.x < ctr.x ? 'left' : 'right') })
    }
    const narrow = W < 760, sideL = narrow ? W : this.$('.lab-side').getBoundingClientRect().left || W * 0.73
    for (const side of ['left', 'right']) {
      const list = items.filter((i) => i.side === side).sort((a, b) => a.y - b.y)
      if (!list.length) continue
      const gap = Math.max(narrow ? 28 : 34, H * 0.045); let last = -1e9
      for (const it of list) { it.ly = Math.max(it.y, last + gap); last = it.ly }
      const wMax = Math.max(...list.map((i) => i.L.el.offsetWidth))
      const xs = side === 'left' ? Math.min(...list.map((i) => i.x)) - W * 0.05 : Math.max(...list.map((i) => i.x)) + W * 0.05
      const lo = side === 'left' ? wMax + 18 : W * 0.04, hi = side === 'left' ? W * 0.6 : Math.max(lo, sideL - wMax - 28)
      for (const it of list) it.lx = clamp(xs, lo, hi)
    }
    let lines = ''
    for (const { L: Lb, x, y, lx, ly, side } of items) {
      Lb.el.className = 'lab-lab' + (side === 'left' ? ' left' : '')
      Lb.el.style.left = `${lx + (side === 'left' ? -8 : 8)}px`; Lb.el.style.top = `${ly}px`; Lb.el.style.opacity = String(on)
      lines += `<path d="M${x.toFixed(1)},${y.toFixed(1)} L${(lx + (side === 'left' ? 12 : -12)).toFixed(1)},${ly.toFixed(1)} L${lx.toFixed(1)},${ly.toFixed(1)}" stroke="rgba(240,238,232,${(0.5 * on).toFixed(3)})" stroke-width="1" fill="none"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="rgba(240,238,232,${on.toFixed(3)})" stroke="#000" stroke-width="1.2"/>`
    }
    svg.innerHTML = lines
  }

  // ------------------------------------------------------------------ screens: HMI (05), gas ID (03), dial gauges
  const FONT = '"DM Sans", Inter, "PingFang SC", Arial, sans-serif'
  function drawHMI(state, bad) {
    const s = D.screens.hmi; if (!s) return
    const g = s.ctx, W = s.canvas.width, H = s.canvas.height, o = S.out
    g.fillStyle = '#06110f'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#0e3c39'; g.fillRect(0, 0, W, 44)
    g.font = `600 21px ${FONT}`; g.textBaseline = 'middle'; g.fillStyle = '#dff3ee'; g.textAlign = 'left'; g.fillText('INNOHELIX PCS · 05', 18, 23)
    g.textAlign = 'right'; g.fillStyle = bad ? '#ff7a52' : '#5fe0d2'; g.fillText(state, W - 18, 23)
    // H2/CO trend with the FT window
    const x0 = 22, y0 = 64, w = W - 250, h = H - 92, lo = 1.4, hi = 3.6, Y = (v) => y0 + h - ((v - lo) / (hi - lo)) * h
    g.fillStyle = 'rgba(79,194,184,0.14)'; g.fillRect(x0, Y(2.25), w, Y(1.9) - Y(2.25))
    g.strokeStyle = 'rgba(223,243,238,0.12)'; g.lineWidth = 1
    for (let v = 1.5; v <= 3.5; v += 0.5) { g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x0 + w, Y(v)); g.stroke(); g.fillStyle = 'rgba(223,243,238,0.45)'; g.font = `500 14px ${FONT}`; g.textAlign = 'left'; g.fillText(v.toFixed(1), x0 + 4, Y(v) - 9) }
    g.fillStyle = 'rgba(95,224,210,0.8)'; g.fillText('FT', x0 + w - 26, Y(2.07))
    g.strokeStyle = bad ? '#ff7a52' : '#5fe0d2'; g.lineWidth = 3; g.beginPath()
    S.hist.forEach((v, i) => { const x = x0 + (i / 149) * w, y = Y(clamp(v, lo, hi)); i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.stroke()
    // readouts
    const rows = [['H₂/CO', fmt(o.r, 2)], ['T1', `${fmt(S.T1)} °C`], ['T2', `${fmt(S.T2)} °C`], ['S/C', fmt(S.sc, 2)], ['ΔP', `${fmt((o.dP1 + o.dP2) / 1000, 1)} kPa`], ['aC', fmt(o.aC, 2)], [L('活性', 'Cat.'), `${fmt(S.a2 * 100)} %`]]
    rows.forEach(([k, v], i) => {
      const y = 76 + i * 44
      g.textAlign = 'left'; g.fillStyle = 'rgba(223,243,238,0.55)'; g.font = `500 17px ${FONT}`; g.fillText(k, W - 212, y)
      g.textAlign = 'right'; g.fillStyle = (k === 'aC' && o.aC > 1) || (i === 6 && S.a2 < 0.6) ? '#ff7a52' : '#f2f3f1'; g.font = `600 ${i === 0 ? 30 : 22}px ${FONT}`; g.fillText(v, W - 18, y)
    })
    s.tex.needsUpdate = true
  }
  function drawGasId() {
    const s = D.screens.gasid; if (!s) return
    const g = s.ctx, W = s.canvas.width, H = s.canvas.height, f = S.feed
    const dry = f.H2 + f.CO + f.CO2 + f.CH4 + f.C2H4 + f.N2
    g.fillStyle = '#06110f'; g.fillRect(0, 0, W, H)
    g.font = `600 20px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#5fe0d2'; g.fillText(L('GAS ID · 入口热解气', 'GAS ID · INLET'), 16, 22)
    const rows = [['H₂', f.H2], ['CO', f.CO], ['CO₂', f.CO2], ['CH₄', f.CH4], ['C₂–C₄', f.C2H4], ['N₂', f.N2]]
    rows.forEach(([k, v], i) => {
      const y = 56 + i * 33, pct = (v / dry) * 100
      g.fillStyle = 'rgba(223,243,238,0.6)'; g.font = `500 16px ${FONT}`; g.textAlign = 'left'; g.fillText(k, 16, y)
      g.fillStyle = 'rgba(223,243,238,0.08)'; g.fillRect(96, y - 9, W - 200, 18)
      g.fillStyle = i < 2 ? '#5fe0d2' : i === 4 ? '#ffa64a' : '#9fb3ad'; g.fillRect(96, y - 9, ((W - 200) * pct) / 40, 18)
      g.fillStyle = '#f2f3f1'; g.textAlign = 'right'; g.fillText(`${pct.toFixed(1)} %`, W - 16, y)
    })
    g.textAlign = 'left'; g.fillStyle = '#ffa64a'; g.font = `600 16px ${FONT}`; g.fillText(L(`焦油 ${fmt(S.out.tarG, 1)} g/Nm³`, `tar ${fmt(S.out.tarG, 1)} g/Nm³`), 16, H - 18)
    s.tex.needsUpdate = true
  }
  const dialDrawn = {}
  function drawGauges() {
    const Pin = 30 + (S.out.dP1 + S.out.dP2) / 1000 + 1.5, Pout = 30 - 2.5
    const Pmid = Pout + 1.5 + S.out.dP2 / 1000
    for (const [key, P] of [['gaugeIn', Pin], ['gaugeOut', Pout], ['gaugeR1', Pin - 0.8], ['gaugeR2', Pmid]]) {
      const s = D.screens[key]; if (!s) continue
      if (!dialDrawn[key]) {
        dialDrawn[key] = true
        const g = s.ctx, C = 128
        g.fillStyle = '#f1f1ee'; g.fillRect(0, 0, 256, 256)
        g.strokeStyle = '#1b1b1b'; g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'
        for (let v = 0; v <= 60; v += 2) { const a = (-225 + (270 * v) / 60) * Math.PI / 180, r0 = v % 10 ? 100 : 90; g.lineWidth = v % 10 ? 2 : 4; g.beginPath(); g.moveTo(C + r0 * Math.cos(a), C + r0 * Math.sin(a)); g.lineTo(C + 110 * Math.cos(a), C + 110 * Math.sin(a)); g.stroke(); if (v % 10 === 0) { g.font = `600 24px ${FONT}`; g.fillText(String(v), C + 70 * Math.cos(a), C + 70 * Math.sin(a)) } }
        g.strokeStyle = '#c8261b'; g.lineWidth = 7; g.beginPath(); g.arc(C, C, 106, ((-225 + 225) * Math.PI) / 180, ((-225 + 270) * Math.PI) / 180); g.stroke()
        g.font = `500 20px ${FONT}`; g.fillText('kPa', C, C + 50)
        s.tex.needsUpdate = true
      }
      s.needle.rotation.z = ((135 - (270 * clamp(P, 0, 60)) / 60) * Math.PI) / 180
    }
  }

  // ------------------------------------------------------------------ 4. break it, explain it
  lab.breakIt({
    label: L('旁通一段', 'Bypass stage 1'),
    run: () => {},
    reset: () => { S.a2 = 1; cokeY = Infinity },
  })
  lab.how(
    L('示例原料为废塑料 / 废轮胎热解气（干基 H₂ 20 %、CO 12 %、CO₂ 8 %、CH₄ 30 %、C₂–C₄ 24 %、N₂ 6 %，焦油约 23 g/Nm³，以萘计）。一段按一级动力学计算焦油与轻烃的裂解重整，停留时间由实际体积流量求得；二段按 CH₄ 蒸汽重整与水煤气变换平衡计算（接近平衡温差 15 K），乘以催化剂活性。积碳倾向用出口平衡气的碳活度判断，床层压降用 Ergun 方程。一段床温取二段 − 90 °C。旁通一段后焦油直接进入主床，活性变化按时间压缩显示。这是说明原理的简化模型，不代表具体项目数据。',
      'Example feed: waste plastic / tyre pyrolysis gas (dry H₂ 20 %, CO 12 %, CO₂ 8 %, CH₄ 30 %, C₂–C₄ 24 %, N₂ 6 %, about 23 g/Nm³ tar as naphthalene). Stage 1: first order tar and light hydrocarbon cracking, residence time from the real volumetric flow. Stage 2: CH₄ steam reforming and water-gas shift at equilibrium (15 K approach), scaled by catalyst activity. Carbon risk from the carbon activity of the outlet gas, bed pressure drop from Ergun. Stage 1 runs 90 K below stage 2. Bypassing stage 1 sends the tar onto the main bed; activity changes are shown time-compressed. A simplified model to explain the principle, not project data.'),
    ['K₁ = exp(30.114 − 26 830 / T)   CH₄ + H₂O ⇌ CO + 3 H₂', 'K₂ = exp(4 400 / T − 4.036)   CO + H₂O ⇌ CO₂ + H₂', 'X_tar = 1 − exp(−k τ),  k = 2.9·10⁶ exp(−100 kJ / RT)', 'a_C = max(K_cr p_CH₄ / p_H₂², K_B p_CO² / p_CO₂)', 'ΔP / L = 150 μ (1−ε)² u / (ε³ d²) + 1.75 ρ (1−ε) u² / (ε³ d)'],
  )

  // ------------------------------------------------------------------ language for the kit's own UI
  const PART = { 'Skid frame': '撬座', 'Stage 1 reactor': '一段反应器', 'Stage 2 reactor': '二段反应器', 'Reactor tube': '反应管', Flanges: '法兰', Supports: '支腿', 'Top cover': '上封盖', 'Bottom cover': '下封盖', Thermowell: '热电偶套管', 'Gas distributor': '气体分布板', 'Support grid': '支撑格栅', 'Inert alumina balls': '惰性瓷球', 'Sacrificial bed': '牺牲床', 'Main reforming bed': '主重整床', 'Tar cracking granules': '焦油裂解颗粒', 'Ni reforming catalyst': '镍基重整催化剂', 'Heating element': '电加热元件', 'Ceramic fibre heater': '陶瓷纤维加热器', 'Mineral wool': '保温棉', Cladding: '铝皮', 'Process piping': '工艺管道', 'Static mixer': '静态混合器', 'Stage 1 bypass valve': '一段旁通阀', 'Steam control valve': '蒸汽调节阀', 'Steam superheater': '蒸汽过热器', 'Syngas cooler': '合成气冷却器', 'Gas analyser': '气体分析柜', 'Process control cabinet': '过程控制柜' }
  lab._buildHUD = function (Aa) {
    if (!this.heroO) return
    if (Aa > 0.0005) {
      const N = this._pc ?? (this._pc = this.partCount())
      let n = 0, cur = this.parts[0]?.name ?? ''
      for (const p of this.parts) {
        const ai = ease.out(clamp((1 - Aa) * 1.6 - (p.order / Math.max(1, this.parts.length)) * 0.6))
        if (ai > 0.92) { n += p._c ?? (p._c = p.count ?? (() => { let k = 0; p.obj.traverse((m) => { if (m.isMesh && m.layers.mask & 1) k++ }); return Math.max(1, k) })()); cur = p.name || cur }
      }
      this._building = true
      this._hs.textContent = EN ? cur : PART[cur] ?? cur
      this.metricEl.querySelector('.lbl').firstChild.textContent = L('正在建模 · ', 'Building · ')
      this._hv.textContent = fmt(n)
      this.metricEl.querySelector('.lab-big i').textContent = L(`/ ${fmt(N)} 个零件`, `of ${fmt(N)} parts`)
      this._hb.firstElementChild.style.width = `${(n / N) * 100}%`
      this._hb.classList.remove('bad')
      this._hsub.textContent = L(`${fmt(this.tris ?? 0)} 个三角面 · ${this.matCount ?? 0} 种材质`, `${fmt(this.tris ?? 0)} triangles · ${this.matCount ?? 0} materials`)
    } else if (this._building) {
      this._building = false
      this.metricEl.querySelector('.lbl').firstChild.textContent = `${this.heroO.label} · `
      this.metricEl.querySelector('.lab-big i').textContent = this.heroO.unit ?? ''
      if (this._heroPending) this.setHero(...this._heroPending)
    }
  }
  const BTN = { explode: L('拆解', 'Explode'), cut: L('剖切', 'Cut away'), xray: L('透视', 'X-ray'), slow: L('慢放', 'Slow'), labels: L('标注', 'Labels'), break: L('旁通一段', 'Bypass stage 1') }
  const relabel = () => {
    for (const b of lab.ui.querySelectorAll('.lab-modes button')) {
      const k = b.dataset.k
      b.firstChild.textContent = k === 'run' ? (lab.paused ? L('运行', 'Run') : L('暂停', 'Pause')) : k === 'break' && lab.broken ? L('恢复一段', 'Restore stage 1') : BTN[k] ?? b.firstChild.textContent
    }
  }
  const sync = lab._syncButtons.bind(lab)
  lab._syncButtons = () => { sync(); relabel() }

  // brand chrome: no prompt pills; a way back when opened on its own; Esc closes when embedded in the site
  const css = document.createElement('style')
  css.textContent = `
  :root.lab-night { --paper:#0b1716; --ink:#f2f3f1; --mute:#8a9a95; --faint:#3a4c48; --line:#1d302c; --accent:#ff7a52;
    --serif:"DM Sans","MiSans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
    --sans:"Inter","Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif }
  .lab-title { font-weight:600; letter-spacing:-.025em; font-size:clamp(30px,3vw,56px); line-height:1.05 }
  .lab-night .lab-title i { font-style:normal; font-weight:500; color:#4fc2b8; font-size:.42em; margin-top:.55em; letter-spacing:0 }
  .lab-big { font-weight:600; letter-spacing:-.045em; font-size:clamp(60px,6.6vw,124px) }
  .lab-big i { font-style:normal; font-weight:500; letter-spacing:0; font-size:.22em; color:#8a9a95 }
  .lab-bar > div { background:#4fc2b8 }
  .lab-ctl input[type=range]::-webkit-slider-runnable-track { background:linear-gradient(to right,#4fc2b8 0 var(--p,0%),var(--line) var(--p,0%) 100%) }
  .lab-ctl input[type=range]::-moz-range-progress { background:#4fc2b8 }
  .lab-modes button { border-color:#28403b }
  .lab-modes button.act { background:#008780; border-color:#008780; color:#fff }
  .lab-modes button.brk { color:#ff8a66; border-color:rgba(255,122,82,.4) }
  .lab-modes button.brk.act { background:#ff7a52; border-color:#ff7a52; color:#0b1716 }
  .lab-night .lab-prompt { background:rgba(79,194,184,.07); color:#9fb3ad }
  .lab-prompt b { color:#4fc2b8 }
  .lab-lab small { color:#9fb3ad }
  .lab-pills { display:none }
  .lab-ui::before { content:''; position:absolute; top:0; right:0; bottom:0; width:38vw; background:linear-gradient(to left, rgba(11,23,22,.9) 35%, rgba(11,23,22,0)); pointer-events:none }
  .lab-side, .lab-how, .ih-back { z-index:1 }
  @media (max-width:760px){ .lab-ui::before { width:auto; left:0; top:auto; height:62vh; background:linear-gradient(to top, rgba(11,23,22,.92) 45%, rgba(11,23,22,0)) } }
  .ih-back { position:absolute; right:4.2vw; top:4.6vh; pointer-events:auto; color:#9fb3ad; font:500 clamp(12px,.95vw,16px)/1 var(--sans); text-decoration:none; border:1px solid #28403b; border-radius:999px; padding:.65em 1.1em }
  .ih-back:hover { color:#f2f3f1; border-color:#4fc2b8 }
  @media (max-width:760px){
    .lab-prompt, .lab-no, .lab-title, .lab-how, .lab-scale { display:none }
    .lab-side { left:14px; right:14px; bottom:56px; top:auto; transform:none; width:auto }
    .lab-metric { margin-top:0 } .lab-metric .lbl { font-size:12px }
    .lab-big { font-size:42px !important; line-height:1.05 } .lab-bar { margin:.15em 0 .45em }
    .lab-sub { font-size:11.5px; line-height:1.4 }
    .lab-ctl { margin-top:8px } .lab-ctl .row { font-size:12px; margin-bottom:0 } .lab-ctl input[type=range] { height:1.9em } .lab-ctl .ends { display:none }
    .lab-modes { left:10px; right:10px; bottom:10px; flex-wrap:nowrap; overflow-x:auto; gap:6px; font-size:12px; scrollbar-width:none }
    .lab-modes::-webkit-scrollbar { display:none }
    .lab-modes button { padding:.5em .9em; white-space:nowrap } .lab-modes kbd { display:none }
    .ih-back { top:12px; bottom:auto; right:12px; font-size:12px }
  }`
  document.head.appendChild(css)
  if (!IN_SITE) {
    const a = document.createElement('a'); a.className = 'ih-back'; a.href = `../index.html${EN ? '?lang=en' : ''}#product`; a.textContent = L('← 返回官网', '← InnoHelix site')
    lab.ui.appendChild(a)
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && IN_SITE) parent.postMessage({ type: 'innohelix:machine-close' }, '*') })

  lab.bloom.strength = 0.3
  // inline on the product page: render only while on screen, wheel zoom only after a click, vertical swipes scroll the page
  let visible = !INLINE, started = false
  const render = lab.render.bind(lab)
  lab.render = (dt) => { if (visible && !document.hidden) render(dt) }
  if (INLINE) {
    const orbit = lab.controlsOrbit, el = lab.renderer.domElement
    orbit.enableZoom = false; el.style.touchAction = 'pan-y'
    el.addEventListener('pointerdown', () => { orbit.enableZoom = true })
    el.addEventListener('pointerleave', () => { orbit.enableZoom = false })
  }
  function go() {
    if (started) return
    started = true
    // portrait phones: the whole skid across the top half, the readout and sliders below it
    const narrow = innerWidth < 760
    if (narrow) lab.setView({ az: 24, el: 12, dist: 3.0, frameX: 0, target: [0.1, -0.22, -0.1] })
    lab.start()
    relabel()
    lab.$('.lab-how summary').textContent = L('计算方法', 'How it is computed')
    // after the build, open it up: the beds are the point
    if (!lab.filmMode && !q.has('closed')) setTimeout(() => { lab.toggle('cut', true); if (!narrow) lab.toggle('labels', true) }, 3600)
  }
  addEventListener('message', (e) => {
    if (e.source !== parent || !e.data || e.data.type !== 'innohelix:visible') return
    visible = !!e.data.on
    if (visible) go()
  })
  if (INLINE && window.parent !== window) parent.postMessage({ type: 'innohelix:machine-ready' }, '*')
  else { visible = true; go() }
  window.__reformer = { lab, S, model, solve }
})()
