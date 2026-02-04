// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  // Track bubble state for seconds feature
  let currentBubbleSecond = -1;
  let bubbleX = 0;
  let bubbleY = 0;

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Helvetica');
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
    // Map minutes: 0 = 100% foam coverage, 59 = 5% foam coverage (95% gone)
    // At 0 minutes: 100% covered, at 50 minutes: ~15% remaining, at 59 minutes: 5% remaining
    const foamCoverage = p.map(currentMinute, 0, 59, 1.0, 0.05);
    const foamAlpha = Math.floor(foamCoverage * 180); // Max opacity for fog effect
    
    if (foamAlpha > 3) { // Only draw if there's visible foam
      p.push();
      p.noStroke();
      
      // Base fog layer - semi-transparent cream covering the coffee
      p.fill(250, 245, 235, foamAlpha);
      p.circle(cx, cy, mugRadius * 1.9);
      
      // Additional fog texture using noise for organic misty appearance
      const noiseScale = 0.12;
      const step = 3;
      const coverageRadius = mugRadius * 0.88 * foamCoverage; // Shrinking coverage area
      
      for (let y = cy - mugRadius * 0.9; y < cy + mugRadius * 0.9; y += step) {
        for (let x = cx - mugRadius * 0.9; x < cx + mugRadius * 0.9; x += step) {
          const dist = p.dist(x, y, cx, cy);
          if (dist < coverageRadius) {
            // Use noise to create foggy texture
            const n = p.noise(x * noiseScale, y * noiseScale);
            if (n > 0.35) { // Only draw where noise is above threshold
              const localAlpha = foamAlpha * (n - 0.35) * 1.54; // Scale to 0-1 range
              p.fill(255, 250, 240, localAlpha * 0.7);
              p.circle(x, y, step * 2);
            }
          }
        }
      }
      
      // Top layer - lighter fog wisps for depth
      const numWisps = Math.floor(12 * foamCoverage);
      for (let i = 0; i < numWisps; i++) {
        const n1 = p.noise(i * 0.5, 0);
        const n2 = p.noise(i * 0.5 + 50, 0);
        const angle = n1 * p.TWO_PI;
        const dist = n2 * coverageRadius * 0.8;
        const wispX = cx + dist * p.cos(angle);
        const wispY = cy + dist * p.sin(angle);
        const wispSize = mugRadius * p.lerp(0.12, 0.28, n2);
        p.fill(255, 255, 250, foamAlpha * 0.5);
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
    
    // Seconds: Bubble feature - one bubble per second that pops when second changes
    const s = p.second();
    const h = p.hour();
    const m = p.minute();
    
    // When second changes, create a new bubble at random position
    if (s !== currentBubbleSecond) {
      currentBubbleSecond = s;
      // Random position within the coffee mug (not too close to edges)
      const angle = p.random(0, p.TWO_PI);
      const dist = p.random(0, mugRadius * 0.65);
      bubbleX = cx + dist * p.cos(angle);
      bubbleY = cy + dist * p.sin(angle);
    }
    
    // Draw the bubble (shiny, translucent circle)
    if (currentBubbleSecond === s) {
      p.push();
      const bubbleSize = mugRadius * 0.12;
      
      // Main bubble - translucent with slight blue tint
      p.noStroke();
      p.fill(200, 220, 240, 120);
      p.circle(bubbleX, bubbleY, bubbleSize);
      
      // Shiny highlight on top-left
      p.fill(255, 255, 255, 180);
      p.circle(bubbleX - bubbleSize * 0.25, bubbleY - bubbleSize * 0.25, bubbleSize * 0.4);
      
      // Outer glow
      p.fill(180, 210, 230, 60);
      p.circle(bubbleX, bubbleY, bubbleSize * 1.3);
      
      p.pop();
    }
    
    // Digital time at the top (drawn last so it's on top)
    const timeStr = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;

    p.noStroke();
    p.fill(240, 235, 220);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(28);
    p.text(timeStr, p.width / 2, 22);
  };
  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
