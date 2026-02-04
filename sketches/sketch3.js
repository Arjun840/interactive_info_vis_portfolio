// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };
  p.draw = function () {
    // Coffee Clock - top-down view
    
    // Wooden table background
    p.background(139, 90, 43); // brown wood color
    
    // Wood grain texture (subtle lines)
    p.stroke(120, 75, 35);
    p.strokeWeight(1);
    const grainSpacing = 8;
    for (let y = 0; y < p.height; y += grainSpacing) {
      const offset = p.sin(y * 0.01) * 2;
      p.line(0, y, p.width, y + offset);
    }
    
    // Additional wood grain variation
    p.stroke(150, 100, 50);
    p.strokeWeight(0.5);
    for (let x = 0; x < p.width; x += grainSpacing * 3) {
      const offset = p.cos(x * 0.008) * 1.5;
      p.line(x, 0, x + offset, p.height);
    }
    
    // Center of canvas
    const cx = p.width / 2;
    const cy = p.height / 2;
    
    // Circular white plate in the center
    p.noStroke();
    p.fill(255, 255, 255, 250);
    const plateRadius = p.min(p.width, p.height) * 0.25;
    p.circle(cx, cy, plateRadius * 2);
    
    // Plate rim/shadow for depth
    p.fill(240, 240, 240, 200);
    p.circle(cx, cy, plateRadius * 1.95);
    
    // Coffee mug (slightly smaller circle on top of plate)
    p.noStroke();
    p.fill(60, 40, 25); // dark coffee brown
    const mugRadius = plateRadius * 0.75;
    p.circle(cx, cy, mugRadius * 2);
    
    // Mug rim (lighter inner edge)
    p.fill(80, 55, 35);
    p.circle(cx, cy, mugRadius * 1.9);
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
