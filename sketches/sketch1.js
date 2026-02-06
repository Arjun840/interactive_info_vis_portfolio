// Instance-mode sketch registered as 'sk1'
registerSketch('sk1', function (p) {
  let horizon;

  p.setup = function () {
    // size to the full window so canvas always matches the viewport
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    horizon = p.height / 2;
  };

  p.draw = function () {
    horizon = p.height / 2;
    
    // Get current time
    const currentHour = p.hour(); // 0-23
    const currentMinute = p.minute(); // 0-59
    
    // Map time to sun position
    // 6 AM (6) = top of sky, 6 PM (18) = horizon, 12 AM (0) = below horizon
    // For 5:13 PM (17:13), sun should be low in the sky
    let sunHeight;
    if (currentHour >= 6 && currentHour < 18) {
      // Daytime: sun moves from top (6 AM) to horizon (6 PM)
      const hourProgress = (currentHour - 6 + currentMinute / 60) / 12; // 0 to 1
      sunHeight = p.map(hourProgress, 0, 1, p.height * 0.1, horizon);
    } else {
      // Nighttime: sun below horizon
      sunHeight = horizon + 50;
    }
    
    // Background color based on sun position
    if (sunHeight < horizon) p.background('lightblue');
    else p.background('grey');

    p.fill('orange');
    p.ellipse(p.width / 2, sunHeight, 100, 100);
    
    // Display current time
    p.textSize(20);
    p.fill('black');
    const timeString = p.nf(currentHour % 12 || 12, 2) + ':' + p.nf(currentMinute, 2) + (currentHour >= 12 ? ' PM' : ' AM');
    p.text(timeString, p.width / 2 - 50, sunHeight - 80);
    
    p.fill('sandybrown');
    p.rect(0, horizon, p.width, p.height);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    horizon = p.height / 2;
  };
});

