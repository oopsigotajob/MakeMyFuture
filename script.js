const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR...'; // gekürzt

import { createClient } from 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('registerBtn').addEventListener('click', register);
document.getElementById('loginBtn').addEventListener('click', login);

async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    message.textContent = '❌ Fehler bei Registrierung: ' + error.message;
    message.style.color = 'red';
  } else {
    await supabase.from('users').insert([{ name, email }]);
    alert("✅ Registrierung erfolgreich! Bitte bestätige deine E-Mail.");
    window.location.reload(); // zurück zur Login-Eingabe
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
