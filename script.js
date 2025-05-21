/* ---------- Supabase initialisieren ---------- */
const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';      // ←  anpassen!
const SUPABASE_KEY = 'eyJhbGciOiJIU-zI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIi-wicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';                                 // ←  anpassen!

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- DOM-Referenzen ---------- */
const authContainer  = document.getElementById('authContainer');
const startContainer = document.getElementById('startContainer');
const snackbar       = document.getElementById('snackbar');

/* ---------- Snackbar ---------- */
function showMessage(txt, type='info') {
  snackbar.textContent = txt;
  snackbar.className   = `show ${type}`;
  setTimeout(() => snackbar.className = snackbar.className.replace(`show ${type}`, ''), 3500);
}

/* ---------- Helper fürs Umschalten ---------- */
function showStart() {
  authContainer.classList.add('hidden');
  startContainer.classList.remove('hidden');
}
function showAuth() {
  authContainer.classList.remove('hidden');
  startContainer.classList.add('hidden');
}

/* ---------- Registrierung ---------- */
document.getElementById('registerBtn').addEventListener('click', async () => {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || !password) {
    showMessage('Bitte alle Felder ausfüllen.', 'error'); return;
  }

  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  error
    ? showMessage(`Registrierung fehlgeschlagen: ${error.message}`, 'error')
    : showMessage('Registrierung erfolgreich! Prüfe deine E-Mail.', 'success');
});

/* ---------- Login ---------- */
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Bitte E-Mail und Passwort eingeben.', 'error'); return;
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(`Login fehlgeschlagen: ${error.message}`, 'error');
  } else {
    showStart();
    showMessage('Login erfolgreich – willkommen!', 'success');
  }
});

/* ---------- Logout ---------- */
document.getElementById('logoutBtn').addEventListener('click', async () => {
  const { error } = await sb.auth.signOut();
  if (!error) {
    showAuth();
    showMessage('Abgemeldet.', 'success');
  }
});

/* ---------- Session-Check beim Laden ---------- */
sb.auth.getSession().then(({ data }) => {
  if (data.session) showStart();
});
