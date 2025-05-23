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
      // Statt der alten Filter laden, jetzt Swipe-Interessen starten:
      startSwipeInteressen();
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

// === Icon Grid Utilitys (für Admin und User) ===
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

// --- NEU: Swipe-Interessen-Auswahl und passende Jobs ---

let currentUserId = null; // Wird nach Login gesetzt

const interessenIcons = document.getElementById('faecherIcons'); // Wir benutzen faecherIcons als Swipe-Container
const resultList = document.getElementById('resultList');

let interessenListe = [];
let currentIndex = 0;

async function startSwipeInteressen() {
  // Session holen und User-ID setzen
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showMessage("Bitte erst einloggen!", "error");
    return;
  }
  currentUserId = session.user.id;

  // UI anpassen: Swipe-Bereich zeigen, Filter-Buttons ausblenden
  document.getElementById("filterBtn").style.display = 'none'; // Filterbutton ausblenden
  interessenIcons.innerHTML = ''; 
  resultList.innerHTML = '';

  await loadInteressen();
}

// Lade alle Interessen aus Supabase
async function loadInteressen() {
  const { data, error } = await supabase.from('interessen').select('*');
  if (error) {
    console.error('Fehler beim Laden der Interessen:', error);
    interessenIcons.innerHTML = '<p>Interessen konnten nicht geladen werden.</p>';
    return;
  }
  interessenListe = data;
  currentIndex = 0;
  showNextInteresse();
}

// Zeige das aktuelle Interesse als Swipe-Icon
function showNextInteresse() {
  interessenIcons.innerHTML = '';
  if (currentIndex >= interessenListe.length) {
    interessenIcons.innerHTML = '<p>Du hast alle Interessen ausgewählt!</p>';
    showPassendeJobs();
    return;
  }

  const interesse = interessenListe[currentIndex];
  const iconDiv = document.createElement('div');
  iconDiv.className = 'icon swipe-icon';
  iconDiv.style.userSelect = 'none';
  iconDiv.innerHTML = `<span>${interesse.name}</span>`; // Hier kannst du noch ein Icon ergänzen, falls vorhanden
  interessenIcons.appendChild(iconDiv);

  addSwipeListeners(iconDiv, interesse.id);
}

// Swipe-Listener für Touch-Geräte
function addSwipeListeners(element, interesseId) {
  let startX = 0;

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  element.addEventListener('touchend', async (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (deltaX > 50) {
      await saveUserInteresse(interesseId, 'zugestimmt');
      currentIndex++;
      showNextInteresse();
    } else if (deltaX < -50) {
      await saveUserInteresse(interesseId, 'abgelehnt');
      currentIndex++;
      showNextInteresse();
    }
  });
}

// Speichere Auswahl des Users in Supabase
async function saveUserInteresse(interesseId, status) {
  if (!currentUserId) {
    alert('Bitte zuerst einloggen!');
    return;
  }
  const { error } = await supabase.from('user_interessen').upsert({
    user_id: currentUserId,
    interesse_id: interesseId,
    status: status
  }, { onConflict: ['user_id', 'interesse_id'] });

  if (error) {
    console.error('Fehler beim Speichern der Auswahl:', error);
  } else {
    console.log(`Interesse ${interesseId} als ${status} gespeichert`);
  }
}

// Zeige passende Jobs basierend auf den zugestimmten Interessen an
async function showPassendeJobs() {
  const { data: userInteressen } = await supabase
    .from('user_interessen')
    .select('interesse_id')
    .eq('user_id', currentUserId)
    .eq('status', 'zugestimmt');

  if (!userInteressen || userInteressen.length === 0) {
    resultList.innerHTML = '<p>Keine Interessen gewählt.</p>';
    return;
  }

  const interesseIds = userInteressen.map(ui => ui.interesse_id);

  const { data: jobInteressen } = await supabase
    .from('job_interessen')
    .select('
