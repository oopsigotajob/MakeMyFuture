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
      initSwipeInteressen();
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
  show
