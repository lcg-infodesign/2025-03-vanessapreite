let data;
let maxEl, minEl;
let hovered = null;
let checkboxes = {}; // map TypeCategory → visibilità
let categories = [];

function preload() {
  data = loadTable("assets/dataset.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  textFont("sans-serif");
  noStroke();

  // Calcolo min/max elevazione
  let allEl = data.getColumn("Elevation (m)").map(v => parseFloat(v)).filter(v => !isNaN(v));
  minEl = min(allEl);
  maxEl = max(allEl);
  rectMode(CENTER);

  // ---- Estrai le categorie uniche ----
  let catSet = new Set();
  for (let r = 0; r < data.getRowCount(); r++) {
    let typeCat = data.getString(r, "TypeCategory") || "Other / Unknown";
    catSet.add(typeCat);
  }
  categories = Array.from(catSet).sort();

  // ---- Inizializza checkbox come visibilità ----
  for (let cat of categories) {
    checkboxes[cat] = true;
  }
}

function draw() {
  background(210, 10, 10);
  hovered = null;

  // --- TITOLO ---
  push();
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("Volcanoes of the World", width / 2, 20); // centrato in alto
  pop();

  let n = data.getRowCount();
  let gridCols = 40;
  let gridRows = 25;

  // lasciare spazio in basso per legenda e checkbox
  let canvasTopHeight = height - 150;
  let cellSize = min(width / (gridCols + 4), canvasTopHeight / (gridRows + 4));

  let startX = width / 2 - (gridCols * cellSize) / 2;
  let startY = canvasTopHeight / 2 - (gridRows * cellSize) / 2;

  let idx = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (idx >= n) break;

      let row = data.rows[idx];
      let el = parseFloat(row.getString("Elevation (m)"));
      let name = row.getString("Volcano Name");
      let country = row.getString("Country");
      let type = row.getString("Type");
      let typeCat = row.getString("TypeCategory") || "Other / Unknown";
      let status = row.getString("Status");
      let erupt = row.getString("Last Known Eruption");

      let x = startX + c * cellSize + cellSize / 2;
      let y = startY + r * cellSize + cellSize / 2;

      let visible = checkboxes[typeCat];

      let fillColor;
      if (!visible) fillColor = color(0, 0, 30);
      else if (!isNaN(el)) {
        let cx = gridCols / 2;
        let cy = gridRows / 2;
        let dx = (c - cx) / (gridCols / 2);
        let dy = (r - cy) / (gridRows / 2);
        let distCenter = sqrt(dx * dx + dy * dy);
        distCenter = pow(distCenter, 0.8);
        let shapeFactor = constrain(1 - distCenter, 0, 1);
        let visualEl = lerp(minEl, maxEl, shapeFactor);
        let h = map(visualEl, minEl, maxEl, 200, 0);
        fillColor = color(h, 90, 100);
      } else fillColor = color(0, 0, 30);

      fill(fillColor);
      rect(x, y, cellSize * 0.9, cellSize * 0.9);

      if (
        mouseX > x - cellSize / 2 &&
        mouseX < x + cellSize / 2 &&
        mouseY > y - cellSize / 2 &&
        mouseY < y + cellSize / 2
      ) {
        hovered = { name, country, el, type, typeCat, status, erupt, x, y };
      }

      idx++;
    }
  }

  if (hovered) {
    cursor("pointer");
    drawTooltip(hovered);
  } else {
    cursor("default");
  }

  drawLegendAndCheckboxes(canvasTopHeight);
}

// Tooltip invariato
function drawTooltip(h) {
  push();
  let padding = 12;
  let boxWidth = 280;
  textSize(14);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  fill(255);

  let infoLines = [
    `${h.name} (${h.country})`,
    `Elevation: ${!isNaN(h.el) ? h.el + " m" : "N/A"}`,
    `Type: ${h.type}`,
    `Category: ${h.typeCat}`,
    `Status: ${h.status}`,
    `Last eruption: ${h.erupt}`
  ];

  let wrappedLines = [];
  for (let line of infoLines) {
    if (textWidth(line) < boxWidth - padding * 2) wrappedLines.push(line);
    else {
      let words = line.split(" ");
      let current = "";
      for (let w of words) {
        let testLine = current + w + " ";
        if (textWidth(testLine) < boxWidth - padding * 2) current = testLine;
        else { wrappedLines.push(current.trim()); current = w + " "; }
      }
      if (current.trim() !== "") wrappedLines.push(current.trim());
    }
  }

  let lineHeight = 18;
  let boxHeight = wrappedLines.length * lineHeight + padding * 2;

  let boxX = h.x + 15;
  let boxY = h.y - boxHeight - 10;
  if (boxX + boxWidth > width - 20) boxX = width - boxWidth - 20;
  if (boxX < 20) boxX = 20;
  if (boxY < 20) boxY = h.y + 20;

  rectMode(CORNER);
  fill(0, 200);
  stroke(255);
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 8);

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  let yText = boxY + padding;
  for (let i = 0; i < wrappedLines.length; i++) {
    if (i === 0) textStyle(BOLD); else textStyle(NORMAL);
    text(wrappedLines[i], boxX + padding, yText);
    yText += lineHeight;
  }
  pop();
}

// Legenda + checkbox in riga, tick centrato dentro
function drawLegendAndCheckboxes(yBase) {
  let spacing = 20;

  // ---- AREA LEGENDA ----
  let legendWidth = 250;
  let legendX = spacing;
  let legendY = yBase;

  push();
  translate(legendX, legendY);
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Elevation (m)", 10, 10);

  let gradWidth = legendWidth - 40;
  for (let i = 0; i < gradWidth; i++) {
    let inter = map(i, 0, gradWidth, 0, 1);
    let h = map(inter, 0, 1, 200, 0);
    fill(h, 90, 100);
    rect(10 + i, 40, 1, 15);
  }

  fill(255);
  textSize(12);
  textAlign(LEFT);
  text("Low", 10, 60);
  textAlign(RIGHT);
  text("High", 10 + gradWidth, 60);

  fill(0, 0, 30);
  rect(10 + gradWidth + 20, 47.5, 15, 15, 3);
  fill(255);
  textAlign(LEFT, CENTER);
  text("No data", 10 + gradWidth + 40, 47.5);
  pop();

  // ---- CHECKBOX SU UN’UNICA RIGA ----
  let startX = legendX + 10;
  let checkboxY = yBase + 90;
  let x = startX;

  textSize(12);
  textAlign(LEFT, CENTER);

  for (let cat of categories) {
    // quadrato checkbox
    let boxSize = 16;
    stroke(255);
    strokeWeight(1.5);
    fill(0, 0, 20);
    rectMode(CORNER);
    rect(x, checkboxY, boxSize, boxSize, 3);

    // tick dentro al quadrato, centrato perfettamente
    if (checkboxes[cat]) {
      stroke(255);
      strokeWeight(2);
      noFill();
      // disegna un ✓ stilizzato con due linee
      line(x + 3, checkboxY + boxSize / 2, x + boxSize / 2 - 1, checkboxY + boxSize - 3);
      line(x + boxSize / 2 - 1, checkboxY + boxSize - 3, x + boxSize - 3, checkboxY + 3);
    }

    // testo accanto
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    text(cat, x + boxSize + 8, checkboxY + boxSize / 2);

    // aggiorna posizione orizzontale
    x += textWidth(cat) + 60;
  }
}

// Gestione click interattiva
function mousePressed() {
  let legendX = 20;
  let checkboxY = height - 60;
  let startX = legendX + 10;
  let x = startX;
  let boxSize = 16;
  textSize(12);

  for (let cat of categories) {
    if (
      mouseX > x && mouseX < x + boxSize &&
      mouseY > checkboxY && mouseY < checkboxY + boxSize
    ) {
      checkboxes[cat] = !checkboxes[cat];
    }
    x += textWidth(cat) + 60;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
