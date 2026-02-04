// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {
  // Interaction / animation state
  let lastSecond = -1;
  let dripOffsetX = 0;
  let jiggleUntilMs = 0;
  const splashes = [];

  // Last computed geometry (so mouse clicks can spawn splashes in the right place)
  let lastCubeCx = 0;
  let lastCubeCy = 0;
  let lastCubeSize = 0;
  let lastHeightPx = 0;
  let lastPuddleY = 0;
  let lastPuddleR = 0;

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function smoothstep(t) {
    const x = p.constrain(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function drawPuddle(cx, cy, r) {
    if (r <= 0.5) return;

    // Irregular but stable "puddle" using layered sine perturbations
    const pts = 36;
    const phase1 = 0.9;
    const phase2 = 2.1;
    const phase3 = -0.6;

    p.push();
    p.translate(cx, cy);
    p.noStroke();

    // Slight radial gradient by drawing 2 layers
    p.fill(70, 160, 230, 70);
    p.beginShape();
    for (let i = 0; i < pts; i++) {
      const a = (p.TWO_PI * i) / pts;
      const k =
        0.78 +
        0.10 * p.sin(a * 3 + phase1) +
        0.08 * p.sin(a * 7 + phase2) +
        0.05 * p.sin(a * 11 + phase3);
      const rr = r * k;
      p.vertex(rr * p.cos(a), rr * 0.62 * p.sin(a));
    }
    p.endShape(p.CLOSE);

    p.fill(100, 195, 255, 95);
    p.beginShape();
    for (let i = 0; i < pts; i++) {
      const a = (p.TWO_PI * i) / pts;
      const k =
        0.72 +
        0.10 * p.sin(a * 3 + phase1 + 0.5) +
        0.07 * p.sin(a * 7 + phase2 - 0.3) +
        0.04 * p.sin(a * 11 + phase3 + 0.8);
      const rr = r * 0.72 * k;
      p.vertex(rr * p.cos(a), rr * 0.62 * p.sin(a));
    }
    p.endShape(p.CLOSE);

    p.pop();
  }

  function drawSplashes() {
    const now = p.millis();
    for (let i = splashes.length - 1; i >= 0; i--) {
      const sp = splashes[i];
      const age = (now - sp.t0) / 1000; // seconds
      if (age > 0.9) {
        splashes.splice(i, 1);
        continue;
      }

      const a = 1 - age / 0.9;
      const baseR = p.lerp(6, sp.maxR, smoothstep(age / 0.9));

      p.push();
      p.translate(sp.x, sp.y);
      p.noFill();
      p.strokeWeight(2);

      // outer ring
      p.stroke(150, 220, 255, 110 * a);
      p.ellipse(0, 0, baseR * 2.0, baseR * 1.25);

      // inner ring
      p.stroke(90, 185, 255, 140 * a);
      p.ellipse(0, 0, baseR * 1.3, baseR * 0.85);

      // tiny droplets
      p.noStroke();
      p.fill(120, 205, 255, 85 * a);
      for (let k = 0; k < sp.dots; k++) {
        const ang = sp.phi + (p.TWO_PI * k) / sp.dots;
        const rr = baseR * 0.55;
        p.circle(rr * p.cos(ang), 0.62 * rr * p.sin(ang), 3);
      }

      p.pop();
    }
  }

  function drawIsoIceCube(cx, cy, size, heightPx) {
    // 3-face isometric cube: Top diamond + Front-Left + Front-Right
    // `cx,cy` is the center of the bottom footprint (keeps everything centered).
    const dx = size;        // horizontal half-width
    const dy = size * 0.58; // vertical half-height of diamond

    // Top face vertices (lifted by heightPx)
    const Ttop = { x: cx, y: cy - heightPx - dy };
    const Tright = { x: cx + dx, y: cy - heightPx };
    const Tbottom = { x: cx, y: cy - heightPx + dy };
    const Tleft = { x: cx - dx, y: cy - heightPx };

    // Bottom footprint vertices (on the floor)
    const Btop = { x: cx, y: cy - dy };
    const Bright = { x: cx + dx, y: cy };
    const Bbottom = { x: cx, y: cy + dy };
    const Bleft = { x: cx - dx, y: cy };

    // Soft shadow (anchored to footprint)
    p.noStroke();
    p.fill(0, 0, 0, 120);
    p.ellipse(cx, cy + dy * 1.15, dx * 1.6, dy * 0.9);

    // Faces
    p.stroke(210, 240, 255, 150);
    p.strokeWeight(1);

    // Front-Left face (Tleft -> Tbottom -> Bbottom -> Bleft)
    p.fill(85, 170, 215, 160);
    p.beginShape();
    p.vertex(Tleft.x, Tleft.y);
    p.vertex(Tbottom.x, Tbottom.y);
    p.vertex(Bbottom.x, Bbottom.y);
    p.vertex(Bleft.x, Bleft.y);
    p.endShape(p.CLOSE);

    // Front-Right face (Tright -> Tbottom -> Bbottom -> Bright)
    p.fill(65, 145, 200, 175);
    p.beginShape();
    p.vertex(Tright.x, Tright.y);
    p.vertex(Tbottom.x, Tbottom.y);
    p.vertex(Bbottom.x, Bbottom.y);
    p.vertex(Bright.x, Bright.y);
    p.endShape(p.CLOSE);

    // Top face (diamond)
    p.fill(180, 240, 255, 195);
    p.beginShape();
    p.vertex(Ttop.x, Ttop.y);
    p.vertex(Tright.x, Tright.y);
    p.vertex(Tbottom.x, Tbottom.y);
    p.vertex(Tleft.x, Tleft.y);
    p.endShape(p.CLOSE);

    // Crisp highlight edges
    p.stroke(240, 255, 255, 180);
    p.line(Ttop.x, Ttop.y, Tright.x, Tright.y);
    p.line(Ttop.x, Ttop.y, Tleft.x, Tleft.y);
    p.line(Tleft.x, Tleft.y, Bleft.x, Bleft.y);
    p.line(Tright.x, Tright.y, Bright.x, Bright.y);
  }

  p.setup = function () {
    // Fixed canvas so center-based geometry is stable
    p.createCanvas(800, 800);
    p.textFont('Helvetica');
    p.noiseSeed(7);
  };

  p.mousePressed = function () {
    // Click: add a splash + briefly jiggle the cube
    jiggleUntilMs = p.millis() + 450;

    // If puddle is invisible, still allow jiggle but skip splash
    if (lastPuddleR <= 1) return;

    const ox = p.map(p.noise(p.millis() * 0.001, 1.2), 0, 1, -lastPuddleR * 0.25, lastPuddleR * 0.25);
    const oy = p.map(p.noise(p.millis() * 0.001, 2.3), 0, 1, -lastPuddleR * 0.12, lastPuddleR * 0.12);

    splashes.push({
      t0: p.millis(),
      x: lastCubeCx + ox,
      y: lastPuddleY + oy,
      maxR: lastPuddleR * 0.55,
      dots: 8,
      phi: p.noise(p.millis() * 0.001, 9.1) * p.TWO_PI
    });
  };

  p.draw = function () {
    // Dark background
    p.background(10, 12, 18);

    // Digital time (clean + clear)
    const h = p.hour();
    const m = p.minute();
    const s = p.second();
    const timeStr = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;

    p.noStroke();
    p.fill(240);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(28);
    p.text(timeStr, p.width / 2, 22);

    // Hours logic: vertical line with 12 (top) -> 11 (bottom)
    const marginTop = 80;
    const marginBottom = 80;
    const xLine = 70;
    const yTop = marginTop;
    const yBottom = p.height - marginBottom;

    p.stroke(180, 200, 220, 140);
    p.strokeWeight(2);
    p.line(xLine, yTop, xLine, yBottom);

    p.noStroke();
    p.fill(210, 225, 245, 190);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(14);

    for (let i = 0; i < 12; i++) {
      const label = (i === 0) ? 12 : i; // 12 at top, 1..11 downward
      const y = p.map(i, 0, 11, yTop, yBottom);

      // tick
      p.stroke(180, 200, 220, 120);
      p.strokeWeight(2);
      p.line(xLine - 6, y, xLine + 6, y);

      p.noStroke();
      p.text(String(label), xLine + 14, y);
    }

    // Ice cube height mapped to current hour on a 12-hour scale
    // 12:00 (hr=0) => tall, 11:00 (hr=11) => nearly flat
    const hr = p.hour() % 12;
    const cubeSize = p.min(p.width, p.height) * 0.14;
    const maxHeightPx = cubeSize * 1.45;
    const heightPx = p.map(hr, 0, 11, maxHeightPx, maxHeightPx * 0.06);

    // Minutes logic: puddle grows from invisible (0) to floor-filling (59)
    // Use sqrt mapping so perceived *area* grows roughly linearly with minutes.
    const minuteT = p.constrain(m / 59, 0, 1);
    const puddleMaxR = p.min(p.width, p.height) * 0.42;
    const puddleR = puddleMaxR * p.sqrt(minuteT);

    // Everything relative to a stable center anchor
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const cubeCx = centerX;
    const cubeCy = centerY + 120; // leave room for digital time and hour scale
    const puddleY = cubeCy + (cubeSize * 0.58) * 1.15; // match cube shadow position

    // Store latest geometry for mousePressed
    lastCubeCx = cubeCx;
    lastCubeCy = cubeCy;
    lastCubeSize = cubeSize;
    lastHeightPx = heightPx;
    lastPuddleY = puddleY;
    lastPuddleR = puddleR;

    drawPuddle(cubeCx, puddleY, puddleR);
    drawSplashes();

    // Interactivity: subtle jiggle using noise after a click
    const now = p.millis();
    const jiggleT = (now < jiggleUntilMs) ? p.constrain((jiggleUntilMs - now) / 450, 0, 1) : 0;
    const jiggleAmt = cubeSize * 0.06 * jiggleT;
    const nT = now * 0.01;
    const jigX = (p.noise(nT, 10.1) - 0.5) * 2 * jiggleAmt;
    const jigY = (p.noise(nT, 20.2) - 0.5) * 2 * jiggleAmt * 0.55;

    const cubeJx = cubeCx + jigX;
    const cubeJy = cubeCy + jigY;

    // Seconds logic: a drip falls from the CENTER-TOP of the cube once per second
    // (Y increases based on p.millis() % 1000)
    if (s !== lastSecond) {
      lastSecond = s;
    }

    const dt = (now % 1000) / 1000; // 0..1 each second
    const dripStartX = cubeJx; // center-top
    const dripStartY = cubeJy - heightPx; // center of the top face
    const dripEndX = cubeCx;
    const dripEndY = puddleY - 8;

    const dripX = dripStartX;
    const dripY = p.lerp(dripStartY, dripEndY, dt);

    // Draw cube before the drip so the drip reads in front
    drawIsoIceCube(cubeJx, cubeJy, cubeSize, heightPx);

    // Drip particle (bright blue)
    p.noStroke();
    p.fill(0, 185, 255, 240);
    p.circle(dripX, dripY, 7);

    // Landing micro-ripple near impact (only if puddle exists)
    if (puddleR > 2 && dt > 0.94) {
      const impactT = (dt - 0.94) / 0.06;
      p.noFill();
      p.stroke(140, 220, 255, 120 * (1 - impactT));
      p.strokeWeight(2);
      p.ellipse(dripEndX, dripEndY, (10 + 30 * impactT), (7 + 20 * impactT));
    }
  };
  p.windowResized = function () { /* fixed 800x800 */ };
});
