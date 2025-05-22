import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

function showMessage(text, type) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = text;
  snackbar.className = `${type} show`;
  setTimeout(() => snackbar.className = '', 3000);
}

// === Registrierung ===
document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const name = document.getElementById("name").value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: window.location.href
    }
  });

  showMessage(
    error
      ? "Registrierung fehlgeschlagen: " + error.message
      : "Registrierung erfolgreich! Bitte bestätige deine E-Mail.",
    error ? "error" : "success"
  );
});

// === Login ===
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

// === Logout ===
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// === Admin Login (lokal) ===
const adminCredentials = {
  username: "admin",
  password: "geheim123"
};

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
    loadAdminOptions();
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

// === Admin-Dropdowns & Checkboxen laden ===
async function loadAdminOptions() {
  const [abschluesse, gehaltsbereiche, interessen, faecher] = await Promise.all([
    supabase.from("abschluesse").select("*").then(r => r.data || []),
    supabase.from("gehaltsbereiche").select("*").then(r => r.data || []),
    supabase.from("interessen").select("*").then(r => r.data || []),
    supabase.from("faecher").select("*").then(r => r.data || [])
  ]);

  // Dropdowns
  const abschlussSelect = document.getElementById("abschlussSelect");
  abschlussSelect.innerHTML = abschluesse.map(a =>
    `<option value="${a.id}">${a.name}</option>`).join("");

  const gehaltSelect = document.getElementById("gehaltsbereichSelect");
  gehaltSelect.innerHTML = gehaltsbereiche.map(g =>
    `<option value="${g.id}">${g.label}</option>`).join("");

  // Checkboxen
  fillCheckboxes("interessenCheckboxes", interessen);
  fillCheckboxes("faecherCheckboxes", faecher);
}

function fillCheckboxes(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  data.forEach(item => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${item.id}" />
      ${item.name}`;
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

// === Beruf speichern ===
document.getElementById("addBerufBtn").addEventListener("click", async () => {
  const beschreibung = document.getElementById("beschreibung").value;
  const anforderungen = document.getElementById("anforderungen").value;
  const verdienst = parseInt(document.getElementById("verdienst").value);
  const einsatzorte = document.getElementById("einsatzorte").value;
  const abschluss_id = parseInt(document.getElementById("abschlussSelect").value);
  const gehaltsbereich_id = parseInt(document.getElementById("gehaltsbereichSelect").value);

  const interessen_ids = Array.from(document.querySelectorAll("#interessenCheckboxes input:checked"))
    .map(cb => parseInt(cb.value));

  const faecher_ids = Array.from(document.querySelectorAll("#faecherCheckboxes input:checked"))
    .map(cb => parseInt(cb.value));

  const { error } = await supabase.from("ausbildungsberufe").insert({
    beschreibung,
    anforderungen,
    verdienst,
    einsatzorte,
    abschluss_id,
    gehaltsbereich_id,
    interessen_ids,
    faecher_ids
  });

  if (error) {
    showMessage("Fehler: " + error.message, "error");
  } else {
    showMessage("Beruf gespeichert", "success");
    document.getElementById("beschreibung").value = "";
    document.getElementById("anforderungen").value = "";
    document.getElementById("verdienst").value = "";
    document.getElementById("einsatzorte").value = "";
    document.querySelectorAll("#interessenCheckboxes input").forEach(cb => cb.checked = false);
    document.querySelectorAll("#faecherCheckboxes input").forEach(cb => cb.checked = false);
  }
});

// === Benutzer-Filter laden ===
async function loadFilterOptions() {
  const [interessen, abschluesse, gehaltsbereiche, faecher] = await Promise.all([
    supabase.from("interessen").select("*").then(r => r.data || []),
    supabase.from("abschluesse").select("*").then(r => r.data || []),
    supabase.from("gehaltsbereiche").select("*").then(r => r.data || []),
    supabase.from("faecher").select("*").then(r => r.data || [])
  ]);
  fillIconGrid("interessenIcons", interessen);
  fillIconGrid("abschlussIcons", abschluesse);
  fillIconGrid("gehaltIcons", gehaltsbereiche, g => g.label);
  fillIconGrid("faecherIcons", faecher);

  document.querySelectorAll(".icon-grid").forEach(grid => {
    grid.addEventListener("click", e => {
      const el = e.target.closest(".icon");
      if (el) el.classList.toggle("selected");
    });
  });
}

function fillIconGrid(containerId, items, labelFn = x => x.name) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  items.forEach(it => {
    const div = document.createElement("div");
    div.className = "icon";
    div.dataset.id = it.id;
    div.innerHTML = `${it.icon || "❓"}<br><span>${labelFn(it)}</span>`;
    grid.appendChild(div);
  });
}

// === Filter anwenden ===
document.getElementById("filterBtn").addEventListener("click", async () => {
  const getSelectedIds = sel => Array.from(document.querySelectorAll(`#${sel} .icon.selected`))
    .map(el => Number(el.dataset.id));

  const interessenIds = getSelectedIds("interessenIcons");
  const abschlussIds = getSelectedIds("abschlussIcons");
  const gehaltIds = getSelectedIds("gehaltIcons");
  const faecherIds = getSelectedIds("faecherIcons");

  let query = supabase.from("ausbildungsberufe")
    .select(`
      id, beschreibung, verdienst, einsatzorte, anforderungen,
      abschluesse(name), gehaltsbereiche(label),
      interessen_ids, faecher_ids
    `);

  if (interessenIds.length) query = query.overlaps("interessen_ids", interessenIds);
  if (faecherIds.length) query = query.overlaps("faecher_ids", faecherIds);
  if (abschlussIds.length) query = query.in("abschluss_id", abschlussIds);
  if (gehaltIds.length) query = query.in("gehaltsbereich_id", gehaltIds);

  const { data, error } = await query;
  if (error) {
    showMessage("Fehler beim Filtern: " + error.message, "error");
    return;
  }

  const out = document.getElementById("resultList");
  out.innerHTML = data.length
    ? data.map(b => `
        <div class="result">
          <strong>${b.beschreibung}</strong><br>
          Abschluss: ${b.abschluesse?.name || '–'}<br>
          Gehalt: ${b.verdienst} €<br>
          Einsatzorte: ${b.einsatzorte || '–'}
        </div>
      `).join("")
    : "<p>Keine passenden Berufe gefunden.</p>";
});

// === Session prüfen beim Start ===
(async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    document.getElementById("startscreen").classList.remove("hidden");
    document.querySelector(".container").classList.add("hidden");
    loadFilterOptions();
  }
})();
