import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

const loginScreen = document.getElementById('loginScreen');
const startscreen = document.getElementById('startscreen');
const adminScreen = document.getElementById('adminScreen');
const loginError = document.getElementById('loginError');

let selectedInteressen = new Set();
let selectedAbschluesse = new Set();
let selectedFaecher = new Set();

function showScreen(screen) {
  loginScreen.style.display = 'none';
  startscreen.style.display = 'none';
  adminScreen.style.display = 'none';
  screen.style.display = 'block';
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = error.message;
  } else {
    const user = data.user;
    if (user.email === 'admin@admin.de') {
      showScreen(adminScreen);
      ladeAdminFormulare();
    } else {
      showScreen(startscreen);
      loadFilterOptions();
    }
  }
}

function logout() {
  supabase.auth.signOut();
  showScreen(loginScreen);
}

function fillIconGrid(containerId, data, labelFunc = x => x.name, multiple = true) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'icon';
    div.innerHTML = `<div>${item.icon}</div><span>${labelFunc(item)}</span>`;
    div.onclick = () => {
      const selected = div.classList.toggle('selected');
      if (!multiple) {
        container.querySelectorAll('.icon').forEach(el => {
          if (el !== div) el.classList.remove('selected');
        });
        const set = containerId === 'abschlussIcons' ? selectedAbschluesse : null;
        if (set) {
          set.clear();
          if (selected) set.add(item.id);
        }
      } else {
        let set = selectedInteressen;
        if (containerId === 'interessenIcons') set = selectedInteressen;
        else if (containerId === 'faecherIcons') set = selectedFaecher;
        else if (containerId === 'abschlussIcons') set = selectedAbschluesse;
        if (selected) set.add(item.id);
        else set.delete(item.id);
      }
    };
    container.appendChild(div);
  });
}

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

async function zeigeEmpfehlungen() {
  const resultDiv = document.getElementById('ergebnis');
  resultDiv.innerHTML = "<p>Bitte warten...</p>";

  const { data: berufe } = await supabase.from('berufe').select(`
    *,
    beruf_interessen (interesse_id),
    beruf_abschluesse (abschluss_id),
    beruf_faecher (fach_id)
  `);

  const gefiltert = berufe.filter(beruf => {
    const hasInteresse = beruf.beruf_interessen.some(bi => selectedInteressen.has(bi.interesse_id));
    const hasFach = beruf.beruf_faecher.some(bf => selectedFaecher.has(bf.fach_id));
    const hasAbschluss = beruf.beruf_abschluesse.some(ba => selectedAbschluesse.has(ba.abschluss_id));
    return hasInteresse && hasFach && hasAbschluss;
  });

  resultDiv.innerHTML = `<h3>Passende Berufe:</h3>`;
  if (gefiltert.length === 0) {
    resultDiv.innerHTML += "<p>Keine passenden Berufe gefunden.</p>";
    return;
  }

  gefiltert.forEach(b => {
    const div = document.createElement('div');
    div.className = 'result';
    div.innerHTML = `<strong>${b.name}</strong><br>${b.beschreibung || ''}`;
    resultDiv.appendChild(div);
  });
}

async function ladeAdminFormulare() {
  const { data: berufe } = await supabase.from('berufe').select('*');
  const { data: interessen } = await supabase.from('interessen').select('*');
  const { data: abschluesse } = await supabase.from('abschluesse').select('*');
  const { data: faecher } = await supabase.from('faecher').select('*');

  const container = document.getElementById('adminFormContainer');
  container.innerHTML = '';

  berufe.forEach(beruf => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${beruf.name}</h3>
      <label>Beschreibung: <input value="${beruf.beschreibung || ''}" id="desc-${beruf.id}" /></label>
    `;
    container.appendChild(div);
  });
}

// Automatisch prüfen ob eingeloggt
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    if (session.user.email === 'admin@admin.de') {
      showScreen(adminScreen);
      ladeAdminFormulare();
    } else {
      showScreen(startscreen);
      loadFilterOptions();
    }
  } else {
    showScreen(loginScreen);
  }
});
