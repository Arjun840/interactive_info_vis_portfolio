// HWK 5: Does the Snowfall of Resorts Match Their Advertised Season Length? (1080×1080, self-contained)
registerSketch('sk5', function (p) {
  const W = 1080;
  const H = 1080;
  const TARGET_RESORTS = [
    'Park City', 'Crested Butte', 'Zermatt - Matterhorn', 'Sun Peaks', 'Fernie',
    'Panorama', 'Val Gardena', 'Voss', 'Red Mountain Resort-Rossland', 'Les Gets (Les Portes du Soleil)'
  ];
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const RESORT_COLORS = [
    [230, 80, 70], [70, 140, 220], [90, 170, 90], [220, 160, 60], [150, 90, 180],
    [220, 100, 120], [60, 180, 160], [200, 120, 40], [100, 100, 180], [180, 140, 60],
  ];
  const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const MONTH_ABBREV = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  let resortsTable, snowTable;
  let selectedResorts = [];
  let snowGrid = [];
  let annotationResortIdx = null;  // resort with low snow at season start (opens before reliable snow)
  let zermattResortIdx = null;     // Zermatt - Matterhorn (year-round, open May–Oct with little snow)
  let highlightedResortIdx = null; // hover/click highlight
  let chartMargins = { top: 140, right: 50, bottom: 160, left: 70 };
  let chartW, chartH, scaleX, scaleY;

  p.preload = function () {
    resortsTable = p.loadTable('data/resorts.csv', 'csv', 'header');
    snowTable = p.loadTable('data/snow.csv', 'csv', 'header');
  };

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function monthFromDateStr(dateStr) {
    if (!dateStr || dateStr === 'Month') return null;
    const m = dateStr.split('-')[1];
    return m ? parseInt(m, 10) : null;
  }

  function parseMonthName(s) {
    if (!s || typeof s !== 'string') return null;
    const t = s.trim().toLowerCase();
    for (let i = 0; i < 12; i++) {
      if (MONTH_NAMES[i].indexOf(t) === 0 || MONTH_ABBREV[i].indexOf(t) === 0) return i + 1;
    }
    return null;
  }

  function parseSeason(seasonStr) {
    if (!seasonStr || !seasonStr.trim()) return { start: 1, end: 12, wraps: false };
    const lower = seasonStr.trim().toLowerCase();
    if (lower === 'year-round' || lower === 'year round') return { start: 1, end: 12, wraps: false };
    const parts = seasonStr.split(/\s*[-–—]\s*/);
    if (parts.length < 2) return { start: 1, end: 12, wraps: false };
    const start = parseMonthName(parts[0].trim());
    const end = parseMonthName(parts[parts.length - 1].trim());
    if (start == null || end == null) return { start: 1, end: 12, wraps: false };
    return { start, end, wraps: start > end };
  }

  function buildSnowGrid() {
    const seen = {};
    for (let r = 0; r < snowTable.getRowCount(); r++) {
      const lat = parseFloat(snowTable.getString(r, 'Latitude'));
      const lon = parseFloat(snowTable.getString(r, 'Longitude'));
      if (isNaN(lat) || isNaN(lon)) continue;
      const key = lat + ',' + lon;
      if (!seen[key]) { seen[key] = true; snowGrid.push({ lat, lon }); }
    }
  }

  function nearestGridPoint(resortLat, resortLon) {
    let best = snowGrid[0];
    let bestD = Infinity;
    for (let i = 0; i < snowGrid.length; i++) {
      const d = haversineDistance(resortLat, resortLon, snowGrid[i].lat, snowGrid[i].lon);
      if (d < bestD) { bestD = d; best = snowGrid[i]; }
    }
    return best;
  }

  function getMonthlySnowAtGrid(gridLat, gridLon) {
    const byMonth = {};
    for (let r = 0; r < snowTable.getRowCount(); r++) {
      const lat = parseFloat(snowTable.getString(r, 'Latitude'));
      const lon = parseFloat(snowTable.getString(r, 'Longitude'));
      if (lat !== gridLat || lon !== gridLon) continue;
      const month = monthFromDateStr(snowTable.getString(r, 'Month'));
      if (month == null) continue;
      const snow = parseFloat(snowTable.getString(r, 'Snow'));
      if (!isNaN(snow)) byMonth[month] = snow;
    }
    const series = [];
    for (let m = 1; m <= 12; m++) series.push(byMonth[m] != null ? byMonth[m] : 0);
    return series;
  }

  function selectResorts() {
    const rows = [];
    for (let r = 0; r < resortsTable.getRowCount(); r++) {
      const name = resortsTable.getString(r, 'Resort');
      const lat = parseFloat(resortsTable.getString(r, 'Latitude'));
      const lon = parseFloat(resortsTable.getString(r, 'Longitude'));
      const season = resortsTable.getString(r, 'Season') || '';
      if (!name || isNaN(lat) || isNaN(lon)) continue;
      rows.push({ name, lat, lon, season });
    }
    const byName = {};
    rows.forEach(function (row) { byName[row.name] = row; });
    const selected = [];
    for (let i = 0; i < TARGET_RESORTS.length; i++) {
      const r = byName[TARGET_RESORTS[i]];
      if (r) selected.push(r);
    }
    if (selected.length < 10) {
      const used = {};
      selected.forEach(function (r) { used[r.name] = true; });
      for (let i = 0; i < rows.length && selected.length < 10; i++) {
        if (!used[rows[i].name]) { used[rows[i].name] = true; selected.push(rows[i]); }
      }
    }
    return selected;
  }

  p.setup = function () {
    p.createCanvas(W, H);
    p.textFont('Georgia');
    buildSnowGrid();
    const chosen = selectResorts();
    chosen.forEach(function (resort) {
      const grid = nearestGridPoint(resort.lat, resort.lon);
      const monthlySnow = getMonthlySnowAtGrid(grid.lat, grid.lon);
      const parsed = parseSeason(resort.season);
      selectedResorts.push({
        name: resort.name,
        lat: resort.lat, lon: resort.lon,
        season: resort.season,
        monthlySnow,
        seasonStart: parsed.start, seasonEnd: parsed.end, seasonWraps: parsed.wraps,
      });
    });

    // Pick resort with lowest snow at season start (Nov/Dec) — annotation only if low snow
    let bestIdx = null;
    let bestSnow = 60;
    for (let i = 0; i < selectedResorts.length; i++) {
      const r = selectedResorts[i];
      const startM = r.seasonStart - 1;
      const snow = r.monthlySnow[startM];
      if (snow < bestSnow && snow < 50) { bestSnow = snow; bestIdx = i; }
    }
    annotationResortIdx = bestIdx;

    const zermattIdx = selectedResorts.findIndex(function (r) { return r.name === 'Zermatt - Matterhorn'; });
    zermattResortIdx = zermattIdx >= 0 ? zermattIdx : null;

    chartW = W - chartMargins.left - chartMargins.right;
    chartH = H - chartMargins.top - chartMargins.bottom;
    scaleX = chartW / 12;
    scaleY = chartH / 100;
  };

  function getLegendHitIdx() {
    const legY0 = chartMargins.top + chartH + 48;
    const legRowHeight = 26;
    const legCols = 5;
    const cellW = chartW / legCols;
    const left = chartMargins.left;
    for (let idx = 0; idx < selectedResorts.length; idx++) {
      const row = Math.floor(idx / legCols);
      const colIdx = idx % legCols;
      const rx = left + colIdx * cellW;
      const ry = legY0 + row * legRowHeight - 12;
      const rw = cellW;
      const rh = legRowHeight;
      if (p.mouseX >= rx && p.mouseX < rx + rw && p.mouseY >= ry && p.mouseY < ry + rh)
        return idx;
    }
    return null;
  }

  p.mouseMoved = function () {
    highlightedResortIdx = getLegendHitIdx();
  };

  p.mousePressed = function () {
    const hit = getLegendHitIdx();
    if (hit != null) highlightedResortIdx = highlightedResortIdx === hit ? null : hit;
  };

  p.draw = function () {
    p.background(248, 248, 252);
    const left = chartMargins.left;
    const top = chartMargins.top;
    const x0 = left;
    const y0 = top + chartH;

    // Title
    p.fill(30);
    p.textSize(28);
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(p.BOLD);
    p.text('Does the Snowfall of Resorts Match Their Advertised Season Length?', W / 2, 20);
    p.textSize(14);
    p.textStyle(p.NORMAL);
    p.fill(80);
    p.text('Monthly snow levels compared with advertised ski seasons show that some resorts open before consistent snow or close while snow still remains.', W / 2, 58);
    p.textSize(11);
    p.fill(100);
    p.text('Gray band: typical advertised season (Nov–Apr)', W / 2, 92);

    // Y-axis
    p.stroke(200);
    p.strokeWeight(1);
    p.line(x0, top, x0, y0);
    p.line(x0, y0, x0 + chartW, y0);
    p.noStroke();
    p.fill(60);
    p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER);
    for (let v = 0; v <= 100; v += 20) {
      const y = y0 - v * scaleY;
      p.text(String(v), x0 - 8, y);
      p.stroke(238);
      p.strokeWeight(1);
      p.line(x0, y, x0 + chartW, y);
      p.noStroke();
    }
    // Y-axis label
    p.push();
    p.translate(x0 - 38, top + chartH / 2);
    p.rotate(-p.HALF_PI);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(13);
    p.fill(50);
    p.text('Percent Snow Coverage', 0, 0);
    p.pop();

    // X-axis: Jan–Dec
    p.textAlign(p.CENTER, p.TOP);
    for (let i = 0; i < 12; i++) {
      const x = x0 + i * scaleX + scaleX / 2;
      p.fill(60);
      p.text(MONTH_LABELS[i], x, y0 + 10);
    }
    // X-axis label
    p.textSize(13);
    p.fill(50);
    p.text('Month', x0 + chartW / 2, y0 + 28);

    // Advertised season band (Nov–Apr wrap-around)
    p.noStroke();
    p.fill(200, 200, 210, 38);
    p.rect(x0 + 10 * scaleX, top, chartW - 10 * scaleX, chartH);
    p.rect(x0, top, 4 * scaleX, chartH);

    // Lines
    const dimAlpha = highlightedResortIdx != null ? 55 : 255;
    const dimWeight = highlightedResortIdx != null ? 1 : 2;
    const highlightWeight = 3.5;
    selectedResorts.forEach(function (resort, idx) {
      const col = RESORT_COLORS[idx % RESORT_COLORS.length];
      const isHighlight = highlightedResortIdx === idx;
      p.stroke(col[0], col[1], col[2], isHighlight ? 255 : dimAlpha);
      p.strokeWeight(isHighlight ? highlightWeight : dimWeight);
      p.noFill();
      p.beginShape();
      for (let i = 0; i < 12; i++) {
        const x = x0 + i * scaleX + scaleX / 2;
        const y = y0 - resort.monthlySnow[i] * scaleY;
        p.vertex(x, y);
      }
      p.endShape();
    });

    // One annotation: resort with low snow at season start
    if (annotationResortIdx != null) {
      const r = selectedResorts[annotationResortIdx];
      const col = RESORT_COLORS[annotationResortIdx % RESORT_COLORS.length];
      const startM = r.seasonStart - 1;
      const mx = x0 + startM * scaleX + scaleX / 2;
      const my = y0 - r.monthlySnow[startM] * scaleY;
      const label = 'This resort opens weeks before reliable snow coverage.';
      const pad = 10;
      const tw = p.textWidth(label) + pad * 2;
      const th = 22;
      const ty = my - 28;
      let tx = mx;
      tx = p.constrain(tx, x0 + tw / 2 + 4, x0 + chartW - tw / 2 - 4);
      p.fill(255, 255, 250);
      p.stroke(col[0], col[1], col[2]);
      p.strokeWeight(1);
      p.rect(tx - tw / 2, ty - th, tw, th, 4);
      p.line(mx, my, p.constrain(tx, mx - 50, mx + 50), ty);
      p.noStroke();
      p.fill(50);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, tx, ty - th / 2);
    }

    // Zermatt annotation: open May–Oct with almost no snow (above the line to clear the key)
    if (zermattResortIdx != null) {
      const r = selectedResorts[zermattResortIdx];
      const col = RESORT_COLORS[zermattResortIdx % RESORT_COLORS.length];
      const monthIdx = 6; // July (center of May–Oct)
      const mx = x0 + monthIdx * scaleX + scaleX / 2;
      const my = y0 - r.monthlySnow[monthIdx] * scaleY;
      const label = 'Open May–Oct with almost no snow';
      const pad = 10;
      const tw = p.textWidth(label) + pad * 2;
      const th = 22;
      const ty = my - th - 14; // box above the line
      let tx = mx;
      tx = p.constrain(tx, x0 + tw / 2 + 4, x0 + chartW - tw / 2 - 4);
      p.fill(255, 255, 250);
      p.stroke(col[0], col[1], col[2]);
      p.strokeWeight(1);
      p.rect(tx - tw / 2, ty, tw, th, 4);
      p.line(mx, my, p.constrain(tx, mx - 50, mx + 50), ty + th);
      p.noStroke();
      p.fill(50);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, tx, ty + th / 2);
    }

    // Legend
    const legY0 = y0 + 48;
    const legRowHeight = 26;
    const legCols = 5;
    const legSwatchW = 32;
    p.textSize(11);
    p.textAlign(p.LEFT, p.CENTER);
    selectedResorts.forEach(function (resort, idx) {
      const col = RESORT_COLORS[idx % RESORT_COLORS.length];
      const row = Math.floor(idx / legCols);
      const colIdx = idx % legCols;
      const cellW = chartW / legCols;
      const legX = x0 + colIdx * cellW + 6;
      const legY = legY0 + row * legRowHeight;
      const isHighlight = highlightedResortIdx === idx;
      p.stroke(col[0], col[1], col[2]);
      p.strokeWeight(isHighlight ? 3 : 2);
      p.line(legX, legY, legX + legSwatchW, legY);
      p.noStroke();
      p.fill(isHighlight ? 20 : 45);
      const seasonStr = (resort.seasonStart === 1 && resort.seasonEnd === 12)
        ? 'Year-round'
        : MONTH_LABELS[resort.seasonStart - 1] + '–' + MONTH_LABELS[resort.seasonEnd - 1];
      const namePart = resort.name.length > 14 ? resort.name.substring(0, 12) + '…' : resort.name;
      p.text(namePart + ' (' + seasonStr + ')', legX + legSwatchW + 5, legY);
    });
  };

  p.windowResized = function () { p.resizeCanvas(W, H); };
});
