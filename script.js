import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

function showMessage(text, type) {
  const sb = document.getElementById("snackbar");
  sb.textContent = text;
  sb.className = `${type} show`;
  setTimeout(() => (sb.className = ""), 3000);
}

// === Registrierung & Login ===
document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const name = document.getElementById("name").value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: window.location.href }
  });

  showMessage(
    error ? "Registrierung fehlgeschlagen: " + error.message : "Registrierung erfolgreich! Bitte E-Mail bestätigen.",
    error ? "error" : "success"
  );
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage("Login fehlgeschlagen: " + error.message, "error");
  } else {
    showMessage("Login erfolgreich!", "success");
    setTimeout(() => {
      document.getElementById("startscreen").classList.remove("hidden");
      document.querySelector(".container").classList.add("hidden");
      loadFilterOptions();
    }, 1000);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// === Admin Login ===
const adminCredentials = { username: "admin", password: "geheim123" };

document.getElementById("gotoAdminBtn").addEventListener("click", () => {
  document.getElementById("startscreen").classList.add("hidden");
  document.getElementById("adminLoginSection").classList.remove("hidden");
});

document.getElementById("adminLoginBtn").addEventListener("click", () => {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === adminCredentials.username && pass === adminCredentials.password) {
    document.getElementById("adminLoginSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    showMessage("Admin eingeloggt", "success");
    loadAdminIconGrids();
  } else {
    showMessage("Falsche Admin-Daten", "error");
  }
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("adminLoginSection").classList.add("hidden");
  document.querySelector(".container").classList.remove("hidden");
  showMessage("Admin abgemeldet", "success");
});

// === Icon Grid Utilitys ===
function fillIconGrid(containerId, items, labelFn = x => x.name, multiple = true) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  items.forEach(it => {
    const div = document.createElement("div");
    div.className = "icon";
    div.dataset.id = it.id;
    div.innerHTML = `${it.icon || "❓"}<br><span>${labelFn(it)}</span>`;
    grid.appendChild(div);
  });

  grid.addEventListener("click", e => {
    const el = e.target.closest(".icon");
    if (!el) return;
    if (multiple) {
      el.classList.toggle("selected");
    } else {
      grid.querySelectorAll(".icon").forEach(icon => icon.classList.remove("selected"));
      el.classList.add("selected");
    }
  });
}

function getSelectedMultipleIds(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .icon.selected`)).map(el =>
    Number(el.dataset.id)
  );
}

function getSelectedSingleId(containerId) {
  const el = document.querySelector(`#${containerId} .icon.selected`);
  return el ? Number(el.dataset.id) : null;
}

// === Admin: Icons laden ===
async function loadAdminIconGrids() {
  const [abschluesse, interessen, faecher] = await Promise.all([
    supabase.from("abschluesse").select("*").then(r => r.data || []),
    supabase.from("interessen").select("*").then(r => r.data || []),
    supabase.from("faecher").select("*").then(r => r.data || [])
  ]);

  fillIconGrid("abschlussIconsAdmin", abschluesse, x => x.name, false);
  fillIconGrid("interessenIconsAdmin", interessen);
  fillIconGrid("faecherIconsAdmin", faecher);
}

// === Admin: Beruf speichern ===
document.getElementById("addBerufBtn").addEventListener("click", async () => {
  const berufsbezeichnung = document.getElementById("berufsbezeichnung").value;
  const beschreibung = document.getElementById("beschreibung").value;
  const anforderungen = document.getElementById("anforderungen").value;
  const verdienst = parseInt(document.getElementById("verdienst").value);
  const einsatzorte = document.getElementById("einsatzorte").value;

  const abschluss_id = getSelectedSingleId("abschlussIconsAdmin");
  const interessen_ids = getSelectedMultipleIds("interessenIconsAdmin");
  const faecher_ids = getSelectedMultipleIds("faecherIconsAdmin");

  if (!beschreibung || !abschluss_id) {
    showMessage("Bitte mindestens Beschreibung und Abschluss wählen", "error");
    return;
  }

  const { error } = await supabase.from("ausbildungsberufe").insert({
    berufsbezeichnung,
    beschreibung,
    anforderungen,
    verdienst,
    einsatzorte,
    abschluss_id,
    interessen_ids,
    faecher_ids
  });

  if (error) {
    showMessage("Fehler: " + error.message, "error");
  } else {
    showMessage("Beruf gespeichert", "success");
    document.getElementById("berufsbezeichnung").value = "";
    document.getElementById("beschreibung").value = "";
    document.getElementById("anforderungen").value = "";
    document.getElementById("verdienst").value = "";
    document.getElementById("einsatzorte").value = "";
    document.querySelectorAll("#adminPanel .icon.selected").forEach(el => el.classList.remove("selected"));
  }
});

// === Benutzer: Filter laden & anzeigen ===
async function loadFilterOptions() {
  const [interessen, abschluesse, faecher] = await Promise.all([
    supabase.from("interessen").select("*").then(r => r.data || []),
    supabase.from("abschluesse").select("*").then(r => r.data || []),
    supabase.from("faecher").select("*").then(r => r.data || [])
  ]);

  fillIconGrid("interessenIcons", interessen);
  fillIconGrid("abschlussIcons", abschluesse, x => x.name, false);
  fillIconGrid("faecherIcons", faecher);
}

// === Benutzer: Filter anwenden ===
document.getElementById("filterBtn").addEventListener("click", async () => {
  const interessenIds = getSelectedMultipleIds("interessenIcons");
  const abschlussId = getSelectedSingleId("abschlussIcons");
  const faecherIds = getSelectedMultipleIds("faecherIcons");

  let query = supabase.from("ausbildungsberufe").select(`
    id, berufsbezeichnung, beschreibung, verdienst, einsatzorte, anforderungen,
    abschluesse(name),
    interessen_ids, faecher_ids
  `);

  if (interessenIds.length) query = query.overlaps("interessen_ids", interessenIds);
  if (faecherIds.length) query = query.overlaps("faecher_ids", faecherIds);
  if (abschlussId) query = query.eq("abschluss_id", abschlussId);

  const { data, error } = await query;
  const out = document.getElementById("resultList");

  if (error) {
    showMessage("Fehler beim Filtern: " + error.message, "error");
    out.innerHTML = "";
    return;
  }

  out.innerHTML = data.length
    ? data.map(b => `
      <div class="result">
        <strong>${b.berufsbezeichnung}</strong><br>
        Abschluss: ${b.abschluesse?.name || '–'}<br>
        Einsatzorte: ${b.einsatzorte || '–'}
      </div>`).join("")
    : "<p>Keine passenden Berufe gefunden.</p>";
});

// === Session-Check ===
(async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    document.getElementById("startscreen").classList.remove("hidden");
    document.querySelector(".container").classList.add("hidden");
    loadFilterOptions();
  }
})();
// --- Swipe-Funktionalität für Interessen ---

// Globale Variablen für die Interest-Swipe-Session
let swipeInterests = [];
let currentInterestIndex = 0;
let likedInterests = [];
let swipeStartXInterest = null;

// Lädt die verfügbaren Interessen aus der "interessen"-Tabelle in Supabase.
// Diese Tabelle sollte Spalten wie id, name und optional icon enthalten.
async function loadSwipeInterests() {
  const { data, error } = await supabase
    .from('interessen')
    .select('id, name, icon');

  if (error) {
    showMessage("Fehler beim Laden der Interessen: " + error.message, "error");
    document.getElementById("interestSwipeCard").innerHTML = "<p>Fehler beim Laden der Interessen</p>";
    return;
  }
  swipeInterests = data;
  currentInterestIndex = 0;
  if (swipeInterests.length > 0) {
    displayCurrentInterest();
  } else {
    document.getElementById("interestSwipeCard").innerHTML = "<p>Keine Interessen verfügbar</p>";
  }
}

// Zeigt den aktuellen Interesse in der Swipe-Karte an.
function displayCurrentInterest() {
  const interest = swipeInterests[currentInterestIndex];
  const card = document.getElementById("interestSwipeCard");
  card.innerHTML = `
    <div class="interest-icon">${interest.icon ? interest.icon : ''}</div>
    <h3>${interest.name}</h3>
  `;
}

// Event-Handler: Beginn der Swipe-Geste
function handleInterestSwipeStart(evt) {
  swipeStartXInterest = evt.touches ? evt.touches[0].clientX : evt.clientX;
}

// Event-Handler: Während der Swipe-Geste folgt die Karte der Bewegung.
function handleInterestSwipeMove(evt) {
  if (swipeStartXInterest === null) return;
  const currentX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const diffX = currentX - swipeStartXInterest;
  const card = document.getElementById("interestSwipeCard");
  card.style.transform = `translateX(${diffX}px) rotate(${diffX / 20}deg)`;
}

// Event-Handler: Ende der Swipe-Geste – prüfen, ob der Swipe als gültig zählt.
function handleInterestSwipeEnd(evt) {
  if (swipeStartXInterest === null) return;
  const endX = evt.changedTouches ? evt.changedTouches[0].clientX : evt.clientX;
  const diffX = endX - swipeStartXInterest;
  const threshold = 100;
  const card = document.getElementById("interestSwipeCard");

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      // Rechts swipen: Interesse auswählen
      showMessage("Interesse gewählt: " + swipeInterests[currentInterestIndex].name, "success");
      likedInterests.push(swipeInterests[currentInterestIndex]);
    } else {
      // Links swipen: Interesse überspringen
      showMessage("Interesse übersprungen: " + swipeInterests[currentInterestIndex].name, "info");
    }
    // Animation: Karte fliegt aus dem Sichtfeld
    card.style.transition = "transform 0.3s ease-out";
    card.style.transform = `translateX(${diffX > 0 ? 500 : -500}px) rotate(${diffX / 20}deg)`;

    setTimeout(() => {
      // Zurücksetzen und nächsten Inhalt anzeigen
      card.style.transition = "";
      card.style.transform = "";
      currentInterestIndex++;
      if (currentInterestIndex < swipeInterests.length) {
        displayCurrentInterest();
      } else {
        card.innerHTML = "<p>Keine weiteren Interessen</p>";
        // Sobald alle Interessen geswiped wurden, können Jobs zugeordnet werden.
        matchJobsBasedOnInterests();
      }
    }, 300);
  } else {
    // Bei zu kurzen Bewegungen: Karte wird zurückgesetzt.
    card.style.transition = "transform 0.3s ease-out";
    card.style.transform = "";
    setTimeout(() => {
      card.style.transition = "";
    }, 300);
  }
  swipeStartXInterest = null;
}

// Füge Touch-Eventlistener hinzu (für mobile Geräte)
const interestSwipeCard = document.getElementById("interestSwipeCard");
interestSwipeCard.addEventListener("touchstart", handleInterestSwipeStart, false);
interestSwipeCard.addEventListener("touchmove", handleInterestSwipeMove, false);
interestSwipeCard.addEventListener("touchend", handleInterestSwipeEnd, false);

// Ergänzend: Unterstützung für Desktop-Geräte (Maus-Events)
interestSwipeCard.addEventListener("mousedown", handleInterestSwipeStart, false);
interestSwipeCard.addEventListener("mousemove", handleInterestSwipeMove, false);
interestSwipeCard.addEventListener("mouseup", handleInterestSwipeEnd, false);

// Ermögliche das Zurückkehren zur Filteransicht.
document.getElementById("backToFilterBtnInterests").addEventListener("click", () => {
  document.getElementById("interestSwipeContainer").classList.add("hidden");
  document.getElementById("startscreen").classList.remove("hidden");
  // Optional: likedInterests oder den aktuellen Index zurücksetzen.
});

// Funktion, um den Swipe-Bereich anzuzeigen und die Interessen zu laden.
function showInterestSwipePage() {
  document.getElementById("startscreen").classList.add("hidden");
  document.querySelector(".container").classList.add("hidden");
  document.getElementById("interestSwipeContainer").classList.remove("hidden");
  loadSwipeInterests();
}

// Funktion, die auf Basis der ausgewählten Interessen passende Jobs abruft.
// Dies ist ein Platzhalter – du kannst die Logik an deine DB-Struktur anpassen.
async function matchJobsBasedOnInterests() {
  if (likedInterests.length === 0) {
    showMessage("Keine Interessen ausgewählt, daher keine zugeordneten Jobs.", "warning");
    return;
  }
  // Erstelle ein Array der IDs der ausgewählten Interessen:
  const interestIds = likedInterests.map(interest => interest.id);
  showMessage("Deine Interessen: " + likedInterests.map(interest => interest.name).join(", "), "success");
  
  // Beispielhafte Abfrage: Hole Jobs, die mindestens eines der gewählten Interessen zugeordnet sind.
  // Passe 'jobs' und 'interesse_id' an deine Tabellenstruktur an.
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .in('interesse_id', interestIds);
  
  if (error) {
    showMessage("Fehler beim Abrufen der Jobs: " + error.message, "error");
    return;
  }
  
  if (data.length > 0) {
    // Hier könntest du dann den UI-Bereich für die Job-Ergebnisse anzeigen.
    console.log("Gefundene Jobs:", data);
    // Alternativ: showJobsResults(data);
  } else {
    showMessage("Keine Jobs gefunden, die zu deinen Interessen passen.", "info");
  }
}
