'use strict';
/* ==========================================================================
   3D-DARSTELLUNG (Anime-Stil) — Three.js / WebGL: Kern
   Die Kampflogik bleibt 2D (x, y am Boden); hier wird sie in 3D gezeigt.
   Dieser Teil: Renderer, Bildnachbearbeitung (Gluehen, Farbstimmung,
   Vignette), Kamera mit Dynamik, Effekte (Schlagspuren, Einschlaege,
   Speedlines), Geschosse, Angriffsmarkierungen, 2D-Ebene fuer Zahlen.
   Figuren: 14-figur3d.js · Arenen: 15-arena3d.js
   Arenen ohne 3D-Fassung fallen automatisch auf die 2D-Darstellung zurueck.
   ========================================================================== */

const S3 = 1 / 34; // Welteinheiten (Pixel der Kampflogik) -> Meter
const R3 = { ready: false, G: null, rigs: new Map(), fx: new Map(), tele: new Map(), proj: new Map(), ghosts: [], impacts: [], lines: 0, perf: { n: 0, t: 0, done: false } };
const ARENA3D = {};
function r3Wanted() { return !R3.failed && SAVE.settings.gfx3d !== false && !!window.THREE && !!G && !!ARENA3D[G.arena.art]; }

/* ------------------------------------------------------------ Grundlagen */
function r3Init() {
  const T = THREE;
  const c = document.createElement('canvas');
  c.id = 'gl'; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none';
  cv.parentNode.insertBefore(c, cv);
  const r = new T.WebGLRenderer({ canvas: c, antialias: true, powerPreference: 'high-performance' });
  R3.pr = Math.min(window.devicePixelRatio || 1, 1.75);
  r.setPixelRatio(R3.pr);
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  R3.r = r; R3.canvas = c;
  R3.cam = new T.PerspectiveCamera(58, 1, 0.1, 120);
  const g = new Uint8Array([60, 60, 60, 255, 140, 140, 140, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  R3.grad = new T.DataTexture(g, 4, 1, T.RGBAFormat); R3.grad.minFilter = R3.grad.magFilter = T.NearestFilter; R3.grad.needsUpdate = true;
  R3.outline = new T.ShaderMaterial({
    uniforms: { w: { value: 0.011 }, c: { value: new T.Color('#120a12') } },
    vertexShader: 'uniform float w; void main(){ vec4 mv = modelViewMatrix * vec4(position + normal * w, 1.0); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }', side: T.BackSide
  });
  R3.glowTex = canvasTex(64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  R3.blobTex = canvasTex(64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  R3.starTex = canvasTex(128, (x) => { // Einschlag-Stern (Anime)
    x.translate(64, 64); x.fillStyle = '#fff';
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, L = k % 2 ? 34 : 62; x.beginPath(); x.moveTo(Math.cos(a - 0.12) * 8, Math.sin(a - 0.12) * 8); x.lineTo(Math.cos(a) * L, Math.sin(a) * L); x.lineTo(Math.cos(a + 0.12) * 8, Math.sin(a + 0.12) * 8); x.fill(); }
    const gr = x.createRadialGradient(0, 0, 0, 0, 0, 22); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(0, 0, 22, 0, TAU); x.fill();
  });
  r3SetupPost();
  window.addEventListener('resize', r3Resize); r3Resize();
  R3.ready = true;
}
function canvasTex(n, draw) { const k = mkCanvas(n, n); draw(k.getContext('2d')); const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; return t; }
// Bildnachbearbeitung: Gluehen (halbe Aufloesung), Farbstimmung + Vignette
const GRADE_SHADER = {
  uniforms: { tDiffuse: { value: null }, sat: { value: 1.12 }, contrast: { value: 1.06 }, tint: { value: null }, vig: { value: 0.32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat; uniform float contrast; uniform vec3 tint; uniform float vig; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.299,0.587,0.114));
      c.rgb = mix(vec3(l), c.rgb, sat); c.rgb = (c.rgb - 0.18) * contrast + 0.18; c.rgb *= tint;
      vec2 d = vUv - 0.5; c.rgb *= 1.0 - vig * smoothstep(0.35, 0.85, length(d * vec2(1.0, 0.8)));
      gl_FragColor = c; }`
};
function r3SetupPost() {
  const P = window.THREE_PP;
  if (!P || SAVE.settings.gfxFx === false) { R3.comp = null; return; }
  const T = THREE, W = window.innerWidth, H = window.innerHeight;
  const comp = new P.EffectComposer(R3.r);
  R3.rpass = new P.RenderPass(new T.Scene(), R3.cam); comp.addPass(R3.rpass);
  R3.bloom = new P.UnrealBloomPass(new T.Vector2(W / 2, H / 2), 0.45, 0.4, 0.93); comp.addPass(R3.bloom);
  GRADE_SHADER.uniforms.tint.value = new T.Color(1, 1, 1);
  R3.grade = new P.ShaderPass(GRADE_SHADER); comp.addPass(R3.grade);
  comp.addPass(new P.OutputPass());
  R3.comp = comp;
}
function r3Resize() {
  if (!R3.r) return;
  const W = window.innerWidth, H = window.innerHeight;
  R3.r.setPixelRatio(R3.pr); R3.r.setSize(W, H, false); R3.cam.aspect = W / H; R3.cam.updateProjectionMatrix();
  if (R3.comp) { R3.comp.setPixelRatio(R3.pr); R3.comp.setSize(W, H); R3.bloom.resolution.set(W / 2, H / 2); }
}
function toonMat(col, o) { return new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(col), gradientMap: R3.grad }, o || {})); }
function addOutline(mesh, w) { const o = new THREE.Mesh(mesh.geometry, w ? outlineMat(w) : R3.outline); o.castShadow = false; mesh.add(o); return mesh; }
function part(geo, mat, parent, x, y, z, noOutline) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true;
  if (!noOutline) addOutline(m); parent.add(m); return m;
}
function grp(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); parent.add(g); return g; }
function glowSprite3(col, size, opacity, tex) {
  const m = new THREE.SpriteMaterial({ map: tex || R3.glowTex, color: new THREE.Color(col), transparent: true, opacity: opacity === undefined ? 1 : opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s;
}
// Automatische Qualitaet: ist das Handy zu langsam, faellt das Gluehen weg und die Aufloesung sinkt
function r3PerfCheck(rdt) {
  const P = R3.perf; if (P.done) return;
  P.n++; P.t += rdt;
  if (P.n >= 90) {
    P.done = true;
    const ms = P.t / P.n * 1000;
    if (ms > 30 && R3.comp) { R3.comp = null; R3.pr = Math.min(R3.pr, 1.25); r3Resize(); }
    else if (ms > 30) { R3.pr = 1; r3Resize(); }
  }
}

/* ------------------------------------------------------------ Szene fuer einen Kampf aufbauen */
function r3Build() {
  const T = THREE;
  R3.slams = []; R3.poiMeshes = null; R3.rigs.clear(); R3.fx.clear(); R3.tele.clear(); R3.proj.clear(); R3.ghosts.length = 0; R3.impacts.length = 0;
  const scene = new T.Scene();
  R3.motes = null; R3.fade = []; R3.occ = [];
  ARENA3D[G.arena.art](G.arena, scene);
  const mkPts = (n, add, size) => {
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3), 3));
    const m = new T.PointsMaterial({ size, map: R3.glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: add ? T.AdditiveBlending : T.NormalBlending, opacity: add ? 1 : 0.55 });
    const p = new T.Points(geo, m); p.frustumCulled = false; scene.add(p); return p;
  };
  R3.sparks = mkPts(600, true, 0.14); R3.dust = mkPts(300, false, 0.5);
  R3.scene = scene; R3.G = G; if (R3.rpass) R3.rpass.scene = scene;
  R3.playerLight = new T.PointLight('#9ab0ff', 0, 7); scene.add(R3.playerLight);
  R3.camS = null;
}

/* ------------------------------------------------------------ Rendern */
function render3d(rdt) {
  if (!R3.ready) { try { r3Init(); } catch (err) { console.warn('WebGL nicht verfügbar – 2D', err); R3.failed = true; if (R3.canvas) R3.canvas.remove(); return; } }
  if (R3.G !== G) r3Build();
  const scene = R3.scene;
  R3.canvas.style.display = 'block';
  r3PerfCheck(rdt);
  const seen = new Set();
  for (const e of G.ents) {
    if (e.draw) { if (typeof OBJ3D !== 'undefined' && OBJ3D[e.draw]) { seen.add(e.id); r3Obj(e); } continue; }
    seen.add(e.id);
    let R = R3.rigs.get(e.id);
    if (!R || R.look !== e.look || R.extra !== e.extra) {
      if (R) R.root.removeFromParent();
      R = buildHuman(e.look, e.extra); R.look = e.look; R.extra = e.extra; R.yaw = e.face > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (e.npc) R.root.traverse((o) => { o.castShadow = false; });
      const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: R3.blobTex, transparent: true, depthWrite: false }));
      blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012; R.root.add(blob); R.blob = blob;
      R3.rigs.set(e.id, R); scene.add(R.root);
    }
    // Blickrichtung
    let a = null;
    if ((e.state === 'attack' || e.state === 'charge' || e.state === 'wind' || e.state === 'active' || e.state === 'recover') && e.aim !== undefined) a = e.aim;
    else if (e.state === 'dodge') { const L = e.team === 0 ? R3.lock : e.target; a = L ? Math.atan2(L.y - e.y, L.x - e.x) : e.dodgeA; }
    else if (Math.hypot(e.vx, e.vy) > 25) a = Math.atan2(e.vy, e.vx);
    else if (e.team === 1 && e.target) a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
    else if (e.team === 0) { const f = nearestFoe(e, 300); if (f) a = Math.atan2(f.y - e.y, f.x - e.x); }
    else if (e.npc) { const f = G.foe && G.foe.state !== 'down' ? G.foe : G.player; a = Math.atan2(f.y - e.y, f.x - e.x); }
    const y0 = R.yaw;
    if (a !== null) { const want = Math.atan2(Math.cos(a), Math.sin(a)); R.yaw += angDiff(R.yaw, want) * (1 - Math.exp(-rdt * (e.state === 'attack' ? 35 : 12))); }
    R.turnV = lerpA(R.turnV || 0, rdt > 0 ? angDiff(y0, R.yaw) / rdt * (e.anim.run || 0) : 0, 1 - Math.exp(-rdt * 8));
    R.root.rotation.y = R.yaw;
    // Blitzschritt: Sprung der Position -> Kette aus Nachbildern entlang des Weges
    if (e.team === 0 && R.px !== undefined && e.state !== 'down' && Math.hypot(e.x - R.px, e.y - R.py) > 40 && Math.hypot(e.x - R.px, e.y - R.py) < 90) { for (let k = 1; k <= 5; k++) { R.root.position.set(lerpA(R.px, e.x, k / 6) * S3, 0, lerpA(R.py, e.y, k / 6) * S3); r3Ghost(R, '#9ad8ff'); } }
    R.px = e.x; R.py = e.y;
    R.root.position.set(e.x * S3, 0, e.y * S3);
    if (e.flash > R.flashK + 0.02) {
      r3Impact(e);
      const face = Math.atan2(Math.cos(R.yaw), Math.sin(R.yaw)), push = Math.atan2(e.vy, e.vx), rel = angDiff(face, push);
      R.hit = { t: 0, dir: Math.abs(rel) > 2.2 ? 'front' : Math.abs(rel) < 0.9 ? 'back' : 'side', side: rel > 0 ? 1 : -1, heavy: e.anim.hurt >= 0.99 || G.hitstop >= 0.07 };
    }
    // Hammerschlag: Aufprall mit Stosswelle und Bodenriss
    if (e.state === 'attack' && e.atk && e.atk.hammer) { if (!R.slam && e.stateT >= e.atk.win) { R.slam = true; r3Slam(e); } } else R.slam = false;
    R.flashK = e.flash;
    poseHuman(R, e, rdt);
    if (typeof r3Harden === 'function') r3Harden(e, R);
    const f = Math.min(1, e.flash * 9);
    for (const m of R.mats) m.emissive.setRGB(f, f * 0.95, f * 0.9);
    const sq = 1 + f * 0.1; R.body.scale.set(sq, 1 / sq, sq);
    R.blob.material.opacity = e.state === 'down' ? 0.6 : 1;
    if (R.eyeGlow) R.eyeGlow.material.opacity = 0.35 + Math.sin(G.t * 8) * 0.15;
    if (e.team === 0 && e.state === 'dodge' && (R.ghostT = (R.ghostT || 0) - rdt) <= 0) { R.ghostT = 0.04; r3Ghost(R, e.counterT > 0 ? '#ffd070' : '#8ad8ff'); }
    if (!R.aura) { R.aura = glowSprite3('#ffd070', 1.7, 0); R.aura.position.y = 1.0; R.root.add(R.aura); }
    const auraA = e.team === 0 && e.counterT > 0 ? 0.55 + Math.sin(G.t * 20) * 0.2 : e.team === 0 && e.state === 'charge' ? Math.min(1, e.stateT / 0.3) * 0.7 : e.state === 'transform' ? 0.7 : 0;
    R.aura.material.opacity = auraA; R.aura.material.color.set(e.state === 'charge' && e.stateT < 0.3 ? '#8ad8ff' : e.state === 'transform' ? '#ff8a2a' : '#ffd070');
    R.root.visible = !(e.team === 0 && e.iframes > 0 && e.state !== 'dodge' && e.state !== 'down' && Math.sin(G.t * 40) < -0.3);
  }
  for (const [id, R] of R3.rigs) if (!seen.has(id)) { R.root.removeFromParent(); R3.rigs.delete(id); }
  r3Ghosts(rdt); r3Tele(); r3Fx(rdt); r3Proj(); r3Impacts(rdt); r3Pois();
  if (R3.motes) r3Motes(rdt);
  // Verdeckendes ausblenden (z. B. Dach ueber dem Weg), wenn die Figur darunter ist
  for (const F of R3.fade) { const px = G.player.x * S3, pz = G.player.y * S3, inside = px > F.x0 && px < F.x1 && pz > F.z0 && pz < F.z1; F.mat.opacity = lerpA(F.mat.opacity, inside ? 0.05 : 1, 1 - Math.exp(-rdt * 8)); F.mat.depthWrite = F.mat.opacity > 0.9; }
  const p = G.player;
  R3.playerLight.position.set(p.x * S3, 2.2, p.y * S3); R3.playerLight.intensity = G.arena.night ? 6 : 0;
  r3Camera(rdt);
  r3Occlusion(rdt);
  r3Hud();
  // Farbstimmung: Zeitlupe kuehl, Konter golden
  if (R3.grade) {
    const slow = clamp((1 - G.scale) / 0.7, 0, 1), gold = Math.min(1, (G.counterFlash || 0) * 2);
    R3.grade.uniforms.tint.value.setRGB(1 - slow * 0.15 + gold * 0.08, 1 - slow * 0.05 + gold * 0.02, 1 + slow * 0.12 - gold * 0.1);
    R3.grade.uniforms.sat.value = 1.12 - slow * 0.35;
    R3.bloom.strength = 0.45 + (G.punch || 0) * 0.35 + gold * 0.3;
  }
  if (R3.comp) R3.comp.render(); else R3.r.render(scene, R3.cam);
  renderOverlay3d();
}
// Kamera: flach hinter der Figur (Third Person), Zielerfassung zwischen Spieler und Ziel,
// zoomt bei schweren Treffern und Kontern heran
function r3Target() {
  const p = G.player; let best = null, bd = 320 * 320;
  for (const e of G.ents) if (e.team === 1 && e.state !== 'down' && (!e.draw || (typeof OBJ3D !== 'undefined' && OBJ3D[e.draw]))) { const d = dist2(e.x, e.y, p.x, p.y) * (e === R3.lock ? 0.6 : 1); if (d < bd) { bd = d; best = e; } }
  R3.lock = best; return best;
}
function r3Camera(rdt) {
  const cam = R3.cam, p = G.player, tgt = r3Target();
  const asp = cam.aspect, vf = cam.fov * Math.PI / 180;
  const base = clamp((window.R3DIST || 4.3) / (2 * Math.tan(vf / 2) * asp), 5.2, 9.5);
  const punch = (G.punch || 0) * (SAVE.settings.shake || 0), counter = Math.min(1, (G.counterFlash || 0) * 2), slow = clamp((1 - G.scale) / 0.7, 0, 1);
  let fx = p.x, fy = p.y;
  if (tgt) { fx = lerpA(p.x, tgt.x, 0.3); fy = lerpA(p.y, tgt.y, 0.3); }
  const want = { d: base * (1 - punch * 0.12 - counter * 0.15 - slow * 0.1), pitch: (window.R3PITCH || 0.56) - counter * 0.08 - slow * 0.05, x: fx, y: fy };
  const C = R3.camS || (R3.camS = Object.assign({}, want));
  const k = 1 - Math.exp(-rdt * 6), kz = 1 - Math.exp(-rdt * (punch > 0.3 || counter > 0 ? 16 : 4));
  C.d = lerpA(C.d, want.d, kz); C.pitch = lerpA(C.pitch, want.pitch, kz); C.x = lerpA(C.x, want.x, k); C.y = lerpA(C.y, want.y, k);
  const tx = C.x * S3, tz = C.y * S3;
  const sh = G.shake * (SAVE.settings.shake || 1) * 0.01;
  cam.position.set(tx + rand(-sh, sh), 0.9 + Math.sin(C.pitch) * C.d + rand(-sh, sh), tz + Math.cos(C.pitch) * C.d);
  cam.lookAt(tx, 1.05, tz - 0.4);
  if (window.R3CAM) window.R3CAM(cam);
}

// Verdeckung: alles, was zwischen Kamera und Figur steht (Gebaeude, Baeume), wird durchsichtig
function r3Occluder(obj, x0, x1, z0, z1, top) {
  if (!R3.occ) return;
  const O = { x0, x1, z0, z1, top, k: 1, mats: new Set(), outs: [] };
  obj.traverse((o) => {
    if (!o.isMesh && !o.isSprite) return;
    if (o.material === R3.outline || (o.material && o.material.uniforms && o.material.uniforms.w)) { O.outs.push(o); return; }
    if (o.material) { o.material.transparent = true; O.mats.add(o.material); }
  });
  R3.occ.push(O);
}
function segBox(ax, ay, az, bx, by, bz, O) {
  let t0 = 0, t1 = 1;
  for (const [a, b, lo, hi] of [[ax, bx, O.x0 - 0.2, O.x1 + 0.2], [ay, by, 0, O.top], [az, bz, O.z0 - 0.2, O.z1 + 0.2]]) {
    const d = b - a;
    if (Math.abs(d) < 1e-6) { if (a < lo || a > hi) return false; continue; }
    let u0 = (lo - a) / d, u1 = (hi - a) / d; if (u0 > u1) [u0, u1] = [u1, u0];
    t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return false;
  }
  return true;
}
function r3Occlusion(rdt) {
  const c = R3.cam.position, p = G.player, px = p.x * S3, pz = p.y * S3;
  const tg = R3.lock;
  for (const O of R3.occ || []) {
    const hit = segBox(c.x, c.y, c.z, px, 1.2, pz, O) || segBox(c.x, c.y, c.z, px, 0.3, pz, O) || (tg && segBox(c.x, c.y, c.z, tg.x * S3, 1.2, tg.y * S3, O));
    const k = lerpA(O.k, hit ? 0.14 : 1, 1 - Math.exp(-rdt * 10));
    if (Math.abs(k - O.k) < 0.001 && (k === 1 || k < 0.15)) { O.k = k; continue; }
    O.k = k;
    for (const m of O.mats) { m.opacity = k; m.depthWrite = k > 0.95; }
    for (const o of O.outs) o.visible = k > 0.9;
  }
}

// Objekte und Bestien mit eigener 3D-Fassung (OBJ3D in den Orts-Dateien)
function r3Obj(e) {
  let R = R3.rigs.get(e.id);
  if (!R) { R = OBJ3D[e.draw](e); R.obj = true; R.flashK = 0; R3.rigs.set(e.id, R); R3.scene.add(R.root); R.root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshToonMaterial) { o.material = o.material.clone(); (R.mats || (R.mats = [])).push(o.material); } }); }
  R.root.position.set(e.x * S3, 0, e.y * S3);
  if (e.flash > R.flashK + 0.02) r3Impact(e);
  R.flashK = e.flash;
  const f = Math.min(1, e.flash * 9); for (const m of R.mats || []) m.emissive.setRGB(f, f, f);
  if (R.update) R.update(e);
}
// Interaktionspunkte (Hub): leuchtender Ring am Boden, Beschriftung in der 2D-Ebene
function r3Pois() {
  const list = G.arena.pois || [];
  if (!R3.poiMeshes) {
    R3.poiMeshes = list.map((P) => {
      const g = new THREE.Group(); g.position.set(P.x * S3, 0.03, P.y * S3);
      const ring = new THREE.Mesh(fgeo('pring', () => new THREE.RingGeometry(0.5, 0.6, 32)), new THREE.MeshBasicMaterial({ color: P.col || '#8ad8ff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; g.add(ring);
      const gl = glowSprite3(P.col || '#8ad8ff', 1.6, 0.5); gl.position.y = 0.5; g.add(gl);
      R3.scene.add(g); return { P, g, ring, gl };
    });
  }
  for (const M of R3.poiMeshes) {
    const vis = !(M.P.hidden && M.P.hidden()); M.g.visible = vis; if (!vis) continue;
    const on = G.poi === M.P, pulse = 0.5 + Math.sin(G.t * 4) * 0.5;
    M.ring.scale.setScalar(on ? 1.25 : 1 + pulse * 0.08); M.ring.material.opacity = on ? 1 : 0.5 + pulse * 0.3; M.gl.material.opacity = on ? 0.9 : 0.35 + pulse * 0.2;
  }
}

/* ------------------------------------------------------------ Einschlaege, Nachbilder */
function r3Impact(e) {
  const heavy = e.anim.hurt >= 0.99 || G.hitstop > 0.06;
  const s = glowSprite3('#ffffff', 0.3, 1, R3.starTex); s.position.set(e.x * S3, 1.05, e.y * S3); s.material.rotation = rand(0, TAU); R3.scene.add(s);
  const gl = glowSprite3(heavy ? '#ffd070' : '#bfe0ff', 0.6, 0.9); gl.position.copy(s.position); R3.scene.add(gl);
  const ring = new THREE.Mesh(fgeo('iring', () => new THREE.RingGeometry(0.34, 0.44, 32)), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(e.x * S3, 0.04, e.y * S3); R3.scene.add(ring);
  const streaks = [];
  for (let i = 0; i < (heavy ? 2 : 1); i++) { const st = glowSprite3(heavy ? '#ffe0a0' : '#9ad8ff', 1, 1); st.position.copy(s.position); st.material.rotation = rand(-0.6, 0.6) + (i ? Math.PI / 2 : 0); R3.scene.add(st); streaks.push(st); }
  R3.impacts.push({ s, gl, ring, streaks, t: 0, big: heavy ? 1.6 : 1 });
  if (heavy && e.team === 1) { R3.lines = 0.22; R3.linesAt = [e.x, e.y]; }
}
function r3Slam(e) {
  const T = THREE, x = (e.x + Math.cos(e.aim || 0) * 18) * S3, z = (e.y + Math.sin(e.aim || 0) * 18) * S3;
  if (!R3.crackTex) R3.crackTex = canvasTex(256, (g) => { g.translate(128, 128); g.strokeStyle = 'rgba(20,10,10,0.9)'; const rnd = mulberry(3); for (let i = 0; i < 11; i++) { let a = i / 11 * TAU + rnd() * 0.3, r = 10; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); while (r < 120) { r += 12 + rnd() * 14; a += (rnd() - 0.5) * 0.5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.lineWidth = Math.max(1, g.lineWidth - 0.5); } g.stroke(); } const gr = g.createRadialGradient(0, 0, 0, 0, 0, 40); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-128, -128, 256, 256); });
  const crack = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), new T.MeshBasicMaterial({ map: R3.crackTex, transparent: true, depthWrite: false, opacity: 0.9 }));
  crack.rotation.x = -Math.PI / 2; crack.rotation.z = rand(0, TAU); crack.position.set(x, 0.015, z); R3.scene.add(crack);
  const ring = new T.Mesh(fgeo('sring', () => new T.RingGeometry(0.5, 0.75, 40)), new T.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.05, z); R3.scene.add(ring);
  const gl = glowSprite3('#ffc070', 2.5, 1); gl.position.set(x, 0.4, z); R3.scene.add(gl);
  R3.slams = R3.slams || []; R3.slams.push({ crack, ring, gl, t: 0 });
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; G.fx.push({ k: 'dust', x: e.x + Math.cos(e.aim || 0) * 18 + Math.cos(a) * 10, y: e.y + Math.sin(e.aim || 0) * 18 + Math.sin(a) * 10, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.7, t: 0, size: 8 }); }
  G.shake = Math.max(G.shake, 12); G.punch = 1;
}
function r3Slams(dt) {
  for (let i = (R3.slams || []).length - 1; i >= 0; i--) {
    const S = R3.slams[i]; S.t += dt;
    S.ring.scale.setScalar(1 + S.t * 9); S.ring.material.opacity = Math.max(0, 0.9 - S.t * 2.5);
    S.gl.material.opacity = Math.max(0, 1 - S.t * 4);
    S.crack.material.opacity = S.t < 1.2 ? 0.9 : Math.max(0, 0.9 - (S.t - 1.2));
    if (S.t > 2.2) { for (const o of [S.crack, S.ring, S.gl]) { o.removeFromParent(); o.material.dispose(); } S.crack.geometry.dispose(); R3.slams.splice(i, 1); }
  }
}
function r3Impacts(dt) {
  r3Slams(dt);
  for (let i = R3.impacts.length - 1; i >= 0; i--) {
    const I = R3.impacts[i]; I.t += dt; const k = I.t / 0.24;
    I.s.scale.setScalar((0.3 + easeSnap(Math.min(1, k * 2)) * 1.1) * I.big); I.s.material.opacity = Math.max(0, 1 - k * 1.2);
    I.gl.scale.setScalar((0.6 + k * 1.4) * I.big); I.gl.material.opacity = Math.max(0, 0.9 * (1 - k));
    I.ring.scale.setScalar((0.5 + k * 2.4) * I.big); I.ring.material.opacity = Math.max(0, 0.8 * (1 - k));
    for (const st of I.streaks) { st.scale.set((1.2 + k * 2.2) * I.big, 0.05 * (1 - k), 1); st.material.opacity = 1 - k; }
    if (k >= 1) { for (const o of [I.s, I.gl, I.ring, ...I.streaks]) { o.removeFromParent(); o.material.dispose(); } R3.impacts.splice(i, 1); }
  }
}
function r3Ghost(R, col) {
  const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
  const c = R.root.clone(true);
  c.traverse((o) => { if (o.isMesh) { o.material = m; o.castShadow = false; } if (o.isSprite) o.visible = false; });
  if (R.blob) c.children.forEach((o) => { if (o.geometry && o.geometry.type === 'PlaneGeometry') o.visible = false; });
  R3.scene.add(c); R3.ghosts.push({ c, m, t: 0 });
}
function r3Ghosts(dt) {
  for (let i = R3.ghosts.length - 1; i >= 0; i--) { const G0 = R3.ghosts[i]; G0.t += dt; G0.m.opacity = 0.4 * (1 - G0.t / 0.3); if (G0.t >= 0.3) { G0.c.removeFromParent(); G0.m.dispose(); R3.ghosts.splice(i, 1); } }
}

/* ------------------------------------------------------------ Angriffsmarkierungen am Boden */
function r3Tele() {
  const T = THREE, seen = new Set();
  for (const Te of G.tele) {
    seen.add(Te);
    let o = R3.tele.get(Te);
    if (!o) {
      const g = new T.Group(), base = new T.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.22, depthWrite: false }), fill = new T.MeshBasicMaterial({ color: '#ff6a3a', transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending });
      const edge = new T.MeshBasicMaterial({ color: '#ffb090', transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending });
      let gb, ge;
      if (Te.type === 'lunge' || Te.type === 'beam') { gb = new T.PlaneGeometry(1, 1); gb.translate(0.5, 0, 0); ge = new T.PlaneGeometry(0.04, 1); ge.translate(1, 0, 0); }
      else { gb = new T.CircleGeometry(1, 28, -Te.arc, Te.arc * 2); ge = new T.RingGeometry(0.96, 1, 28, 1, -Te.arc, Te.arc * 2); }
      const mb = new T.Mesh(gb, base), mf = new T.Mesh(gb, fill), me = new T.Mesh(ge, edge);
      for (const m of [mb, mf, me]) m.rotation.x = -Math.PI / 2; mf.position.y = 0.004; me.position.y = 0.006;
      g.add(mb, mf, me); R3.scene.add(g); o = { g, mb, mf, me, base, fill, edge, gb, ge }; R3.tele.set(Te, o);
    }
    const k = clamp(Te.t / Te.dur, 0, 1), done = Te.t >= Te.dur;
    o.g.position.set(Te.x * S3, 0.03, Te.y * S3); o.g.rotation.y = -Te.a;
    const r = Te.r * S3;
    if (Te.type === 'lunge' || Te.type === 'beam') { const w = (Te.type === 'beam' ? Te.w : 18) * S3; o.mb.scale.set(r, w, 1); o.mf.scale.set(r * k, w, 1); o.me.scale.set(r, w, 1); }
    else { o.mb.scale.set(r, r, 1); o.mf.scale.set(r * k, r * k, 1); o.me.scale.set(r, r, 1); }
    o.base.opacity = done ? 0.55 : 0.16 + k * 0.2; o.base.color.set(done ? '#ffffff' : '#ff3a2a');
    o.edge.opacity = 0.4 + Math.sin(G.t * 30) * 0.2 * k + k * 0.4;
  }
  for (const [Te, o] of R3.tele) if (!seen.has(Te)) { o.g.removeFromParent(); o.base.dispose(); o.fill.dispose(); o.edge.dispose(); o.gb.dispose(); o.ge.dispose(); R3.tele.delete(Te); }
}

/* ------------------------------------------------------------ Schlagspuren (Band mit leuchtender Spitze) */
const TRAIL_SHADER = {
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform vec3 col; uniform float head; uniform float fade; varying vec2 vUv;
    void main(){ float u = vUv.x; if (u > head) discard;
      float tail = smoothstep(head - 0.75, head, u); float edge = pow(sin(vUv.y * 3.14159), 0.8);
      float core = smoothstep(head - 0.12, head, u) * smoothstep(0.35, 1.0, vUv.y);
      vec3 c = mix(col, vec3(1.0), core * 0.85); gl_FragColor = vec4(c * (tail * edge) * fade * 1.7, 1.0); }`
};
function trailGeo(r0, r1, arc, n) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = -arc + u * arc * 2;
    for (const [rr, v] of [[r0, 0], [r1, 1]]) { pos.push(Math.cos(a) * rr, 0, Math.sin(a) * rr); uv.push(u, v); }
    if (i < n) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
function r3Fx(dt) {
  const T = THREE, seen = new Set(), col = new T.Color();
  let ns = 0, nd = 0;
  const sp = R3.sparks.geometry.attributes, du = R3.dust.geometry.attributes;
  for (const f of G.fx) {
    const k = f.t / f.life;
    if (f.k === 'spark') {
      if (ns >= 600) continue;
      if (f._y0 === undefined) f._y0 = f.y;
      sp.position.setXYZ(ns, f.x * S3, 0.95 + (f._y0 - f.y) * S3, (f._y0 + 30) * S3);
      col.set(f.col || '#ffffff').multiplyScalar(1.6 * (1 - k)); sp.color.setXYZ(ns, col.r, col.g, col.b); ns++;
    } else if (f.k === 'dust') {
      if (nd >= 300) continue;
      du.position.setXYZ(nd, f.x * S3, 0.08 + k * 0.25, f.y * S3); const v = (G.arena.night ? 0.5 : 0.9) * (1 - k); du.color.setXYZ(nd, v, v * 0.97, v * 0.92); nd++;
    } else if (f.k === 'swoosh' || f.k === 'slash' || f.k === 'beam') {
      seen.add(f);
      let o = R3.fx.get(f);
      if (!o) {
        let mesh, m;
        const holder = new T.Group(); R3.scene.add(holder);
        if (f.k === 'beam') {
          m = new T.MeshBasicMaterial({ color: new T.Color(f.col || '#ffffff'), transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
          const g = new T.BoxGeometry(1, 0.14, 1); g.translate(0.5, 0, 0); mesh = new T.Mesh(g, m);
          holder.position.set(f.x * S3, 1.0, (f.y + 24) * S3); holder.rotation.y = -f.a; mesh.scale.set(f.len * S3, 1, f.w * S3);
        } else {
          const R = Math.max(0.35, f.r * S3) * (f.k === 'swoosh' ? 1.15 : 1);
          const neon = f.k === 'swoosh' ? ({ '#ffd070': '#ffb030', '#e8f4ff': '#7ad0ff', '#bfe0ff': '#3a9cff' }[f.col] || f.col) : (f.col || '#ff6a3a');
          m = new T.ShaderMaterial({ uniforms: { col: { value: new T.Color(neon) }, head: { value: 0 }, fade: { value: 1 } }, vertexShader: TRAIL_SHADER.vertexShader, fragmentShader: TRAIL_SHADER.fragmentShader, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
          mesh = new T.Mesh(trailGeo(R * 0.8, R * 1.06, f.arc * 1.15, 32), m);
          if ((f.dir || 1) < 0) mesh.scale.z = -1;
          holder.position.set(f.x * S3, f.k === 'swoosh' ? 1.0 : 0.95, (f.y + (f.k === 'swoosh' ? 26 : 30)) * S3); holder.rotation.y = -f.a;
          mesh.rotation.x = f.k === 'swoosh' ? (f.w > 5 ? 0.35 : -0.25) : 0.15; // leicht schraeg, wie ein echter Schwung
        }
        holder.add(mesh); o = { holder, mesh, m }; R3.fx.set(f, o);
      }
      if (f.k === 'beam') { o.m.opacity = (1 - k) * 0.9; o.mesh.scale.y = 1 - k; }
      else { o.m.uniforms.head.value = Math.min(1.0, easeSnap(k * 1.7) * 1.05); o.m.uniforms.fade.value = 1 - Math.max(0, (k - 0.45) / 0.55); }
    }
  }
  for (const [f, o] of R3.fx) if (!seen.has(f)) { o.holder.removeFromParent(); o.m.dispose(); o.mesh.geometry.dispose(); R3.fx.delete(f); }
  for (let i = ns; i < 600; i++) sp.position.setXYZ(i, 0, -50, 0);
  for (let i = nd; i < 300; i++) du.position.setXYZ(i, 0, -50, 0);
  sp.position.needsUpdate = sp.color.needsUpdate = du.position.needsUpdate = du.color.needsUpdate = true;
}
// Geschosse: Blutsichel, Pfeil, Wasser, Feuer, Spiess
function r3Proj() {
  const T = THREE, seen = new Set();
  for (const P of G.proj) {
    seen.add(P);
    let o = R3.proj.get(P);
    if (!o) {
      const holder = new T.Group(); let body;
      if (P.kind === 'blood') { body = new T.Mesh(fgeo('pblood', () => new T.TorusGeometry(0.34, 0.07, 6, 18, Math.PI * 0.9)), new T.MeshBasicMaterial({ color: '#ff1a3a' })); body.rotation.set(-Math.PI / 2, 0, -Math.PI * 0.45); holder.add(glowSprite3('#ff2a40', 1.3, 0.9)); }
      else if (P.kind === 'arrow' || P.kind === 'spike') { body = new T.Mesh(fgeo('parrow', () => { const g = new T.ConeGeometry(0.04, 0.6, 6); g.rotateZ(-Math.PI / 2); return g; }), new T.MeshBasicMaterial({ color: P.col || '#e8e0d0' })); holder.add(glowSprite3(P.col || '#c8a0ff', 0.6, 0.7)); }
      else { body = glowSprite3(P.kind === 'fire' ? '#ff8a3a' : '#6ec8ff', 0.8, 1); holder.add(glowSprite3('#ffffff', 0.3, 0.9)); }
      holder.add(body); R3.scene.add(holder); o = { holder }; R3.proj.set(P, o);
    }
    o.holder.position.set(P.x * S3, 0.95, (P.y + 22) * S3); o.holder.rotation.y = -P.a;
  }
  for (const [P, o] of R3.proj) if (!seen.has(P)) { o.holder.removeFromParent(); R3.proj.delete(P); }
}
// Staub im Licht (Arenen koennen R3.motes setzen)
function r3Motes(dt) {
  const M = R3.motes, a = M.geometry.attributes.position;
  for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * 0.06; if (y > 3) y = 0.2; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(G.t * 0.5 + i) * dt * 0.03); }
  a.needsUpdate = true;
}

/* ------------------------------------------------------------ 2D-Ebene ueber dem 3D-Bild */
function r3Screen(x, y, h) { const v = new THREE.Vector3(x * S3, h, y * S3).project(R3.cam); return [(v.x * 0.5 + 0.5) * cv.width, (-v.y * 0.5 + 0.5) * cv.height, v.z < 1]; }
function renderOverlay3d() {
  const g = ctx, W = cv.width, H = cv.height, d = VIEW.dpr;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  // Anime-Speedlines bei schweren Treffern und Kontern
  const lines = Math.max(R3.lines || 0, (G.counterFlash || 0) * 0.5);
  if (lines > 0) {
    R3.lines = Math.max(0, (R3.lines || 0) - 1 / 60);
    const [cx, cy] = R3.linesAt ? r3Screen(R3.linesAt[0], R3.linesAt[1], 1.0) : [W / 2, H / 2];
    g.save(); g.globalAlpha = Math.min(1, lines * 4) * 0.55; g.fillStyle = G.counterFlash > 0 ? '#ffe6a0' : '#ffffff';
    const R0 = Math.min(W, H) * 0.32, R1 = Math.max(W, H);
    for (let i = 0; i < 46; i++) { const a = (i / 46) * TAU + (hash2(i, Math.floor(G.t * 20), 5) % 100) / 400, w = 0.004 + (hash2(i, 3, 9) % 100) / 12000, r0 = R0 * (0.9 + (hash2(i, 7, Math.floor(G.t * 20)) % 100) / 250); g.beginPath(); g.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0); g.lineTo(cx + Math.cos(a) * R1, cy + Math.sin(a) * R1); g.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0); g.fill(); }
    g.restore();
  }
  // Zielerfassung: rotes Kreuz am anvisierten Gegner
  const L = R3.lock;
  if (L && G.state === 'play') {
    const [sx, sy] = r3Screen(L.x, L.y, 1.15), r = 26 * d, a = G.t * 1.5;
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,60,70,0.85)'; g.lineWidth = 2 * d;
    g.beginPath(); g.arc(sx, sy, r, a, a + 1.2); g.stroke(); g.beginPath(); g.arc(sx, sy, r, a + Math.PI, a + Math.PI + 1.2); g.stroke();
    g.globalAlpha = 0.5; g.lineWidth = 1.2 * d; g.beginPath(); g.moveTo(sx - r * 3.2, sy); g.lineTo(sx - r * 1.3, sy); g.moveTo(sx + r * 1.3, sy); g.lineTo(sx + r * 3.2, sy); g.moveTo(sx, sy - r * 2.6); g.lineTo(sx, sy - r * 1.3); g.moveTo(sx, sy + r * 1.3); g.lineTo(sx, sy + r * 2.6); g.stroke();
    g.fillStyle = '#ff3a4e'; g.globalAlpha = 0.9; g.beginPath(); g.arc(sx, sy, 2.5 * d, 0, TAU); g.fill();
    g.restore();
  }
  // Combo-Zaehler links (roter Pinselstrich)
  const C = R3.combo;
  if (C && C.n >= 2) {
    const x = 16 * d, y = H * 0.42, s = 1 + C.pop * 0.35, al = Math.min(1, C.t * 2);
    g.save(); g.globalAlpha = al; g.translate(x, y); g.transform(1, 0, -0.2, 1, 0, 0);
    const bw = 150 * d; const gr = g.createLinearGradient(0, 0, bw, 0); gr.addColorStop(0, 'rgba(200,10,30,0.85)'); gr.addColorStop(1, 'rgba(200,10,30,0)');
    g.fillStyle = gr; g.fillRect(0, -26 * d, bw, 34 * d);
    g.textAlign = 'left'; g.font = `italic 900 ${34 * d * s}px Cinzel, serif`; g.lineWidth = 4 * d; g.strokeStyle = 'rgba(0,0,0,0.7)'; g.strokeText(C.n, 8 * d, 0); g.fillStyle = '#ffffff'; g.fillText(C.n, 8 * d, 0);
    const w = g.measureText(C.n).width; g.font = `italic 800 ${15 * d}px Cinzel, serif`; g.strokeText('HITS', 14 * d + w, 0); g.fillStyle = '#ffd0d4'; g.fillText('HITS', 14 * d + w, 0);
    g.restore();
  }
  g.textAlign = 'center';
  for (const M of R3.poiMeshes || []) {
    if (!M.g.visible) continue;
    const [sx, sy, ok] = r3Screen(M.P.x, M.P.y, 1.45); if (!ok) continue;
    const on = G.poi === M.P;
    g.font = `800 ${(on ? 14 : 11) * d}px Cinzel, serif`; g.lineWidth = 4 * d; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(M.P.label, sx, sy); g.fillStyle = on ? '#ffffff' : (M.P.col || '#bfe6ff'); g.fillText(M.P.label, sx, sy);
  }
  for (const T of G.texts) {
    const k = T.t / T.life; if (T._y0 === undefined) T._y0 = T.y + 72;
    const [sx, sy] = r3Screen(T.x, T._y0, 2.0 + k * 0.6), pop = k < 0.12 ? 1 + (1 - k / 0.12) * 0.5 : 1;
    g.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    g.font = `800 ${(T.txt.length > 4 ? 12 : 18) * d * pop}px Cinzel, serif`;
    g.lineWidth = 4 * d; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(T.txt, sx, sy); g.fillStyle = T.col; g.fillText(T.txt, sx, sy);
  }
  g.globalAlpha = 1;
  if (G.party && G.party.length > 1) for (const m of G.party) {
    if (m.state === 'down') continue;
    const [sx, sy] = r3Screen(m.x, m.y, 2.15), col = LOOKS[m.char] && LOOKS[m.char].rim || '#fff';
    if (m === G.player) { g.fillStyle = col; g.beginPath(); g.moveTo(sx - 6 * d, sy - 6 * d); g.lineTo(sx + 6 * d, sy - 6 * d); g.lineTo(sx, sy + 2 * d); g.fill(); }
    else { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(sx - 18 * d, sy, 36 * d, 5 * d); g.fillStyle = col; g.fillRect(sx - 18 * d, sy, 36 * d * m.hp / m.maxHp, 5 * d); }
  }
  for (const e of G.ents) if (e.state === 'stagger') { const [sx, sy] = r3Screen(e.x, e.y, 2.1); g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(sx + Math.cos(a) * 14 * d, sy + Math.sin(a) * 4 * d, 3 * d, 0, TAU); g.fill(); } }
  if (G.whiteFlash > 0) { G.whiteFlash -= 1 / 60; g.fillStyle = `rgba(255,245,220,${Math.max(0, G.whiteFlash) * 2})`; g.fillRect(0, 0, W, H); }
  const p = G.player;
  if (p && p.hp / p.maxHp < 0.35 && p.state !== 'down') { const a = 0.25 + Math.sin(G.t * 6) * 0.08; g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.35, Math.max(W, H) * 0.8, [0, 'rgba(120,0,20,0)', 1, `rgba(140,0,20,${a})`]); g.fillRect(0, 0, W, H); }
  g.globalAlpha = 1;
}
function hide3d() { if (R3.canvas) R3.canvas.style.display = 'none'; if (UI.hud) UI.hud.classList.remove('h3d'); }
// Kampf-Oberflaeche im 3D-Modus: dunkle Glas-Knoepfe mit Abklingring, Combo-Zaehler
function r3Hud() {
  if (!UI.hud) return;
  if (!UI.hud.classList.contains('h3d')) UI.hud.classList.add('h3d');
  const p = G.player, cd = (id, v) => { const b = document.getElementById(id); if (b) b.style.setProperty('--cd', clamp(v, 0, 1).toFixed(3)); };
  cd('bSkill', (p.swipeCd || 0) / 0.35); cd('bSkill3', ((p.hammerCd || 0) - G.t) / 2.5); cd('bSkill4', ((p.sprayCd || 0) - G.t) / 0.9);
  cd('bSkill5', p.maxMc ? 1 - Math.min(1, p.mc / 25) : 0); cd('bSkill2', p.stam < 35 ? 1 - p.stam / 35 : 0); cd('bDodge', p.stam < 18 ? 1 - p.stam / 18 : 0);
  // Combo: Treffer in Folge, verfaellt nach 2 s
  const C = R3.combo || (R3.combo = { hits: 0, n: 0, t: 0, pop: 0 });
  if (G.stats.hits > C.hits) { C.n += G.stats.hits - C.hits; C.t = 2; C.pop = 1; }
  C.hits = G.stats.hits; C.t -= 1 / 60; C.pop = Math.max(0, C.pop - 0.08); if (C.t <= 0) C.n = 0;
}

/* ------------------------------------------------------------ 3D-Portraets fuer Szenen */
function r3Portrait(P, t, cast, g) {
  const T = THREE;
  if (R3.failed) return false;
  if (!R3.ready) { try { r3Init(); } catch (err) { R3.failed = true; return false; } }
  if (!R3.pp) {
    const c = document.createElement('canvas');
    const r = new T.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight('#dfe6ff', '#4a3a40', 1.1));
    const key = new T.DirectionalLight('#fff0dc', 2.4); key.position.set(1.5, 2.5, 2.5); scene.add(key);
    const rim = new T.DirectionalLight('#7aa0ff', 2.2); rim.position.set(-2, 2, -2.5); scene.add(rim);
    const cam = new T.PerspectiveCamera(26, 1, 0.1, 20);
    R3.pp = { r, scene, cam, rigs: new Map(), cur: null };
  }
  const PP = R3.pp, L = LOOKS[P.id]; if (!L) return false;
  const key = P.id + (P.extra ? JSON.stringify(P.extra) : '');
  let R = PP.rigs.get(key);
  if (!R) { R = buildHuman(L, P.extra); R.yaw = 0; PP.rigs.set(key, R); }
  if (PP.cur !== R) { if (PP.cur) PP.scene.remove(PP.cur.root); PP.scene.add(R.root); PP.cur = R; R.fake = { anim: { t: 0, run: 0, phase: 0, cast: 0, hurt: 0 }, state: 'idle', stateT: 0, npc: {}, team: 0, vx: 0, vy: 0, id: -1 }; }
  const W = P.c.width, H = P.c.height;
  if (PP.w !== W || PP.h !== H) { PP.r.setPixelRatio(1); PP.r.setSize(W, H, false); PP.cam.aspect = W / H; PP.cam.updateProjectionMatrix(); PP.w = W; PP.h = H; }
  const f = R.fake, dt = Math.min(0.05, Math.max(0.001, t - (PP.lastT || t)) || 0.016); PP.lastT = t;
  f.anim.t = t + 1; f.anim.cast = cast;
  poseHuman(R, f, dt);
  // leicht zur Kamera gedreht, sprechende Figur mit kleiner Geste
  R.root.rotation.y = 0.32 + Math.sin(t * 0.7) * 0.04;
  const k = Math.min(1, t * 4);
  R.root.position.set((1 - k) * 0.35, 0, 0);
  PP.cam.position.set(0.25, 1.52, 1.75); PP.cam.lookAt(0, 1.38, 0);
  PP.r.render(PP.scene, PP.cam);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.globalAlpha = k; g.drawImage(PP.r.domElement, 0, 0, W, H); g.globalAlpha = 1;
  return true;
}
