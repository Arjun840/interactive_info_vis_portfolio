// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {
  function pad2(n) {
    return String(n).padStart(2, '0');
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

    drawIsoIceCube(p.width / 2, p.height * 0.60, cubeSize, heightPx);
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
