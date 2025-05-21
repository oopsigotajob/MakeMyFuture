const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // gekürzt

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('registerBtn').addEventListener('click', register);
document.getElementById('loginBtn').addEventListener('click', login);

// Snackbar anzeigen
function showSnackbar(text) {
  const snackbar = document.getElementById('snackbar');
  snackbar.textContent = text;
  snackbar.className = "show";
  setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 4000);
}

async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/startseite.html`
    }
  });

  if (error) {
    message.textContent = '❌ Fehler bei Registrierung: ' + error.message;
    message.style.color = 'red';
  } else {
    await supabase.from('users').insert([{ name, email }]);
    showSnackbar("✅ Registrierung erfolgreich. Bitte E-Mail bestätigen!");
    setTimeout(() => {
      window.location.reload(); // zurück zum Login-Bereich
    }, 4000);
  }
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    message.textContent = '❌ Login-Fehler: ' + error.message;
    message.style.color = 'red';
  } else {
    message.textContent = '✅ Login erfolgreich!';
    message.style.color = 'lightgreen';
    setTimeout(() => {
      window.location.href = "startseite.html";
    }, 1000);
  }
}
