// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  function drawFingerWipe(cx, cy, angle, len, thickness, seed) {
    // Thick "wiped" path through fog (draw this while in p.erase() mode)
    const steps = 16;

    p.push();
    p.translate(cx, cy);
    p.rotate(angle);

    p.noFill();
    p.stroke(0);
    p.strokeWeight(thickness);
    p.strokeCap(p.ROUND);
    p.strokeJoin(p.ROUND);

    p.beginShape();
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = u * len;
      // static wobble (no time component) so the wipe doesn't animate
      const wobble = (p.noise(seed, u * 2.6, 0.7) - 0.5) * 2;
      const y = wobble * thickness * 0.10 * (0.35 + 0.65 * (1 - u));
      p.vertex(x, y);
    }
    p.endShape();

    p.pop();
  }

  function drawGlowLine(cx, cy, angle, len, thickness) {
    // Drawn BEFORE erase to leave a "glow edge" around the wiped path.
    p.push();
    p.translate(cx, cy);
    p.rotate(angle);
    p.noFill();
    p.stroke(255, 255, 255, 150);
    p.strokeWeight(thickness);
    p.strokeCap(p.ROUND);
    p.line(0, 0, len, 0);
    p.pop();
  }

  function drawToothbrushWithGlow(cx, cy, angle, len, w) {
    // Detailed toothbrush silhouette with glow effect
    p.push();
    p.translate(cx, cy);
    p.rotate(angle);

    const handleLen = len * 0.70;
    const headLen = len * 0.30;
    const headW = w * 2.0;

    // GLOW: Draw glow first with white stroke, high transparency, thick weight
    p.noFill();
    p.stroke(255, 255, 255, 50);
    p.strokeWeight(w * 3);
    p.strokeCap(p.ROUND);
    
    // Glow for handle
    p.line(0, 0, handleLen, 0);
    // Glow for head
    p.rect(handleLen, -headW / 2, headLen, headW, 3);

    // ACTUAL TOOTHBRUSH: Draw bright white shapes on top
    p.noStroke();
    p.fill(255, 255, 255, 255);

    // Handle (slightly tapered)
    p.beginShape();
    p.vertex(0, -w / 2);
    p.vertex(handleLen * 0.2, -w * 0.48);
    p.vertex(handleLen * 0.8, -w * 0.45);
    p.vertex(handleLen, -w * 0.42);
    p.vertex(handleLen, w * 0.42);
    p.vertex(handleLen * 0.8, w * 0.45);
    p.vertex(handleLen * 0.2, w * 0.48);
    p.vertex(0, w / 2);
    p.endShape(p.CLOSE);

    // Head (rectangular)
    p.rect(handleLen, -headW / 2, headLen, headW, 3);

    // Bristles (small vertical lines)
    p.stroke(200, 200, 200, 200);
    p.strokeWeight(1.5);
    const bristleCount = 8;
    for (let i = 0; i < bristleCount; i++) {
      const u = i / (bristleCount - 1);
      const x = handleLen + headLen * 0.15 + (headLen * 0.7 * u);
      p.line(x, -headW * 0.35, x, headW * 0.35);
    }

    p.pop();
  }

  function drawClockFace(cx, cy, radius) {
    // 12 bold white radial dashes in a circle
    for (let i = 0; i < 12; i++) {
      const ang = (p.TWO_PI * i) / 12 - p.HALF_PI;
      const isMajor = (i % 3 === 0); // 12, 3, 6, 9 positions
      
      // Soft outer glow for each dash
      p.noFill();
      p.stroke(255, 255, 255, 30);
      p.strokeWeight(isMajor ? 12 : 10);
      p.strokeCap(p.ROUND);
      
      const r1 = radius * (isMajor ? 0.75 : 0.80);
      const r2 = radius * 0.95;
      const x1 = cx + r1 * p.cos(ang);
      const y1 = cy + r1 * p.sin(ang);
      const x2 = cx + r2 * p.cos(ang);
      const y2 = cy + r2 * p.sin(ang);
      
      // Glow line
      p.line(x1, y1, x2, y2);
      
      // Actual dash (bold white)
      p.stroke(255, 255, 255, 255);
      p.strokeWeight(isMajor ? 6 : 4);
      p.strokeCap(p.ROUND);
      p.line(x1, y1, x2, y2);
    }

    // Center dot with glow
    p.noStroke();
    p.fill(255, 255, 255, 30);
    p.circle(cx, cy, 16);
    p.fill(255, 255, 255, 255);
    p.circle(cx, cy, 8);
  }

  function drawMirrorMist(cx, cy, radius) {
    // Base fog circle (requested fill), then add static grey mist texture (no animation)
    p.noStroke();
    // Slightly less "whiteboard" and more grey mist so the mirror still reads as glass
    p.fill(205, 205, 205, 215);
    p.circle(cx, cy, radius * 2);

    // Static grey mist blobs (gives "foggy" look vs flat circle, but no movement)
    p.noStroke();
    for (let i = 0; i < 26; i++) {
      const u = i / 25;
      const angle = p.TWO_PI * u;
      const dist = radius * p.lerp(0.3, 0.85, p.noise(i * 0.23, 1.2));
      const x = cx + dist * p.cos(angle);
      const y = cy + dist * p.sin(angle);
      const w = radius * p.lerp(0.18, 0.42, p.noise(i * 0.7, 2.1));
      const h = radius * p.lerp(0.18, 0.42, p.noise(i * 0.7, 4.4));
      p.fill(195, 195, 195, 55);
      p.ellipse(x, y, w, h);
      p.fill(225, 225, 225, 28);
      p.ellipse(x + 18, y - 6, w * 0.75, h * 0.75);
    }

    // Fine mist speckles (static noise-based) for texture
    p.noStroke();
    const step = 22;
    for (let y = cy - radius + 8; y < cy + radius - 8; y += step) {
      for (let x = cx - radius + 8; x < cx + radius - 8; x += step) {
        const dist = p.dist(x, y, cx, cy);
        if (dist < radius - 8) {
          const n = p.noise(x * 0.01, y * 0.01, 3.3);
          if (n > 0.58) {
            p.fill(240, 240, 240, 26);
            p.circle(x, y, 10 + 10 * n);
          }
        }
      }
    }
  }

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Helvetica');
  };
  p.draw = function () {
    // Foggy Mirror Clock — base scene
    // Dark, high-contrast bathroom wall so the mirror/erased areas pop
    p.background(18, 22, 30);

    // Subtle tile grid
    p.stroke(50, 60, 78);
    p.strokeWeight(1);
    const tile = 48;
    for (let x = 0; x <= p.width; x += tile) p.line(x, 0, x, p.height);
    for (let y = 0; y <= p.height; y += tile) p.line(0, y, p.width, y);

    // Scene layout (relative coordinates)
    const cx = p.width / 2;
    const topPad = 70;
    const sinkH = p.height * 0.22;
    const sinkTop = p.height - sinkH;

    // Circular mirror
    const mirrorRadius = p.min(p.width * 0.31, p.height * 0.26, 280);
    const mirrorCx = cx;
    const mirrorCy = topPad + mirrorRadius;

    // Mirror frame (circular)
    p.noStroke();
    p.fill(30, 34, 40);
    p.circle(mirrorCx, mirrorCy, (mirrorRadius + 16) * 2);

    // Mirror glass (dark + reflective gradient so it reads like a mirror, not a whiteboard)
    p.noStroke();
    p.fill(14, 22, 32);
    p.circle(mirrorCx, mirrorCy, mirrorRadius * 2);
    // Radial gradient for mirror effect
    for (let i = 0; i < 12; i++) {
      const u = i / 11;
      const r = mirrorRadius * (0.3 + u * 0.7);
      p.fill(25, 40, 58, 12);
      p.circle(mirrorCx, mirrorCy, r * 2);
    }
    // Glowing white edge for contrast (prominent like in the image)
    p.noFill();
    p.stroke(255, 255, 255, 180);
    p.strokeWeight(6);
    p.circle(mirrorCx, mirrorCy, mirrorRadius * 2);
    // Outer glow ring
    p.stroke(255, 255, 255, 100);
    p.strokeWeight(3);
    p.circle(mirrorCx, mirrorCy, (mirrorRadius + 4) * 2);

    // Small highlight streaks (reflection)
    p.noFill();
    p.stroke(255, 255, 255, 55);
    p.strokeWeight(3);
    const h1x = mirrorCx - mirrorRadius * 0.25;
    const h1y = mirrorCy - mirrorRadius * 0.2;
    p.line(h1x, h1y, h1x + mirrorRadius * 0.3, h1y - mirrorRadius * 0.15);
    const h2x = mirrorCx - mirrorRadius * 0.15;
    const h2y = mirrorCy - mirrorRadius * 0.05;
    p.line(h2x, h2y, h2x + mirrorRadius * 0.4, h2y - mirrorRadius * 0.1);

    // Sink / vanity at bottom
    p.noStroke();
    // vanity body
    p.fill(65, 70, 78);
    p.rect(0, sinkTop + 30, p.width, sinkH, 0);
    // countertop
    p.fill(200, 204, 210);
    p.rect(0, sinkTop, p.width, 40);

    // basin
    p.fill(235, 238, 242);
    const basinW = p.min(p.width * 0.55, 560);
    const basinH = 80;
    p.ellipse(cx, sinkTop + 30, basinW, basinH);
    p.fill(220, 224, 230);
    p.ellipse(cx, sinkTop + 34, basinW * 0.72, basinH * 0.55);

    // faucet
    p.fill(170, 176, 185);
    p.rect(cx - 12, sinkTop - 10, 24, 26, 6);
    p.rect(cx - 42, sinkTop - 2, 84, 14, 7);

    // Blue mist/fog around the sink area (foggier, steamy look)
    // Drawn AFTER the sink so it overlays like mist.
    const t = p.millis() * 0.00035;
    p.noStroke();
    // soft tint over the whole sink region
    p.fill(140, 195, 255, 35);
    p.rect(0, sinkTop - 25, p.width, sinkH + 55);
    // drifting mist blobs
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const x = p.lerp(-80, p.width + 80, u) + p.sin(t * 2 + i * 1.7) * 35;
      const y = sinkTop + 10 + p.sin(t * 3 + i * 2.2) * 18 + u * 35;
      const w = p.lerp(p.width * 0.25, p.width * 0.55, p.abs(p.sin(i * 1.1)));
      const h2 = p.lerp(50, 110, p.abs(p.cos(i * 0.9)));
      p.fill(150, 210, 255, 32);
      p.ellipse(x, y, w, h2);
      p.fill(120, 195, 255, 22);
      p.ellipse(x + 22, y - 10, w * 0.75, h2 * 0.75);
    }

    // Clock center within mirror (same as mirror center)
    const mh = mirrorCx;
    const mv = mirrorCy;
    const clockR = mirrorRadius * 0.55;
    const hourLen = clockR * 0.62;
    const minLen = clockR * 0.90;

    const hr = p.hour() % 12;
    const hrFrac = (hr + p.minute() / 60) / 12;
    const minFrac = (p.minute() + p.second() / 60) / 60;
    const hourAng = hrFrac * p.TWO_PI - p.HALF_PI;
    const minAng = minFrac * p.TWO_PI - p.HALF_PI;

    // Foggy grey mist on mirror (static, circular)
    drawMirrorMist(mirrorCx, mirrorCy, mirrorRadius);

    // Draw clock face (12 radial dashes)
    drawClockFace(mh, mv, clockR);

    // Draw toothbrush hands with glow effect
    // Hour hand: shorter, slightly thicker
    drawToothbrushWithGlow(mh, mv, hourAng, hourLen, 10);
    // Minute hand: longer, slightly thinner
    drawToothbrushWithGlow(mh, mv, minAng, minLen, 8);
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
