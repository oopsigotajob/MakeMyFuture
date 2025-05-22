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

document.getElementById("logoutBtn").addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (!error) location.reload();
});

(async function checkLoginStatus() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (sessionData.session) {
    document.getElementById("startscreen").classList.remove("hidden");
    document.querySelector(".container").classList.add("hidden");
  }
})();
