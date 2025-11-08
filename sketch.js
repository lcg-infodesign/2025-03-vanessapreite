// Margine esterno per non disegnare sui bordi del canvas
let outerMargin = 100;

// Variabile che conterrà i dati caricati dal CSV
let data;

// Variabili globali per i limiti delle scale
let minLon, maxLon, minLat, maxLat, maxValue

function preload() {
  // Carico il file CSV nella cartella "assets"
  // Il terzo parametro ("header") indica che la prima riga del file contiene i nomi delle colonne
  data = loadTable("assets/dataset.csv", "csv", "header");
}

function setup() {
  // Crea un canvas che riempie tutta la finestra del browser
  createCanvas(windowWidth, windowHeight);

  // Stampa i dati in console per verificarne il contenuto
  console.log("data", data);

  // --- DEFINIZIONE DELLE SCALE ---

  // Scala per la longitudine → asse X
  let allLon = data.getColumn("Longitude");
  minLon = min(allLon);
  maxLon = max(allLon);

  // Scala per la latitudine → asse Y
  let allLat = data.getColumn("Latitude");
  minLat = min(allLat);
  maxLat = max(allLat);


}

function draw() {
  // Sfondo nero
  background(10);

  // Variabile per memorizzare il punto su cui il mouse passa sopra
  let hovered = null;

  // --- CICLO PRINCIPALE: disegna un cerchio per ogni riga del dataset ---
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    // Leggo i dati dalle colonne del CSV
    let volcName = data.getString(rowNumber, "Volcano Name");
    let country = data.getString(rowNumber, "Country");
    let location =  data.getString(rowNumber, "Location");
    let lat = data.getNum(rowNumber, "Latitude");
    let lon = data.getNum(rowNumber, "Longitude");
    let el = data.getNum(rowNumber, "Elevation (m)");
    let type = data.getString(rowNumber, "Type");
    let typeCat = data.getString(rowNumber, "TypeCategory");
    let status = data.getString (rowNumber, "Status");
    let erupt = data.getString (rowNumber, "Last Known Eruption");
    

    // Converto le coordinate geografiche in coordinate del canvas
    let x = map(lon, minLon, maxLon, outerMargin, width - outerMargin);
    let y = map(lat, minLat, maxLat, height - outerMargin, outerMargin);


    // Calcolo la distanza dal mouse
    let d = dist(mouseX, mouseY, x, y);

  }

  // --- TOOLTIP ---
  // metto il tooltip alla fine per essere sicuro che sia disegnato sopra a tutto
  if (hovered) {
    // Cambia il cursore in “mano” (interattivo)
    cursor("pointer");

    // Testo del tooltip: mostra paese e valore
    let tooltipText = `${hovered.country}: ${hovered.value}`;
    drawTooltip(hovered.x, hovered.y, tooltipText);
  } else {
    // Torna al cursore normale
    cursor("default");
  }
}


// Funzione per disegnare un tooltip vicino al mouse
function drawTooltip(px, py, textString) {
  textSize(16);
  textAlign(LEFT, CENTER);
  fill("white");
  stroke("black");
  text(textString, px, py);
}