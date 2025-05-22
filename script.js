/* =====================================================
   MakeMyFuture Frontend – Registrierung, Admin & Filter
   ===================================================== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl   = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseKey   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';
const supabase      = createClient(supabaseUrl, supabaseKey);

/* ---------- Snackbar ---------- */
function showMessage(text, type){
  const sb=document.getElementById('snackbar');
  sb.textContent=text; sb.className=`${type} show`;
  setTimeout(()=>sb.className='',3000);
}

/* ===================================================================
   1) Registrierung & Benutzer-Login (wie gehabt, unverändert)
   =================================================================== */
document.getElementById('registerBtn').addEventListener('click', async()=>{
  const { value: email }    = document.getElementById('registerEmail');
  const { value: password } = document.getElementById('registerPassword');
  const { value: name }     = document.getElementById('name');
  const { error } = await supabase.auth.signUp({
    email, password,
    options:{ data:{name}, emailRedirectTo:location.href }
  });
  showMessage(error ? `Registrierung fehlgeschlagen: ${error.message}` :
                      'Registrierung erfolgreich! Bitte E-Mail bestätigen.',
              error?'error':'success');
});

document.getElementById('loginBtn').addEventListener('click', async()=>{
  const { value: email }    = document.getElementById('email');
  const { value: password } = document.getElementById('password');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if(error){ showMessage(`Login fehlgeschlagen: ${error.message}`,'error'); }
  else{
    showMessage('Login erfolgreich!','success');
    setTimeout(()=>{ document.getElementById('startscreen').classList.remove('hidden');
                     document.querySelector('.container').classList.add('hidden');
                     loadFilterOptions(); // ⬅️ Filter laden
                   },1000);
  }
});

document.getElementById('logoutBtn').addEventListener('click', async()=>{
  const { error } = await supabase.auth.signOut();
  if(!error) location.reload();
});

/* ===================================================================
   2) Admin-Login (lokal) & Ausbildungsberufe verwalten
   =================================================================== */
const adminCredentials={ username:'admin', password:'geheim123' };

document.getElementById('gotoAdminBtn').addEventListener('click',()=>{
  document.querySelector('.container').classList.add('hidden');
  document.getElementById('startscreen').classList.add('hidden');
  document.getElementById('adminLoginSection').classList.remove('hidden');
});

document.getElementById('adminLoginBtn').addEventListener('click', ()=>{
  const user=document.getElementById('adminUser').value;
  const pass=document.getElementById('adminPass').value;
  if(user===adminCredentials.username && pass===adminCredentials.password){
    document.getElementById('adminLoginSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    showMessage('Admin eingeloggt','success');
  }else showMessage('Falsche Admin-Daten','error');
});

document.getElementById('adminLogoutBtn').addEventListener('click',()=>{
  document.getElementById('adminUser').value='';
  document.getElementById('adminPass').value='';
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('startscreen').classList.add('hidden');
  document.querySelector('.container').classList.remove('hidden');
  showMessage('Admin abgemeldet','success');
});

/* ---------- Ausbildungsberuf speichern ---------- */
document.getElementById('addBerufBtn').addEventListener('click', async()=>{
  const beruf={
    beschreibung : document.getElementById('beschreibung').value,
    abschluss_id : null, // wird unten gesetzt
    anforderungen: document.getElementById('anforderungen').value,
    faecher_ids  : csvToIntArray(document.getElementById('faecher').value),
    verdienst    : Number(document.getElementById('verdienst').value||0),
    einsatzorte  : document.getElementById('einsatzorte').value,
    interessen_ids: csvToIntArray(document.getElementById('interessen').value),
    gehaltsbereich_id: Number(document.getElementById('gehaltsbereich').value||null)
  };
  // Schulabschluss via Name → ID nachschlagen
  const accName=document.getElementById('abschluss').value.trim();
  if(accName){
    const { data:acc } = await supabase.from('abschluesse').select('id').eq('name',accName).single();
    beruf.abschluss_id = acc ? acc.id : null;
  }
  const { error } = await supabase.from('ausbildungsberufe').insert(beruf);
  if(error) showMessage(`Fehler: ${error.message}`,'error');
  else{
    showMessage('Beruf gespeichert','success');
    // Eingabefelder leeren
    ['beschreibung','abschluss','anforderungen','faecher',
     'verdienst','einsatzorte','interessen','gehaltsbereich']
      .forEach(id=>document.getElementById(id).value='');
  }
});
function csvToIntArray(str){
  return str.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!isNaN(n));
}

/* ===================================================================
   3) Filter-UI für normale Benutzer
   =================================================================== */

/* ---------- Icons aus DB laden ---------- */
async function loadFilterOptions(){
  // jede Tabelle laden
  const [interessen, abschluesse, gehaltsbereiche, faecher] = await Promise.all([
    supabase.from('interessen').select('*').then(r=>r.data||[]),
    supabase.from('abschluesse').select('*').then(r=>r.data||[]),
    supabase.from('gehaltsbereiche').select('*').then(r=>r.data||[]),
    supabase.from('faecher').select('*').then(r=>r.data||[])
  ]);
  // Helper: Icons in Container einsetzen
  fillIconGrid('interessenIcons', interessen);
  fillIconGrid('abschlussIcons',  abschluesse);
  fillIconGrid('gehaltIcons',     gehaltsbereiche, g=>g.label);
  fillIconGrid('faecherIcons',    faecher);

  // Event-Delegation für alle Icons
  document.querySelectorAll('.icon-grid').forEach(grid=>{
    grid.addEventListener('click',e=>{
      const el=e.target.closest('.icon'); if(!el) return;
      el.classList.toggle('selected');
    });
  });
}

function fillIconGrid(containerId, items, labelFn=x=>x.name){
  const grid=document.getElementById(containerId);
  grid.innerHTML='';
  items.forEach(it=>{
    const div=document.createElement('div');
    div.className='icon';
    div.dataset.id = it.id;   // ID speichern
    div.innerHTML = `${it.icon||'❓'}<br>${labelFn(it)}`;
    grid.appendChild(div);
  });
}

/* ---------- Filter-Button ---------- */
document.getElementById('filterBtn').addEventListener('click', async()=>{
  const getSelectedIds = sel => Array.from(document.querySelectorAll(`#${sel} .icon.selected`))
                                       .map(el=>Number(el.dataset.id));

  const interessenIds = getSelectedIds('interessenIcons');
  const abschlussIds  = getSelectedIds('abschlussIcons');
  const gehaltIds     = getSelectedIds('gehaltIcons');
  const faecherIds    = getSelectedIds('faecherIcons');

  let query = supabase.from('ausbildungsberufe')
                      .select(`
                          id,beschreibung,verdienst,einsatzorte,anforderungen,
                          abschluesse(name),
                          gehaltsbereiche(label),
                          interessen_ids,faecher_ids
                      `);

  if(interessenIds.length) query = query.overlaps('interessen_ids', interessenIds);
  if(faecherIds.length)    query = query.overlaps('faecher_ids',    faecherIds);
  if(abschlussIds.length)  query = query.in('abschluss_id',         abschlussIds);
  if(gehaltIds.length)     query = query.in('gehaltsbereich_id',    gehaltIds);

  const { data, error } = await query;
  if(error){ showMessage(`Fehler beim Filtern: ${error.message}`,'error'); return; }

  renderResults(data||[]);
});

/* ---------- Ergebnisse anzeigen ---------- */
function renderResults(list){
  const out=document.getElementById('resultList');
  if(!list.length){ out.innerHTML='<p>Keine passenden Berufe gefunden.</p>'; return; }
  out.innerHTML = list.map(b=>`
      <div class="result">
        <strong>${b.beschreibung}</strong><br>
        Abschluss: ${b.abschluesse?.name||'–'}<br>
        Verdienst: ${b.verdienst ? b.verdienst+' €' : '–'}<br>
        Einsatzorte: ${b.einsatzorte||'–'}
      </div>`).join('');
}

/* ===================================================================
   4) Session-Check beim Laden der Seite
   =================================================================== */
(async()=>{
  const { data: sessionData } = await supabase.auth.getSession();
  if(sessionData.session){
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    loadFilterOptions();
  }
})();
