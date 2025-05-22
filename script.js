import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

function showMessage(text, type) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = text;
  snackbar.className = `${type} show`;
  setTimeout(() => snackbar.className = '', 3000);
}

// Registrierung
document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const name = document.getElementById("name").value;

  const { error } = await supabaseClient.auth.signUp({
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

// Benutzer-Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage("Login fehlgeschlagen: " + error.message, "error");
  } else {
    showMessage("Login erfolgreich!", "success");
    setTimeout(() => {
      document.getElementById("startscreen").classList.remove("hidden");
      document.querySelector(".container").classList.add("hidden");
    }, 1000);
  }
});

// Logout für normalen Nutzer
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (!error) location.reload();
});

// Session prüfen
(async function checkLoginStatus() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (sessionData.session) {
    document.getElementById("startscreen").classList.remove("hidden");
    document.querySelector(".container").classList.add("hidden");
  }
})();

// Admin-Login-Daten (lokal, ohne Auth)
const adminCredentials = {
  username: "admin",
  password: "geheim123"
};

// Adminbereich anzeigen
document.getElementById("gotoAdminBtn").addEventListener("click", () => {
  document.querySelector(".container").classList.add("hidden");
  document.getElementById("startscreen").classList.add("hidden");
  document.getElementById("adminLoginSection").classList.remove("hidden");
});

// Admin-Login
document.getElementById("adminLoginBtn").addEventListener("click", () => {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === adminCredentials.username && pass === adminCredentials.password) {
    document.getElementById("adminLoginSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    showMessage("Admin erfolgreich eingeloggt", "success");
  } else {
    showMessage("Falsche Admin-Daten", "error");
  }
});

// Admin-Logout → zurück zum Benutzerbereich
document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  // Eingabefelder leeren
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";

  // Adminbereiche verstecken
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("adminLoginSection").classList.add("hidden");

  // Benutzerbereich zeigen
  document.querySelector(".container").classList.remove("hidden");
  document.getElementById("startscreen").classList.add("hidden");

  showMessage("Admin abgemeldet", "success");
});

// Ausbildungsberuf speichern
document.getElementById("addBerufBtn").addEventListener("click", async () => {
  const data = {
    beschreibung: document.getElementById("beschreibung").value,
    abschluss: document.getElementById("abschluss").value,
    anforderungen: document.getElementById("anforderungen").value,
    faecher: document.getElementById("faecher").value,
    verdienst: document.getElementById("verdienst").value,
    einsatzorte: document.getElementById("einsatzorte").value,
  };

  const { error } = await supabaseClient.from('ausbildungsberufe').insert([data]);

  if (error) {
    showMessage("Fehler beim Speichern", "error");
  } else {
    showMessage("Beruf erfolgreich gespeichert", "success");

    // Felder zurücksetzen
    document.getElementById("beschreibung").value = "";
    document.getElementById("abschluss").value = "";
    document.getElementById("anforderungen").value = "";
    document.getElementById("faecher").value = "";
    document.getElementById("verdienst").value = "";
    document.getElementById("einsatzorte").value = "";
  }
});
