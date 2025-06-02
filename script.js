<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

  const supabase = createClient(
    'https://vedcigedhjkarkcbqvtf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
  );

  // Snackbar anzeigen
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

  // Initialisierung nach Login (oder bei Session)
  async function initSwipeInteressen() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      curLabel.textContent = 'Bitte einloggen.';
      acceptBtn.disabled = rejectBtn.disabled = true;
      return;
    }
    currentUserId = session.user.id;

    // Interessen laden
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

  // Zeigt das nächste Interesse
  function showNextInterest() {
    if (swipeIdx >= swipeInteressen.length) {
      curIcon.textContent = '🎉';
      curLabel.textContent = 'Alle Interessen bewertet!';
      acceptBtn.style.display = 'none';
      rejectBtn.style.display = 'none';

      showTopBeruf();  // Nach dem Swipen Top-Beruf anzeigen
      return;
    }

    const cur = swipeInteressen[swipeIdx];
    curIcon.innerHTML = cur.icon || '❓';
    curLabel.textContent = cur.name;
    curIcon.dataset.id = cur.id;
  }

  // User-Entscheidung speichern
  acceptBtn.addEventListener('click', () => handleChoice('zugestimmt'));
  rejectBtn.addEventListener('click', () => handleChoice('abgelehnt'));

  async function handleChoice(status) {
    const interesseId = Number(curIcon.dataset.id);
    // Upsert: User-Interesse speichern
    const { error } = await supabase.from('user_interessen').upsert(
      { user_id: currentUserId, interessen_id: interesseId, status },
      { onConflict: ['user_id', 'interessen_id'] }
    );
    if (error) {
      showMessage('Fehler beim Speichern: ' + error.message, 'error');
      return;
    }
    swipeIdx++;
    showNextInterest();
  }

  // Nach dem Spiel: Beruf mit den meisten Übereinstimmungen anzeigen
  async function showTopBeruf() {
    const { data: matches, error } = await supabase
      .rpc('berufe_mit_interessen_match', { uid: currentUserId });

    if (error || !matches || matches.length === 0) {
      berufsergebnisse.innerHTML = `<p>Keine passenden Berufe gefunden ❌</p>`;
      return;
    }

    const topBeruf = matches[0];
    berufsergebnisse.innerHTML = `
      <h3>Top-Beruf für dich:</h3>
      <p><strong>${topBeruf.name}</strong> (${topBeruf.match_count} Übereinstimmung${topBeruf.match_count === 1 ? '' : 'en'})</p>
    `;
  }

  // Automatische Initialisierung (wenn Session besteht)
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUserId = session.user.id;
      await initSwipeInteressen();
    }
  })();

</script>
