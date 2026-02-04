// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Helvetica');
  };
  p.draw = function () {
    // Foggy Mirror Clock — base scene
    p.background(205, 212, 220); // bathroom wall

    // Subtle tile grid
    p.stroke(185, 192, 200);
    p.strokeWeight(1);
    const tile = 48;
    for (let x = 0; x <= p.width; x += tile) p.line(x, 0, x, p.height);
    for (let y = 0; y <= p.height; y += tile) p.line(0, y, p.width, y);

    // Scene layout (relative coordinates)
    const cx = p.width / 2;
    const topPad = 70;
    const sinkH = p.height * 0.22;
    const sinkTop = p.height - sinkH;

    const mirrorW = p.min(p.width * 0.62, 560);
    const mirrorH = p.min(p.height * 0.52, 520);
    const mirrorX = cx - mirrorW / 2;
    const mirrorY = topPad;

    // Mirror frame
    p.noStroke();
    p.fill(30, 34, 40);
    p.rect(mirrorX - 16, mirrorY - 16, mirrorW + 32, mirrorH + 32, 18);

    // Mirror glass (darker, reflective)
    p.fill(35, 45, 55);
    p.rect(mirrorX, mirrorY, mirrorW, mirrorH, 12);

    // Small highlight streaks
    p.noFill();
    p.stroke(255, 255, 255, 55);
    p.strokeWeight(3);
    p.line(mirrorX + mirrorW * 0.12, mirrorY + mirrorH * 0.12, mirrorX + mirrorW * 0.32, mirrorY + mirrorH * 0.06);
    p.line(mirrorX + mirrorW * 0.18, mirrorY + mirrorH * 0.22, mirrorX + mirrorW * 0.42, mirrorY + mirrorH * 0.14);

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

    // Fog layer over the mirror (as specified)
    p.noStroke();
    p.fill(220, 220, 220, 240);
    p.rect(mirrorX, mirrorY, mirrorW, mirrorH, 12);
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
