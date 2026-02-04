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
    
    // Hours: Coffee stain marks around the rim
    const currentHour = p.hour(); // 0-23 (military time)
    const numPositions = 24;
    
    p.noStroke();
    for (let i = 0; i < currentHour; i++) {
      // Calculate angle for each of the 24 positions
      const angle = (p.TWO_PI * i) / numPositions - p.HALF_PI; // Start at top (12 o'clock)
      
      // Position on the rim of the mug
      const rimDist = mugRadius * 0.92; // Slightly inside the edge
      const stainX = cx + rimDist * p.cos(angle);
      const stainY = cy + rimDist * p.sin(angle);
      
      // Draw coffee stain (brown, slightly irregular)
      const stainSize = mugRadius * 0.08;
      p.fill(90, 60, 40, 220); // brown coffee stain color
      p.circle(stainX, stainY, stainSize);
      
      // Add a darker center for depth
      p.fill(70, 45, 30, 180);
      p.circle(stainX, stainY, stainSize * 0.6);
      
      // Slight irregularity (small offset circle)
      const offsetX = stainX + (p.noise(i * 0.5) - 0.5) * stainSize * 0.3;
      const offsetY = stainY + (p.noise(i * 0.5 + 10) - 0.5) * stainSize * 0.3;
      p.fill(100, 70, 50, 150);
      p.circle(offsetX, offsetY, stainSize * 0.4);
    }
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
