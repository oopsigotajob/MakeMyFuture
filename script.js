import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

/* ╔════════════╗
   ║ Snackbar   ║
   ╚════════════╝ */
function showMessage(text, type = 'success') {
  const sb = document.getElementById('snackbar');
  sb.textContent = text;
  sb.className = `${type} show`;
  setTimeout(() => (sb.className = ''), 3000);
}

/* ╔═════════════════════╗
   ║ Registrierung/Login ║
   ╚═════════════════════╝ */
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email    = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const name     = document.getElementById('name').value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: window.location.href }
  });
  showMessage(
    error ? 'Registrierung fehlgeschlagen: ' + error.message
          : 'Registrierung erfolgreich! Bitte E-Mail bestätigen.',
    error ? 'error' : 'success'
  );
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMessage('Login fehlgeschlagen: ' + error.message, 'error');

  showMessage('Login erfolgreich!');
  setTimeout(async () => {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    loadFilterOptions();
    await initSwipeInteressen();              // ► Swipe-Flow starten
  }, 800);
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

/* ╔═══════════════════════════════╗
   ║ Swipe-Interessen: Variablen   ║
   ╚═══════════════════════════════╝ */
let swipeInteressen = [];      // Array mit allen Interessen
let swipeIdx        = 0;       // aktueller Index
let currentUserId   = null;    // User-ID für Speicherung

const curIcon   = document.getElementById('currentInterest');
const curLabel  = document.getElementById('currentInterestLabel');
const acceptBtn = document.getElementById('acceptBtn');
const rejectBtn = document.getElementById('rejectBtn');

/* ╔═══════════════════════════════╗
   ║ Swipe-Interessen Initialisieren ║
   ╚═══════════════════════════════╝ */
async function initSwipeInteressen() {
  // User-ID holen
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;                // nicht eingeloggt
  currentUserId = session.user.id;

  // Interessen holen
  const { data, error } = await supabase.from('interessen').select('*');
  if (error || !data?.length) {
    curLabel.textContent = 'Fehler beim Laden ❌';
    curIcon.textContent  = '⚠️';
    acceptBtn.disabled = rejectBtn.disabled = true;
    return;
  }
  swipeInteressen = data;
  swipeIdx = 0;
  showNextInterest();
}

/* ╔═══════════════════╗
   ║ Nächstes Icon     ║
   ╚═══════════════════╝ */
function showNextInterest() {
  if (swipeIdx >= swipeInteressen.length) {
    // Alle Icons gewählt
    curIcon.textContent  = '🎉';
    curLabel.textContent = 'Alle Interessen bewertet!';
    acceptBtn.style.display = rejectBtn.style.display = 'none';
    return;
  }
  const cur = swipeInteressen[swipeIdx];
  curIcon.innerHTML  = cur.icon || '❓';
  curLabel.textContent = cur.name;
  curIcon.dataset.id = cur.id;
}

/* ╔═══════════════════════╗
   ║ Like / Dislike Klicks ║
   ╚═══════════════════════╝ */
acceptBtn.addEventListener('click', () => handleChoice('zugestimmt'));
rejectBtn.addEventListener('click', () => handleChoice('abgelehnt'));

async function handleChoice(status) {
  const interesseId = Number(curIcon.dataset.id);
  // Speichern in Tabelle user_interessen (onConflict → update status)
  await supabase.from('user_interessen').upsert(
    { user_id: currentUserId, interesse_id: interesseId, status },
    { onConflict: ['user_id', 'interesse_id'] }
  );
  swipeIdx += 1;
  showNextInterest();
}

/* ─────────────────────────────────────────────────────────
   AB HIER bleibt dein bestehender Code (Admin, Filter, etc.)
   Nur minimal gekürzt, um Fokus zu zeigen. 
   ───────────────────────────────────────────────────────── */

const adminCredentials = { username: 'admin', password: 'geheim123' };
document.getElementById('gotoAdminBtn').onclick = () => {
  document.getElementById('startscreen').classList.add('hidden');
  document.getElementById('adminLoginSection').classList.remove('hidden');
};
document.getElementById('adminLoginBtn').onclick = () => {
  const u = document.getElementById('adminUser').value;
  const p = document.getElementById('adminPass').value;
  if (u === adminCredentials.username && p === adminCredentials.password) {
    document.getElementById('adminLoginSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    showMessage('Admin eingeloggt');
    loadAdminIconGrids();
  } else showMessage('Falsche Admin-Daten', 'error');
};
document.getElementById('adminLogoutBtn').onclick = () => {
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('adminLoginSection').classList.add('hidden');
  document.querySelector('.container').classList.remove('hidden');
  showMessage('Admin abgemeldet');
};

/* ------------- Icon-Grid Utilities, Admin-Panel, Filter-Logik ------------- */
/* (Belassen wie in deinem bisherigen Code – hier aus Platzgründen nicht erneut eingefügt) */

/* ╔══════════════╗
   ║ Auto-Login   ║
   ╚══════════════╝ */
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    loadFilterOptions();
    await initSwipeInteressen();
  }
})();
