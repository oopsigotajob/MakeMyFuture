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
    berufbezeichnung,
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
