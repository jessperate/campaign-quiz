/**
 * Card Hover + Flip Effect
 * ========================
 * Vanilla JS translation of the Vercel ResultsClient.tsx card effect.
 * Paste into Webflow: Page Settings > Custom Code > Before </body>
 * wrapped in <script>...</script> tags.
 *
 * Desktop only — skipped on viewports < 768px.
 *
 * Expects the following Webflow DOM structure:
 *
 *   .win-result_top-card-wrap        ← perspective container (mousemove target)
 *     └── .win-result_card-wrap      ← 3D card (preserve-3d, tilt+flip transform)
 *           ├── .win-result_card-sides
 *           │     ├── .win-result_card       ← front face (backface-visibility:hidden)
 *           │     └── .win-result_card-back  ← back face (rotateY:180)
 *           ├── .win-results_card-pattern    ← z:5, multiply blend, checkerboard mask
 *           │     ├── .win-results_card-refract-bl   ← rainbow gradient orb
 *           │     └── .win-results_card-refract-tr   ← rainbow gradient orb
 *           ├── .win-results_card-watermark  ← z:6, hard-light blend, conic mask
 *           │     ├── .win-results_card-refract-bl
 *           │     └── .win-results_card-refract-tr
 *           ├── .win-results_card-spotlight  ← z:8, overlay blend
 *           │     └── .win-results_card-spot-light   ← radial gradient
 *           └── .win-results_card-glare      ← z:9, linear gradient stripe
 */
(function () {
  var isMobile = window.innerWidth < 768;
  if (isMobile) return;

  var cardWrap = document.querySelector('.win-result_card-wrap');
  if (!cardWrap) return;

  var tiltContainer = document.querySelector('.win-result_top-card-wrap');
  if (!tiltContainer) tiltContainer = cardWrap.parentElement;

  // ── State ──
  var rotateX = 0;
  var rotateY = 0;
  var pointerX = 0;
  var pointerY = 0;
  var isHovering = false;
  var isFlipped = false;
  var isFlipping = false;

  // ── Overlay element references ──
  var pattern = cardWrap.querySelector('.win-results_card-pattern');
  var watermark = cardWrap.querySelector('.win-results_card-watermark');
  var spotlight = cardWrap.querySelector('.win-results_card-spotlight');
  var spotLight = cardWrap.querySelector('.win-results_card-spot-light');
  var glare = cardWrap.querySelector('.win-results_card-glare');
  var refractBLs = cardWrap.querySelectorAll('.win-results_card-refract-bl');
  var refractTRs = cardWrap.querySelectorAll('.win-results_card-refract-tr');

  // ── Checkerboard SVG mask (short-line concat to avoid Webflow line-break bug) ──
  var checker = 'url("data:image/svg+xml,' +
    '%3Csvg xmlns=%27http://www.w3.org/2000/svg%27' +
    ' width=%278%27 height=%278%27%3E' +
    '%3Crect width=%274%27 height=%274%27 fill=%27white%27/%3E' +
    '%3Crect x=%274%27 y=%274%27 width=%274%27 height=%274%27' +
    ' fill=%27white%27/%3E%3C/svg%3E")';

  var conicMask = 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)';

  // ── Helper: position + style a rainbow orb ──
  function styleOrb(el, originX, originY, scaleVal, txPct, tyPct) {
    if (!el) return;
    el.style.position = 'absolute';
    el.style.width = '500%';
    el.style.aspectRatio = '1';
    el.style.transformOrigin = originX + ' ' + originY;
    el.style.background =
      'radial-gradient(circle at ' + originX +
      ' ' + originY + ', transparent 10%,' +
      ' hsl(5,100%,80%), hsl(150,100%,60%),' +
      ' hsl(220,90%,70%), transparent 60%)';
    var s = Math.min(1, scaleVal);
    el.style.transform =
      'scale(' + s + ') translate(' + txPct + '%, ' + tyPct + '%)';
  }

  // ═══════════════════════════════════════════
  // Base styles for overlay layers
  // ═══════════════════════════════════════════

  // Pattern layer — checkerboard mask, multiply blend
  if (pattern) {
    pattern.style.position = 'absolute';
    pattern.style.inset = '0';
    pattern.style.pointerEvents = 'none';
    pattern.style.overflow = 'hidden';
    pattern.style.mixBlendMode = 'multiply';
    pattern.style.opacity = '0';
    pattern.style.transition = 'opacity 0.3s ease-out';
    pattern.style.zIndex = '5';
    pattern.style.webkitMaskImage = checker;
    pattern.style.webkitMaskSize = '6px 6px';
    pattern.style.maskImage = checker;
    pattern.style.maskSize = '6px 6px';
    pattern.style.filter = 'saturate(2)';
  }

  // Watermark layer — conic mask, hard-light blend
  if (watermark) {
    watermark.style.position = 'absolute';
    watermark.style.inset = '0';
    watermark.style.pointerEvents = 'none';
    watermark.style.overflow = 'hidden';
    watermark.style.mixBlendMode = 'hard-light';
    watermark.style.opacity = '0';
    watermark.style.transition = 'opacity 0.3s ease-out';
    watermark.style.zIndex = '6';
    watermark.style.webkitMaskImage = conicMask;
    watermark.style.webkitMaskSize = '12px 12px';
    watermark.style.maskImage = conicMask;
    watermark.style.maskSize = '12px 12px';
    watermark.style.filter = 'saturate(0.9) contrast(1.1) brightness(1.2)';
  }

  // Spotlight container — overlay blend
  if (spotlight) {
    spotlight.style.position = 'absolute';
    spotlight.style.inset = '0';
    spotlight.style.pointerEvents = 'none';
    spotlight.style.overflow = 'hidden';
    spotlight.style.mixBlendMode = 'overlay';
    spotlight.style.zIndex = '8';
  }

  // Spotlight inner — radial gradient that follows pointer
  if (spotLight) {
    spotLight.style.position = 'absolute';
    spotLight.style.left = '50%';
    spotLight.style.top = '50%';
    spotLight.style.width = '500%';
    spotLight.style.aspectRatio = '1';
    spotLight.style.background =
      'radial-gradient(hsl(0 0% 100% / 0.4) 0 2%,' +
      ' hsl(0 0% 10% / 0.2) 20%)';
    spotLight.style.filter = 'brightness(1.2) contrast(1.2)';
    spotLight.style.opacity = '0';
    spotLight.style.transition =
      'opacity 0.3s ease-out, translate 0.3s ease-out';
  }

  // Edge glare — diagonal gradient stripe
  if (glare) {
    glare.style.position = 'absolute';
    glare.style.inset = '0';
    glare.style.pointerEvents = 'none';
    glare.style.overflow = 'hidden';
    glare.style.opacity = '0';
    glare.style.transition = 'opacity 0.3s ease-out';
    glare.style.zIndex = '9';
    glare.style.background =
      'linear-gradient(-65deg,' +
      ' transparent 0% 40%, #fff 40% 50%,' +
      ' transparent 50%, transparent 55%,' +
      ' #fff 55% 60%, transparent 60% 100%)';
  }

  // ═══════════════════════════════════════════
  // Card structure styles
  // ═══════════════════════════════════════════

  // Perspective on outer container
  tiltContainer.style.perspective = '1000px';

  // 3D transform on card wrap
  cardWrap.style.transformStyle = 'preserve-3d';
  cardWrap.style.willChange = 'transform';
  cardWrap.style.transition =
    'transform 0.5s ease-out, box-shadow 0.5s ease-out';
  cardWrap.style.cursor = 'pointer';

  // Front face — hidden when flipped
  var frontFace = cardWrap.querySelector('.win-result_card');
  if (frontFace) {
    frontFace.style.backfaceVisibility = 'hidden';
    frontFace.style.webkitBackfaceVisibility = 'hidden';
  }

  // Back face — pre-rotated 180deg, hidden when not flipped
  var backFace = cardWrap.querySelector('.win-result_card-back');
  if (backFace) {
    backFace.style.backfaceVisibility = 'hidden';
    backFace.style.webkitBackfaceVisibility = 'hidden';
    backFace.style.transform = 'rotateY(180deg)';
    backFace.style.position = 'absolute';
    backFace.style.inset = '0';
  }

  // ═══════════════════════════════════════════
  // Core update — runs on every mouse move, leave, and click
  // ═══════════════════════════════════════════
  function updateTransform() {
    // Card tilt + flip rotation
    var flipDeg = isFlipped ? 180 : 0;
    cardWrap.style.transform =
      'rotateX(' + rotateX + 'deg) rotateY(' +
      (rotateY + flipDeg) + 'deg)';

    // Dynamic box-shadow shifts opposite to tilt direction
    if (!isHovering) {
      cardWrap.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    } else {
      cardWrap.style.boxShadow =
        (-rotateY * 1.5) + 'px ' + (rotateX * 1.5) +
        'px 40px rgba(0,0,0,0.4), ' +
        (-rotateY * 0.5) + 'px ' + (rotateX * 0.5) +
        'px 15px rgba(0,0,0,0.2)';
    }

    // Transition speed: fast while hovering, slow on leave, smooth on flip
    cardWrap.style.transition = isFlipping
      ? 'transform 0.7s ease-in-out, box-shadow 0.7s ease-in-out'
      : (isHovering
        ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
        : 'transform 0.5s ease-out, box-shadow 0.5s ease-out');

    // ── Overlay visibility ──
    var showFront = isHovering && !isFlipped;

    if (pattern) pattern.style.opacity = showFront ? '0.4' : '0';
    if (watermark) watermark.style.opacity = showFront ? '0.35' : '0';
    if (glare) glare.style.opacity = showFront ? '0.15' : '0';

    if (spotLight) {
      spotLight.style.opacity = showFront ? '1' : '0';
      spotLight.style.translate =
        'calc(-50% + ' + (pointerX * 20) + '%) ' +
        'calc(-50% + ' + (pointerY * 20) + '%)';
      spotLight.style.transition = isHovering
        ? 'none'
        : 'opacity 0.3s ease-out, translate 0.3s ease-out';
    }

    // ── Rainbow orbs ──
    // Pattern layer (first pair: refractBLs[0], refractTRs[0])
    if (refractBLs[0]) {
      styleOrb(refractBLs[0], '0', '100%',
        0.15 + pointerX * 0.25,
        Math.max(-10, Math.min(10, -10 + pointerX * 10)),
        Math.max(0, pointerY * -10));
      refractBLs[0].style.bottom = '0';
      refractBLs[0].style.left = '0';
      refractBLs[0].style.top = 'auto';
      refractBLs[0].style.right = 'auto';
    }
    if (refractTRs[0]) {
      styleOrb(refractTRs[0], '100%', '0',
        0.15 + pointerX * -0.65,
        Math.max(-10, Math.min(10, 10 + pointerX * 10)),
        Math.min(0, pointerY * -10));
      refractTRs[0].style.top = '0';
      refractTRs[0].style.right = '0';
      refractTRs[0].style.bottom = 'auto';
      refractTRs[0].style.left = 'auto';
    }

    // Watermark layer (second pair: refractBLs[1], refractTRs[1])
    if (refractBLs[1]) {
      styleOrb(refractBLs[1], '0', '100%',
        0.15 + pointerX * 0.25,
        Math.max(-10, Math.min(10, -10 + pointerX * 10)),
        Math.max(0, pointerY * -10));
      refractBLs[1].style.bottom = '0';
      refractBLs[1].style.left = '0';
      refractBLs[1].style.top = 'auto';
      refractBLs[1].style.right = 'auto';
    }
    if (refractTRs[1]) {
      styleOrb(refractTRs[1], '100%', '0',
        0.15 + pointerX * -0.65,
        Math.max(-10, Math.min(10, 10 + pointerX * 10)),
        Math.min(0, pointerY * -10));
      refractTRs[1].style.top = '0';
      refractTRs[1].style.right = '0';
      refractTRs[1].style.bottom = 'auto';
      refractTRs[1].style.left = 'auto';
    }
  }

  // ═══════════════════════════════════════════
  // Event listeners
  // ═══════════════════════════════════════════

  // Mouse move → tilt + pointer tracking (±30 deg range)
  tiltContainer.addEventListener('mousemove', function (e) {
    var rect = tiltContainer.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;
    rotateY = (x - 0.5) * 30;
    rotateX = (0.5 - y) * 30;
    pointerX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    pointerY = Math.max(-1, Math.min(1, (y - 0.5) * 2));
    isHovering = true;
    updateTransform();
  });

  // Mouse leave → reset to flat
  tiltContainer.addEventListener('mouseleave', function () {
    rotateX = 0;
    rotateY = 0;
    pointerX = 0;
    pointerY = 0;
    isHovering = false;
    updateTransform();
  });

  // Click → flip card (0.7s transition)
  cardWrap.addEventListener('click', function (e) {
    e.preventDefault();
    isFlipping = true;
    isFlipped = !isFlipped;
    updateTransform();
    setTimeout(function () {
      isFlipping = false;
      updateTransform();
    }, 700);
  });

  // Set initial state
  updateTransform();
})();
