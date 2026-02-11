// HWK 5: Advertised Season vs Real Snow Presence — narrative visualization (1080×1080)
registerSketch('sk5', function (p) {
  const W = 1080;
  const H = 1080;
  const TARGET_RESORTS = [
    'Park City', 'Crested Butte', 'Zermatt - Matterhorn', 'Sun Peaks', 'Fernie',
    'Panorama', 'Val Gardena', 'Voss', 'Red Mountain Resort-Rossland', 'Les Gets (Les Portes du Soleil)'
  ];
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const RESORT_COLORS = [
    [230, 80, 70],   // red
    [70, 140, 220],  // blue
    [90, 170, 90],   // green
    [220, 160, 60],  // orange
    [150, 90, 180],  // purple
    [220, 100, 120], // pink
    [60, 180, 160],  // teal
    [200, 120, 40],  // brown/orange
    [100, 100, 180], // violet
    [180, 140, 60],  // gold
  ];

  let resortsTable;
  let snowTable;
  let selectedResorts = [];  // { name, lat, lon, season, monthlySnow: [12] }
  let snowGrid = [];         // unique { lat, lon }
  let chartMargins = { top: 120, right: 50, bottom: 160, left: 70 };
  let chartW, chartH, scaleX, scaleY;

  p.preload = function () {
    resortsTable = p.loadTable('data/resorts.csv', 'csv', 'header');
    snowTable = p.loadTable('data/snow.csv', 'csv', 'header');
  };

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function monthFromDateStr(dateStr) {
    if (!dateStr || dateStr === 'Month') return null;
    const m = dateStr.split('-')[1];
    return m ? parseInt(m, 10) : null;
  }

  function buildSnowGrid() {
    const seen = {};
    for (let r = 0; r < snowTable.getRowCount(); r++) {
      const lat = parseFloat(snowTable.getString(r, 'Latitude'));
      const lon = parseFloat(snowTable.getString(r, 'Longitude'));
      if (isNaN(lat) || isNaN(lon)) continue;
      const key = lat + ',' + lon;
      if (!seen[key]) {
        seen[key] = true;
        snowGrid.push({ lat, lon });
      }
    }
  }

  function nearestGridPoint(resortLat, resortLon) {
    let best = snowGrid[0];
    let bestD = Infinity;
    for (let i = 0; i < snowGrid.length; i++) {
      const d = haversineDistance(resortLat, resortLon, snowGrid[i].lat, snowGrid[i].lon);
      if (d < bestD) {
        bestD = d;
        best = snowGrid[i];
      }
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
    for (let m = 1; m <= 12; m++) {
      series.push(byMonth[m] != null ? byMonth[m] : 0);
    }
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
        if (!used[rows[i].name]) {
          used[rows[i].name] = true;
          selected.push(rows[i]);
        }
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
      selectedResorts.push({
        name: resort.name,
        lat: resort.lat,
        lon: resort.lon,
        season: resort.season,
        monthlySnow: monthlySnow,
      });
    });
    chartW = W - chartMargins.left - chartMargins.right;
    chartH = H - chartMargins.top - chartMargins.bottom;
    scaleX = chartW / 11;  // 12 points → 11 segments
    scaleY = chartH / 100; // 0–100
  };

  p.draw = function () {
    p.background(248, 248, 252);
    const left = chartMargins.left;
    const top = chartMargins.top;
    const x0 = left;
    const y0 = top + chartH;

    // Title
    p.fill(30);
    p.textSize(32);
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(p.BOLD);
    p.text('Advertised Season vs Real Snow Presence', W / 2, 28);
    p.textSize(18);
    p.textStyle(p.NORMAL);
    p.fill(80);
    p.text('Monthly snow index (0–100) at 10 ski resorts', W / 2, 72);

    // Y-axis: 0–100
    p.stroke(180);
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
      p.stroke(220);
      p.strokeWeight(1);
      p.line(x0, y, x0 + chartW, y);
      p.noStroke();
    }

    // X-axis: Jan–Dec
    p.textAlign(p.CENTER, p.TOP);
    for (let i = 0; i < 12; i++) {
      const x = x0 + i * scaleX;
      p.fill(60);
      p.text(MONTH_LABELS[i], x + scaleX / 2, y0 + 10);
    }

    // Lines
    selectedResorts.forEach(function (resort, idx) {
      const col = RESORT_COLORS[idx % RESORT_COLORS.length];
      p.stroke(col[0], col[1], col[2]);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (let i = 0; i < 12; i++) {
        const x = x0 + i * scaleX + scaleX / 2;
        const y = y0 - resort.monthlySnow[i] * scaleY;
        p.vertex(x, y);
      }
      p.endShape();
    });

    // Legend below the chart (outside graph area)
    const legY0 = y0 + 48;
    const legRowHeight = 28;
    const legCols = 5;
    const legSwatchW = 36;
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    selectedResorts.forEach(function (resort, idx) {
      const col = RESORT_COLORS[idx % RESORT_COLORS.length];
      const row = Math.floor(idx / legCols);
      const colIdx = idx % legCols;
      const cellW = chartW / legCols;
      const legX = x0 + colIdx * cellW + 8;
      const legY = legY0 + row * legRowHeight;
      p.stroke(col[0], col[1], col[2]);
      p.strokeWeight(2.5);
      p.line(legX, legY, legX + legSwatchW, legY);
      p.noStroke();
      p.fill(40);
      const label = resort.name.length > 22 ? resort.name.substring(0, 20) + '…' : resort.name;
      p.text(label, legX + legSwatchW + 6, legY);
    });
  };

  p.windowResized = function () {
    p.resizeCanvas(W, H);
  };
});
