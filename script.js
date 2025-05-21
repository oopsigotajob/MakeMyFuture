/* ===== Supabase ===== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl  = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnon = 'eyJhbGciOiJIU-zI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIi-wicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';   // kürzen / .env
const supabase     = createClient(supabaseUrl, supabaseAnon);

/* ===== EmailJS (global) ===== */
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');      // Dashboard ▸ Integration
const EMAILJS_SERVICE  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID';

/* ===== Snackbar ===== */
function showMessage(txt, type = 'info') {
  const bar = document.getElementById('snackbar');
  bar.textContent = txt;
  bar.className   = type;
  setTimeout(() => (bar.className = ''), 3000);
}

/* ===== Registrierung ===== */
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email    = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const name     = document.getElementById('name').value.trim();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) {
    showMessage(`Registrierung fehlgeschlagen: ${error.message}`, 'error');
    return;
  }

  showMessage('Registrierung erfolgreich! Bitte E-Mail prüfen.', 'success');

  // eigene Willkommensmail
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: email,
    to_name : name || 'Jobsuchende:r'
  }).catch(console.error);
});

/* ===== Login ===== */
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(`Login fehlgeschlagen: ${error.message}`, 'error');
  } else {
    // TODO: hier deine Startseite zeigen oder weiterleiten
    showMessage('Login erfolgreich 🎉', 'success');
  }
});
