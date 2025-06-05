/* ──────────────────────────────────────────────────────────
   MakeMyFuture – Vollständiges script.js
   - Supabase-Auth (Registrierung, Login)
   - Admin-Panel zum Anlegen von Berufen + Icons
   - Swipe-Flow für Interessen (ein Icon nach dem anderen)
   - Filter-Funktion für passende Ausbildungsberufe
   ────────────────────────────────────────────────────────── */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

/* ╔════════════╗ Snackbar ╚════════════╝ */
function showMessage(text, type = 'success') {
  const sb = document.getElementById('snackbar');
  sb.textContent = text;
  sb.className = `${type} show`;
  setTimeout(() => (sb.className = ''), 2600);
}

/* ╔═════════════════════╗ Registrierung / Login ╚═════════════════════╝ */
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email    = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const name     = document.getElementById('name').value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options:{ data:{ name }, emailRedirectTo: window.location.href }
  });

  showMessage(
    error ? 'Registrierung fehlgeschlagen: ' + error.message
          : 'Registriert – bitte E-Mail bestätigen.',
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
    await initSwipeInteressen();
  }, 600);
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

/* ╔═══════════════════════════╗ Swipe-Interessen Variablen ╚═══════════════════════════╝ */
let swipeInteressen = [];
let swipeIdx        = 0;
let currentUserId   = null;

const curIcon  = document.getElementById('currentInterest');
const curLabel = document.getElementById('currentInterestLabel');
const acceptBtn = document.getElementById('acceptBtn');
const rejectBtn = document.getElementById('rejectBtn');

/* ╔═══════════════════════════╗ Swipe-Interessen Init ╚═══════════════════════════╝ */
async function initSwipeInteressen() {
  const { data:{ session } } = await supabase.auth.getSession();
  if (!session) return;
  currentUserId = session.user.id;

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

/* ╔══════════════════╗ Nächstes Icon ╚══════════════════╗ */
function showNextInterest() {
  if (swipeIdx >= swipeInteressen.length) {
    curIcon.textContent  = '🎉';
    curLabel.textContent = 'Alle Interessen bewertet!';
    acceptBtn.style.display = rejectBtn.style.display = 'none';
    return;
  }
  const cur = swipeInteressen[swipeIdx];
  curIcon.innerHTML  = cur.icon || '❓';
  curLabel.textContent = cur.name;
  curIcon.dataset.id   = cur.id;
}

/* ╔═══════════════════════╗ Like / Dislike ╚═══════════════════════╝ */
acceptBtn.addEventListener('click', () => handleChoice('zugestimmt'));
rejectBtn.addEventListener('click', () => handleChoice('abgelehnt'));

async function handleChoice(status) {  
    const interesseId = Number(curIcon.dataset.id);  
    console.log("handleChoice wurde aufgerufen! Status:", status);  

    const { error } = await supabase.from('user_interessen').insert([{  
        user_id: currentUserId,  
        interesse_id: interesseId,  
        status  
    }]);  

    if (error) {  
        console.error("Fehler beim Speichern der Interessen:", error);  
        return;  
    }  

    console.log("Interesse erfolgreich gespeichert!");  
   swipeIdx++;
console.log("Neuer Swipe-Index:", swipeIdx);

    showNextInterest();  
}


/* ╔══════════════╗ Admin-Login ╚══════════════╝ */
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

/* ╔══════════════════════╗ Icon-Grid Utilities ╚══════════════════════╝ */
function fillIconGrid(containerId, items, labelFn = x => x.name, multiple = true) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'icon';
    div.dataset.id = it.id;
    div.innerHTML = `${it.icon || '❓'}<br><span>${labelFn(it)}</span>`;
    grid.appendChild(div);
  });
  grid.addEventListener('click', e => {
    const el = e.target.closest('.icon');
    if (!el) return;
    if (multiple) {
      el.classList.toggle('selected');
    } else {
      grid.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    }
  }, { once: true });  // Listener nur einmal anhängen
}

function getSelectedMultipleIds(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .icon.selected`)).map(el => Number(el.dataset.id));
}
function getSelectedSingleId(containerId) {
  const el = document.querySelector(`#${containerId} .icon.selected`);
  return el ? Number(el.dataset.id) : null;
}

/* ╔══════════════╗ Admin-Grids laden ╚══════════════╝ */
async function loadAdminIconGrids() {
  const [abschluesse, interessen, faecher] = await Promise.all([
    supabase.from('abschluesse').select('*').then(r => r.data || []),
    supabase.from('interessen').select('*').then(r => r.data || []),
    supabase.from('faecher').select('*').then(r => r.data || [])
  ]);
  fillIconGrid('abschlussIconsAdmin', abschluesse, x => x.name, false);
  fillIconGrid('interessenIconsAdmin', interessen);
  fillIconGrid('faecherIconsAdmin', faecher);
}

/* ╔══════════════╗ Admin: Beruf speichern ╚══════════════╝ */
document.getElementById('addBerufBtn').addEventListener('click', async () => {
  const berufsbezeichnung = document.getElementById('berufsbezeichnung').value;
  const beschreibung      = document.getElementById('beschreibung').value;
  const anforderungen     = document.getElementById('anforderungen').value;
  const verdienst         = parseInt(document.getElementById('verdienst').value);
  const einsatzorte       = document.getElementById('einsatzorte').value;

  const abschluss_id   = getSelectedSingleId('abschlussIconsAdmin');
  const interessen_ids = getSelectedMultipleIds('interessenIconsAdmin');
  const faecher_ids    = getSelectedMultipleIds('faecherIconsAdmin');

  if (!beschreibung || !abschluss_id) {
    showMessage('Bitte mindestens Beschreibung und Abschluss wählen', 'error');
    return;
  }

  const { error } = await supabase.from('ausbildungsberufe').insert({
    berufsbezeichnung,
    beschreibung,
    anforderungen,
    verdienst,
    einsatzorte,
    abschluss_id,
    interessen_ids,
    faecher_ids
  });
  if (error) showMessage('Fehler: ' + error.message, 'error');
  else {
    showMessage('Beruf gespeichert');
    document.querySelectorAll('#adminPanel input, #adminPanel textarea').forEach(el => (el.value = ''));
    document.querySelectorAll('#adminPanel .icon.selected').forEach(el => el.classList.remove('selected'));
  }
});

/* ╔══════════════╗ Filter-Optionen laden ╚══════════════╝ */
async function loadFilterOptions() {
  const [interessen, abschluesse, faecher] = await Promise.all([
    supabase.from('interessen').select('*').then(r => r.data || []),
    supabase.from('abschluesse').select('*').then(r => r.data || []),
    supabase.from('faecher').select('*').then(r => r.data || [])
  ]);
  fillIconGrid('interessenIcons', interessen);
  fillIconGrid('abschlussIcons', abschluesse, x => x.name, false);
  fillIconGrid('faecherIcons', faecher);
}

/* ╔══════════════╗ Filter anwenden ╚══════════════╝ */
document.getElementById('filterBtn').addEventListener('click', async () => {
  const interessenIds = getSelectedMultipleIds('interessenIcons');
  const abschlussId   = getSelectedSingleId('abschlussIcons');
  const faecherIds    = getSelectedMultipleIds('faecherIcons');

  let query = supabase.from('ausbildungsberufe').select(`
      id, berufsbezeichnung, beschreibung, verdienst, einsatzorte, anforderungen,
      abschluesse(name), interessen_ids, faecher_ids
    `);
  if (interessenIds.length) query = query.overlaps('interessen_ids', interessenIds);
  if (faecherIds.length)     query = query.overlaps('faecher_ids', faecherIds);
  if (abschlussId)           query = query.eq('abschluss_id', abschlussId);

  const { data, error } = await query;
  const out = document.getElementById('resultList');
  if (error) {
    showMessage('Fehler beim Filtern: ' + error.message, 'error');
    out.innerHTML = '';
    return;
  }
  out.innerHTML = data.length
    ? data.map(b => `
      <div class="result">
        <strong>${b.berufsbezeichnung}</strong><br>
        Abschluss: ${b.abschluesse?.name || '–'}<br>
        Anforderungen: ${b.anforderungen || '–'}<br>
        Beschreibung: ${b.beschreibung || '–'}<br>
        Verdienst: ${b.verdienst || '–'}<br>
        Einsatzorte: ${b.einsatzorte || '–'}
      </div>`).join('')
    : '<p>Keine passenden Berufe gefunden.</p>';
});



/* ╔══════════════╗ Auto-Login ╚══════════════╝ */
(async () => {
  const { data:{ session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    loadFilterOptions();
    await initSwipeInteressen();
  }
})();

async function getBestMatchingJob() {
    const { data: userInteressen, error: userError } = await supabase
        .from('user_interessen')
        .select('interesse_id')
        .eq('user_id', currentUserId)
        .eq('status', 'zugestimmt');

    if (userError || !userInteressen.length) {
        console.error('Fehler beim Abrufen der Nutzerinteressen:', userError);
        return;
    }

    const interessenIds = userInteressen.map(i => i.interesse_id);

    const { data: jobs, error: jobsError } = await supabase
        .from('ausbildungsberufe')
        .select('id, berufsbezeichnung, beschreibung, interessen_ids');

    if (jobsError || !jobs.length) {
        console.error('Fehler beim Abrufen der Berufe:', jobsError);
        return;
    }

    let bestMatch = null;
    let maxMatches = 0;

    jobs.forEach(job => {
        const interessenIdsBeruf = JSON.parse(job.interessen_ids);
const matches = interessenIdsBeruf.filter(id => interessenIds.includes(id)).length;

        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = job;
        }
    });

    if (bestMatch) {
        document.getElementById('bestJobResult').innerHTML = `
            <strong>${bestMatch.berufsbezeichnung}</strong><br>
            ${bestMatch.beschreibung}
        `;
    } else {
        document.getElementById('bestJobResult').innerHTML = '<p>Kein passender Beruf gefunden.</p>';
    }
}

document.getElementById('showBestJobBtn').addEventListener('click', async () => {
    console.log("Button wurde geklickt!");
    await getBestMatchingJob();
});

