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
    
    // Minutes: Dissipating foam layer (fog-like overlay)
    const currentMinute = p.minute(); // 0-59
    const currentSecond = p.second();
    // Use a smooth minute+second value so change is continuous over time
    const minuteProgress = currentMinute + currentSecond / 60;
    // Map minutes: 0 = 100% foam opacity, 59 = 5% foam opacity (95% gone)
    const foamOpacity = p.map(minuteProgress, 0, 59, 0.95, 0.05);
    const foamAlpha = Math.floor(foamOpacity * 200); // Max opacity of 200 for fog effect
    
    if (foamAlpha > 5) { // Only draw if there's visible foam
      p.push();
      p.noStroke();
      
      // Create fog-like effect with multiple semi-transparent layers
      // Base fog layer
      p.fill(250, 245, 235, foamAlpha);
      p.circle(cx, cy, mugRadius * 1.9);
      
      // Additional fog layers with noise for organic texture
      const noiseScale = 0.15;
      const step = 4;
      for (let y = cy - mugRadius * 0.9; y < cy + mugRadius * 0.9; y += step) {
        for (let x = cx - mugRadius * 0.9; x < cx + mugRadius * 0.9; x += step) {
          const dist = p.dist(x, y, cx, cy);
          if (dist < mugRadius * 0.85) {
            // Use noise to create foggy texture
            const n = p.noise(x * noiseScale, y * noiseScale, minuteProgress * 0.1);
            if (n > 0.4) { // Only draw where noise is above threshold
              const localAlpha = foamAlpha * (n - 0.4) * 1.67; // Scale to 0-1 range
              p.fill(255, 250, 240, localAlpha * 0.6);
              p.circle(x, y, step * 1.5);
            }
          }
        }
      }
      
      // Top layer - lighter fog wisps
      for (let i = 0; i < 15; i++) {
        const n1 = p.noise(i * 0.5, minuteProgress * 0.05);
        const n2 = p.noise(i * 0.5 + 50, minuteProgress * 0.05);
        const angle = n1 * p.TWO_PI;
        const dist = n2 * mugRadius * 0.7;
        const wispX = cx + dist * p.cos(angle);
        const wispY = cy + dist * p.sin(angle);
        const wispSize = mugRadius * p.lerp(0.15, 0.35, n2);
        p.fill(255, 255, 250, foamAlpha * 0.4);
        p.circle(wispX, wispY, wispSize);
      }
      
      p.pop();
    }
    
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
      const stainSize = mugRadius * 0.11;
      p.fill(200, 170, 120, 240); // lighter coffee stain color for visibility
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
