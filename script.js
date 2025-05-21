import { createClient } from './node_modules/@supabase/supabase-js/dist/supabase.js';

const supabaseUrl = 'https://dein-projekt.supabase.co';  // Hier deinen echten Supabase URL eintragen
const supabaseAnonKey = 'eyJhbGciOiJIU-zI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIi-wicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';                  // Hier den Anon-Key eintragen

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const authContainer = document.getElementById("authContainer");
const startContainer = document.getElementById("startContainer");
const snackbar = document.getElementById("snackbar");

// Registrierung
document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const name = document.getElementById("name").value;

  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    showMessage("Registrierung fehlgeschlagen: " + error.message, "error");
  } else {
    showMessage("Registrierung erfolgreich! Bitte überprüfe deine E-Mail.", "success");
  }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showMessage("Login fehlgeschlagen: " + error.message, "error");
  } else {
    showMessage("Login erfolgreich! Lade Startseite...", "success");
    showStartseite();
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showMessage("Abgemeldet.", "success");
  showAuth();
});

// Snackbar Meldung anzeigen
function showMessage(text, type) {
  snackbar.textContent = text;
  snackbar.className = type;
  snackbar.style.visibility = "visible";
  setTimeout(() => {
    snackbar.style.visibility = "hidden";
  }, 3000);
}

// Startseite anzeigen und Auth verstecken
function showStartseite() {
  authContainer.style.display = "none";
  startContainer.style.display = "block";
}

// Auth-Bereich anzeigen und Startseite verstecken
function showAuth() {
  authContainer.style.display = "block";
  startContainer.style.display = "none";
}

// Popup-Weiterleitung für Firmenregistrierung
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popupBox");
  if (popup) {
    popup.addEventListener("click", () => {
      window.location.href = "firmenregistrierung.html";
    });
  }
});

// Prüfe Session bei Seitenladezeit
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showStartseite();
  } else {
    showAuth();
  }
}

checkSession();
