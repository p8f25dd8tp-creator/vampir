'use strict';
/* ==========================================================================
   AKADEMIEHOF: groesser und weitlaeufiger, Rueckkehr an die Tuer
   Die ganze Hof-Karte (Gebaeude, Wege, Schatten, Ziele, Figuren) wird
   gleichmaessig auseinandergezogen; mehr Baeume und Baenke fuellen die Flaeche.
   Wer ein Gebaeude verlaesst, steht danach wieder vor dessen Tuer.
   ========================================================================== */

const HUB_SCALE = 1.6;
function scaleArenaOpt(opt, k) {
  const A = opt.arena, rect = (o) => { o.x *= k; o.y *= k; if (o.w !== undefined) { o.w *= k; o.h *= k; } if (o.door) o.door *= k; };
  A.w *= k; A.h *= k;
  for (const key of ['buildings', 'blocks', 'paths', 'sun', 'shade']) (A[key] || []).forEach(rect);
  (A.pois || []).forEach((P) => { P.x *= k; P.y *= k; });
  A.trees = (A.trees || []).map(([x, y]) => [x * k, y * k]);
  A.benches = (A.benches || []).map(([x, y]) => [x * k, y * k]);
  opt.playerAt = opt.playerAt.map((v) => v * k);
  (opt.npcs || []).forEach((n) => { n.at = n.at.map((v) => v * k); if (n.path) n.path = n.path.map((q) => q.map((v) => v * k)); if (n.speed) n.speed *= 1.2; });
}
const _hubSetupBase = hubSetup;
hubSetup = function () {
  const opt = _hubSetupBase();
  const A = opt.arena;
  // zusaetzliche Baeume und Baenke auf den Rasenflaechen (in alten Koordinaten, vor dem Skalieren)
  A.trees = (A.trees || []).concat([[18, 240], [425, 235], [150, 520], [290, 530], [80, 690], [360, 690], [165, 560], [275, 250]]);
  A.benches = (A.benches || []).concat([[60, 600], [380, 600], [120, 250], [330, 250]]);
  scaleArenaOpt(opt, HUB_SCALE);
  // Rueckkehr: vor die Tuer, durch die man zuletzt gegangen ist
  const H = SAVE.hubPos;
  if (H && H.x > 10 && H.x < A.w - 10 && H.y > 30 && H.y < A.h - 10) {
    let x = H.x, y = H.y;
    for (const b of A.blocks || []) if (x > b.x - 12 && x < b.x + b.w + 12 && y > b.y - 12 && y < b.y + b.h + 12) y = b.y + b.h + 24;
    opt.playerAt = [x, y];
  }
  return opt;
};
