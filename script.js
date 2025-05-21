import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import emailjs           from 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';

/* ---------- Supabase ---------- */
const supabaseUrl     = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';          // ⛔ .env in Produktion!
const supabase        = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- EmailJS ---------- */
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');                    // aus Dashboard
const EMAILJS_SERVICE  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID';

/* ---------- Snackbar ---------- */
function showMessage(msg, type='info') {
  const bar = document.getElementById('snackbar');
  bar.textContent = msg;
  bar.className   = type;
  setTimeout(() => (bar.className = ''), 4000);
}

/* ---------- Willkommens-/Home-Ansicht ---------- */
function showHome() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('homeSection').classList.remove('hidden');
}

/* ---------- EmailJS-Willkommensmail ---------- */
async function sendWelcomeMail(toEmail, toName) {
  const params = { to_email: toEmail, to_name: toName || 'Jobsuchende:r' };
  try { await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params); }
  catch (e) { console.error('Mailversand fehlgeschlagen', e); }
}

/* ---------- Registrierung ---------- */
document
  .getElementById('registerForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const name     = document.getElementById('name').value.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}`
      }
    });

    if (error) {
      showMessage(`Registrierung fehlgeschlagen: ${error.message}`, 'error');
      return;
    }

    showMessage('Registrierung erfolgreich! Bitte Postfach prüfen ✔️', 'success');
    sendWelcomeMail(email, name);
    showHome();
  });

/* ---------- Login ---------- */
document
  .getElementById('loginBtn')
  .addEventListener('click', async () => {
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showMessage(`Login fehlgeschlagen: ${error.message}`, 'error');
    } else {
      showMessage('Login erfolgreich! 🎉', 'success');
      showHome();
    }
  });

/* ---------- Popup-Weiterleitung ---------- */
document
  .getElementById('companyPopup')
  .addEventListener('click', () => {
    window.location.href = 'firmenregistrierung.html';    // existiert separat
  });
