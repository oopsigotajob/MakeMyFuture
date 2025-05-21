// script.js  (ES-Module)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* ---------- Supabase ---------- */
const supabaseUrl     = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; //  ⛔  In Produktion per .env!
const supabase        = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- EmailJS ---------- */
/* 1. Kostenloses Konto anlegen ▸ https://www.emailjs.com/
   2. Im Dashboard:
      - Service  ID     →  z. B.  service_r3abc12
      - Template ID     →  z. B.  template_welcome
      - Public  Key     →  z. B.  GsH7F_Pqb3xY-
*/
const EMAILJS_PUBLIC   = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID';

emailjs.init(EMAILJS_PUBLIC);

/* ---------- Hilfsfunktionen ---------- */
function showMessage(msg, type = 'info') {
  const bar = document.getElementById('snackbar');
  bar.textContent = msg;
  bar.className   = type;                 //  CSS: .success | .error | .info
  setTimeout(() => (bar.className = ''), 4_000);
}

async function sendWelcomeMail(toEmail, toName) {
  const params = {
    to_email: toEmail,
    to_name:  toName || 'Jobsuchende:r'
  };

  try {
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params);
    console.log('Willkommens-Mail gesendet');
  } catch (err) {
    console.error('Mailversand fehlgeschlagen', err);
    // Kein showMessage, um Nutzer nicht zu verwirren
  }
}

/* ---------- Registrierung ---------- */
document.getElementById('registerForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();                         // Formular nicht neu laden

    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const name     = document.getElementById('name').value.trim();

    /* 1) Supabase: Nutzer anlegen  */
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/startseite.html`
      }
    });

    if (error) {
      showMessage(`Registrierung fehlgeschlagen: ${error.message}`, 'error');
      return;
    }

    /* 2) Snackbar anzeigen  */
    showMessage('Registrierung erfolgreich! Bitte Postfach prüfen ✔️', 'success');

    /* 3) Eigene Willkommens-Mail senden (läuft asynchron nebenbei) */
    sendWelcomeMail(email, name);
  });

/* ---------- Login ---------- */
document.getElementById('loginBtn')
  .addEventListener('click', async () => {
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showMessage(`Login fehlgeschlagen: ${error.message}`, 'error');
    } else {
      location.href = 'startseite.html';
    }
  });
