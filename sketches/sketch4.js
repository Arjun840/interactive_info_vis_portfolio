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
    // Isometric proportions
    const isoW = size;
    const isoH = size * 0.58;

    // Bottom diamond (on "ground" plane)
    const A2 = { x: 0, y: -isoH };
    const B2 = { x: isoW, y: 0 };
    const C2 = { x: 0, y: isoH };
    const D2 = { x: -isoW, y: 0 };

    // Top diamond (lifted by heightPx)
    const A = { x: 0, y: -heightPx - isoH };
    const B = { x: isoW, y: -heightPx };
    const C = { x: 0, y: -heightPx + isoH };
    const D = { x: -isoW, y: -heightPx };

    p.push();
    p.translate(cx, cy);

    // Soft shadow
    p.noStroke();
    p.fill(0, 0, 0, 120);
    p.ellipse(0, isoH * 1.15, isoW * 1.6, isoH * 0.9);

    // Faces (draw farthest first)
    p.stroke(210, 240, 255, 140);
    p.strokeWeight(1);

    // Left face
    p.fill(90, 170, 210, 150);
    p.beginShape();
    p.vertex(D.x, D.y);
    p.vertex(A.x, A.y);
    p.vertex(A2.x, A2.y);
    p.vertex(D2.x, D2.y);
    p.endShape(p.CLOSE);

    // Right face
    p.fill(70, 145, 195, 160);
    p.beginShape();
    p.vertex(B.x, B.y);
    p.vertex(C.x, C.y);
    p.vertex(C2.x, C2.y);
    p.vertex(B2.x, B2.y);
    p.endShape(p.CLOSE);

    // Front face (adds solidity; subtle so it still reads as "ice")
    p.fill(110, 195, 235, 130);
    p.beginShape();
    p.vertex(C.x, C.y);
    p.vertex(D.x, D.y);
    p.vertex(D2.x, D2.y);
    p.vertex(C2.x, C2.y);
    p.endShape(p.CLOSE);

    // Top face
    p.fill(175, 235, 255, 185);
    p.beginShape();
    p.vertex(A.x, A.y);
    p.vertex(B.x, B.y);
    p.vertex(C.x, C.y);
    p.vertex(D.x, D.y);
    p.endShape(p.CLOSE);

    // A couple of highlight edges for "ice" crispness
    p.stroke(235, 250, 255, 170);
    p.line(A.x, A.y, B.x, B.y);
    p.line(A.x, A.y, D.x, D.y);

    p.pop();
  }

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
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

    // Ice cube height mapped to current hour (12 full -> 11 nearly flat)
    // Use a smooth hour-in-12 value so it changes continuously within the hour.
    const hourIn12 = (h % 12) + (m / 60) + (s / 3600); // 0..~11.999
    const heightFactor = p.constrain(1 - (hourIn12 / 12), 0.03, 1.0);

    const cubeSize = p.min(p.width, p.height) * 0.18;
    const maxHeightPx = cubeSize * 1.15;
    const heightPx = maxHeightPx * heightFactor;

    // Minutes logic: puddle grows from invisible (0) to floor-filling (59)
    // Use sqrt mapping so perceived *area* grows roughly linearly with minutes.
    const minuteT = p.constrain(m / 59, 0, 1);
    const puddleMaxR = p.min(p.width, p.height) * 0.42;
    const puddleR = puddleMaxR * p.sqrt(minuteT);

    const cubeCx = p.width / 2;
    const cubeCy = p.height * 0.60;
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

    // Seconds logic: a drip falls from cube top to puddle once per second
    if (s !== lastSecond) {
      lastSecond = s;
      dripOffsetX = p.map(p.noise(s * 0.33, 3.7), 0, 1, -cubeSize * 0.18, cubeSize * 0.18);
    }

    const dripT = (now % 1000) / 1000; // 0..1 each second
    const dt = smoothstep(dripT);
    const dripStartX = cubeJx + dripOffsetX;
    const dripStartY = cubeJy - heightPx - cubeSize * 0.10;
    const dripEndX = cubeCx + dripOffsetX * 0.35;
    const dripEndY = puddleY - 6;

    const dripX = p.lerp(dripStartX, dripEndX, dt) + p.sin(dt * p.PI) * dripOffsetX * 0.08;
    const dripY = p.lerp(dripStartY, dripEndY, dt);

    // Draw cube before the drip so the drip reads in front
    drawIsoIceCube(cubeJx, cubeJy, cubeSize, heightPx);

    // Drip particle
    p.noStroke();
    p.fill(90, 190, 255, 190);
    const dripD = p.lerp(4, 7, 1 - dt);
    p.circle(dripX, dripY, dripD);

    // Landing micro-ripple near impact (only if puddle exists)
    if (puddleR > 2 && dt > 0.94) {
      const impactT = (dt - 0.94) / 0.06;
      p.noFill();
      p.stroke(140, 220, 255, 120 * (1 - impactT));
      p.strokeWeight(2);
      p.ellipse(dripEndX, dripEndY, (10 + 30 * impactT), (7 + 20 * impactT));
    }
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
