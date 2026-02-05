// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  // Track bubble state for seconds feature
  let currentBubbleSecond = -1;
  let bubbleX = 0;
  let bubbleY = 0;

  // Foam particles for stirring interaction
  let foamParticles = [];
  let lastMinute = -1;

  // Ripples for click interaction
  const ripples = [];

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function createFoamParticles(cx, cy, mugRadius, numParticles) {
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const n1 = p.noise(i * 0.37, 0);
      const n2 = p.noise(i * 0.73 + 100, 0);
      const angle = n1 * p.TWO_PI;
      const dist = n2 * mugRadius * 0.80;
      particles.push({
        x: cx + dist * p.cos(angle),
        y: cy + dist * p.sin(angle),
        baseX: cx + dist * p.cos(angle), // Original position
        baseY: cy + dist * p.sin(angle),
        size: p.lerp(mugRadius * 0.10, mugRadius * 0.18, p.noise(i * 0.5 + 200, 0)),
        colorR: p.lerp(245, 255, p.noise(i * 0.3 + 300, 0)),
        colorG: p.lerp(235, 250, p.noise(i * 0.3 + 300, 0)),
        colorB: p.lerp(220, 240, p.noise(i * 0.3 + 300, 0)),
        alpha: p.lerp(200, 255, p.noise(i * 0.4 + 400, 0)),
        hasHighlight: p.noise(i * 0.6 + 500, 0) > 0.35
      });
    }
    return particles;
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
    
    // White cup handle (top-down view, outside the white plate circle)
    p.noStroke();
    p.fill(255, 255, 255, 250); // White, matching the plate
    const handleX = cx + plateRadius * 1.1; // Position outside the white plate
    const handleY = cy;
    const handleWidth = plateRadius * 0.3;
    const handleHeight = plateRadius * 0.4;
    
    // Simple curved handle shape (ellipse from top-down view)
    p.ellipse(handleX, handleY, handleWidth * 2, handleHeight * 2);
    
    // Inner opening to create the handle shape
    p.fill(139, 90, 43); // Brown background color (wooden table)
    p.ellipse(handleX - handleWidth * 0.2, handleY, handleWidth * 1.2, handleHeight * 1.4);
    
    // Minutes: Dissipating foam layer (particle system)
    const currentMinute = p.minute(); // 0-59
    // Map minutes: 0 = 100% foam (max particles), 59 = 5% foam (95% gone)
    const maxParticles = 200;
    const minParticles = Math.floor(maxParticles * 0.05);
    const numParticles = Math.floor(p.map(currentMinute, 0, 59, maxParticles, minParticles));
    
    // Recreate particles if minute changed
    if (currentMinute !== lastMinute) {
      foamParticles = createFoamParticles(cx, cy, mugRadius, maxParticles);
      lastMinute = currentMinute;
    }
    
    // Stirring interaction: apply rotational force when mouse is pressed
    if (p.mouseIsPressed) {
      const stirRadius = mugRadius * 1.2; // Influence radius
      const distToMouse = p.dist(p.mouseX, p.mouseY, cx, cy);
      
      if (distToMouse < stirRadius) {
        // Apply rotational force to nearby particles
        for (let i = 0; i < foamParticles.length && i < numParticles; i++) {
          const part = foamParticles[i];
          const distToParticle = p.dist(p.mouseX, p.mouseY, part.x, part.y);
          
          if (distToParticle < stirRadius * 0.6) {
            // Calculate angle from mouse to particle
            const angleToParticle = p.atan2(part.y - p.mouseY, part.x - p.mouseX);
            // Apply rotational force (perpendicular to radius)
            const force = (1 - distToParticle / (stirRadius * 0.6)) * 2.5;
            const rotAngle = angleToParticle + p.HALF_PI; // Perpendicular direction
            
            part.x += p.cos(rotAngle) * force;
            part.y += p.sin(rotAngle) * force;
            
            // Keep particles within mug bounds
            const distFromCenter = p.dist(part.x, part.y, cx, cy);
            if (distFromCenter > mugRadius * 0.85) {
              const angle = p.atan2(part.y - cy, part.x - cx);
              part.x = cx + mugRadius * 0.85 * p.cos(angle);
              part.y = cy + mugRadius * 0.85 * p.sin(angle);
            }
          }
        }
      }
    } else {
      // Gradually return particles to base positions when not stirring
      for (let i = 0; i < foamParticles.length && i < numParticles; i++) {
        const part = foamParticles[i];
        part.x = p.lerp(part.x, part.baseX, 0.05);
        part.y = p.lerp(part.y, part.baseY, 0.05);
      }
    }
    
    // Draw foam particles
    p.noStroke();
    for (let i = 0; i < foamParticles.length && i < numParticles; i++) {
      const part = foamParticles[i];
      p.fill(part.colorR, part.colorG, part.colorB, part.alpha);
      p.circle(part.x, part.y, part.size);
      
      if (part.hasHighlight) {
        p.fill(255, 255, 250, part.alpha * 0.6);
        p.circle(part.x - part.size * 0.2, part.y - part.size * 0.2, part.size * 0.5);
      }
    }
    
    // Draw ripples
    const now = p.millis();
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      const age = (now - ripple.startTime) / 1000; // seconds
      
      if (age > 1.0) {
        ripples.splice(i, 1);
        continue;
      }
      
      const radius = age * 80;
      const alpha = (1 - age) * 120;
      
      p.noFill();
      p.stroke(255, 255, 255, alpha);
      p.strokeWeight(2);
      p.circle(ripple.x, ripple.y, radius * 2);
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
  p.mousePressed = function () {
    // Create ripple at mouse position when clicked
    const cx = p.width / 2;
    const cy = p.height / 2;
    const mugRadius = p.min(p.width, p.height) * 0.25 * 0.75;
    const distToMug = p.dist(p.mouseX, p.mouseY, cx, cy);
    
    // Only create ripple if click is within or near the mug
    if (distToMug < mugRadius * 1.5) {
      ripples.push({
        x: p.mouseX,
        y: p.mouseY,
        startTime: p.millis()
      });
    }
  };

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
