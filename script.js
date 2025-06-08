import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

function showMessage(text, type = 'success') {
  const sb = document.getElementById('snackbar');
  sb.textContent = text;
  sb.className = `${type} show`;
  setTimeout(() => (sb.className = ''), 2600);
}

/* Registrierung / Login */
...

/* Swipe */
...

/* Icon-Grids mit automatischem Filter-Update */
function fillIconGrid(containerId, items, labelFn = x => x.name, multiple = true) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'icon';
    div.dataset.id = it.id;
    div.innerHTML = `${it.icon || '❓'}<br><span>${labelFn(it)}</span>`;
    grid.appendChild(div);
  });

  grid.onclick = async (e) => {
    const el = e.target.closest('.icon');
    if (!el) return;

    const id = Number(el.dataset.id);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    if (multiple) {
      const isSelected = el.classList.toggle('selected');
      await supabase.from('user_interessen').upsert({
        user_id: userId,
        interessen_id: id,
        status: isSelected ? 'zugestimmt' : 'abgelehnt'
      }, {
        onConflict: ['user_id', 'interessen_id']
      });
    } else {
      grid.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    }

    await applyFilter();
  };
}

function getSelectedMultipleIds(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .icon.selected`)).map(el => Number(el.dataset.id));
}
function getSelectedSingleId(containerId) {
  const el = document.querySelector(`#${containerId} .icon.selected`);
  return el ? Number(el.dataset.id) : null;
}

async function applyFilter() {
  let interessenIds = getSelectedMultipleIds('interessenIcons');

  if (interessenIds.length === 0) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (userId) {
      const { data: userPrefs } = await supabase
        .from('user_interessen')
        .select('interessen_id')
        .eq('user_id', userId)
        .eq('status', 'zugestimmt');
      interessenIds = userPrefs?.map(row => row.interessen_id) || [];
    }
  }

  const abschlussId = getSelectedSingleId('abschlussIcons');
  const faecherIds = getSelectedMultipleIds('faecherIcons');

  let query = supabase.from('ausbildungsberufe').select(`
    id, berufsbezeichnung, beschreibung, verdienst, einsatzorte, anforderungen,
    abschluesse(name), interessen_ids, faecher_ids
  `);

  if (interessenIds.length) query = query.overlaps('interessen_ids', interessenIds);
  if (faecherIds.length)     query = query.overlaps('faecher_ids', faecherIds);

  if (abschlussId) {
    const { data: erlaubteAbschluesse } = await supabase
      .from('abschluesse')
      .select('id')
      .lte('id', abschlussId);
    const ids = erlaubteAbschluesse?.map(a => a.id) || [];
    query = query.in('abschluss_id', ids);
  }

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
}

/* Auto-Login */
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('startscreen').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    await loadFilterOptions();
    await markUserInteressen();
    await initSwipeInteressen();
    await applyFilter();
  }
})();
