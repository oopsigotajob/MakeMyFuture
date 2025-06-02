import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

// Snackbar-Funktion
function showMessage(text, type = 'success') {
  const sb = document.getElementById('snackbar');
  sb.textContent = text;
  sb.className = `${type} show`;
  setTimeout(() => (sb.className = ''), 3000);
}

// Variablen
let swipeInteressen = [];
let swipeIdx = 0;
let currentUserId = null;

const curIcon = document.getElementById('interessenIcons');
const curLabel = document.getElementById('interessen');
const acceptBtn = document.getElementById('acceptBtn');
const rejectBtn = document.getElementById('rejectBtn');
const berufsergebnisse = document.getElementById('berufsergebnisse');

// Registrierung & Login
document.getElementById('registerBtn').onclick = async () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const name = document.getElementById('name').value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: window.location.href }
  });
  showMessage(error ? 'Registrierung fehlgeschlagen: ' + error.message : 'Registrierung erfolgreich! Bitte E-Mail bestätigen.', error ? 'error' : 'success');
};

document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMessage('Login fehlgeschlagen: ' + error.message, 'error');

  showMessage('Login erfolgreich!');
  setTimeout(async () => {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    await loadFilterOptions();
    await initSwipeInteressen();
  }, 800);
};

document.getElementById('logoutBtn').onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// Swipe-Funktionalität
async function initSwipeInteressen() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  currentUserId = session.user.id;

  const { data, error } = await supabase.from('interessen').select('*');
  if (error || !data?.length) {
    curLabel.textContent = 'Fehler beim Laden ❌';
    curIcon.textContent = '⚠️';
    acceptBtn.disabled = rejectBtn.disabled = true;
    return;
  }

  swipeInteressen = data;
  swipeIdx = 0;
  showNextInterest();
}

function showNextInterest() {
  if (swipeIdx >= swipeInteressen.length) {
    curIcon.textContent = '🎉';
    curLabel.textContent = 'Alle Interessen bewertet!';
    acceptBtn.style.display = rejectBtn.style.display = 'none';
    showTopBeruf();
    return;
  }

  const cur = swipeInteressen[swipeIdx];
  curIcon.innerHTML = cur.icon || '❓';
  curLabel.textContent = cur.name;
  curIcon.dataset.id = cur.id;
}

acceptBtn.addEventListener('click', () => handleChoice('zugestimmt'));
rejectBtn.addEventListener('click', () => handleChoice('abgelehnt'));

async function handleChoice(status) {
  const interesseId = Number(curIcon.dataset.id);
  await supabase.from('user_interessen').upsert(
    { user_id: currentUserId, interessen_id: interesseId, status },
    { onConflict: ['user_id', 'interessen_id'] }
  );
  swipeIdx++;
  showNextInterest();
}

// Auswertung & Top-Beruf anzeigen
async function showTopBeruf() {
  const { data: matches, error } = await supabase.rpc('berufe_mit_interessen_match', { uid: currentUserId });

  if (error || !matches || matches.length === 0) {
    berufsergebnisse.innerHTML = `<p>Keine passenden Berufe gefunden ❌</p>`;
    return;
  }

  const topBeruf = matches[0];
  berufsergebnisse.innerHTML = `
    <h3>Top-Beruf für dich:</h3>
    <p><strong>${topBeruf.name}</strong> (${topBeruf.match_count} Übereinstimmungen)</p>
  `;
}

// Admin-Login (falls gewünscht)
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
  } else {
    showMessage('Falsche Admin-Daten', 'error');
  }
};
document.getElementById('adminLogoutBtn').onclick = () => {
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('adminLoginSection').classList.add('hidden');
  document.querySelector('.container').classList.remove('hidden');
  showMessage('Admin abgemeldet');
};

// Auto-Login beim Seitenladen
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    await loadFilterOptions();
    await initSwipeInteressen();
  }
})();

// Platzhalter für loadFilterOptions und loadAdminIconGrids (implementieren nach Bedarf)
async function loadFilterOptions() {
  // Falls Filteroptionen im Startscreen benötigt werden
}
function loadAdminIconGrids() {
  // Admin Bereich Logik (Icons etc.)
}
