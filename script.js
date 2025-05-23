import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyzcompany.supabase.co' // ERSETZE mit deiner Supabase URL
const supabaseKey = 'public-anonymous-key'          // ERSETZE mit deinem Supabase API-Key
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUserId = null; // Wird nach Login gesetzt

const interessenIcons = document.getElementById('faecherIcons')
const resultList = document.getElementById('resultList')

let interessenListe = []
let currentIndex = 0

// Beispiel-Login (ersetze mit echtem Auth-Flow)
async function fakeLogin() {
  currentUserId = '11111111-1111-1111-1111-111111111111' // Dummy User-ID
  await loadInteressen()
}
fakeLogin()

// Lade alle Interessen aus Supabase
async function loadInteressen() {
  const { data, error } = await supabase.from('interessen').select('*')
  if (error) {
    console.error('Fehler beim Laden der Interessen:', error)
    interessenIcons.innerHTML = '<p>Interessen konnten nicht geladen werden.</p>'
    return
  }
  interessenListe = data
  currentIndex = 0
  showNextInteresse()
}

// Zeige das aktuelle Interesse als Swipe-Icon
function showNextInteresse() {
  interessenIcons.innerHTML = ''
  if (currentIndex >= interessenListe.length) {
    interessenIcons.innerHTML = '<p>Du hast alle Interessen ausgewählt!</p>'
    showPassendeJobs()
    return
  }

  const interesse = interessenListe[currentIndex]
  const iconDiv = document.createElement('div')
  iconDiv.className = 'icon swipe-icon'
  iconDiv.style.userSelect = 'none'
  iconDiv.innerHTML = `<span>${interesse.name}</span>` // Optional: Icon hier ergänzen
  interessenIcons.appendChild(iconDiv)

  addSwipeListeners(iconDiv, interesse.id)
}

// Swipe-Listener für Touch-Geräte
function addSwipeListeners(element, interesseId) {
  let startX = 0

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
  })

  element.addEventListener('touchend', async (e) => {
    const endX = e.changedTouches[0].clientX
    const deltaX = endX - startX

    if (deltaX > 50) {
      await saveUserInteresse(interesseId, 'zugestimmt')
      currentIndex++
      showNextInteresse()
    } else if (deltaX < -50) {
      await saveUserInteresse(interesseId, 'abgelehnt')
      currentIndex++
      showNextInteresse()
    }
  })
}

// Speichere Auswahl des Users in Supabase
async function saveUserInteresse(interesseId, status) {
  if (!currentUserId) {
    alert('Bitte zuerst einloggen!')
    return
  }
  const { error } = await supabase.from('user_interessen').upsert({
    user_id: currentUserId,
    interesse_id: interesseId,
    status: status
  }, { onConflict: ['user_id', 'interesse_id'] })

  if (error) {
    console.error('Fehler beim Speichern der Auswahl:', error)
  } else {
    console.log(`Interesse ${interesseId} als ${status} gespeichert`)
  }
}

// Zeige passende Jobs basierend auf den zugestimmten Interessen an
async function showPassendeJobs() {
  const { data: userInteressen } = await supabase
    .from('user_interessen')
    .select('interesse_id')
    .eq('user_id', currentUserId)
    .eq('status', 'zugestimmt')

  if (!userInteressen || userInteressen.length === 0) {
    resultList.innerHTML = '<p>Keine Interessen gewählt.</p>'
    return
  }

  const interesseIds = userInteressen.map(ui => ui.interesse_id)

  const { data: jobInteressen } = await supabase
    .from('job_interessen')
    .select('job_id, interesse_id')
    .in('interesse_id', interesseIds)

  if (!jobInteressen || jobInteressen.length === 0) {
    resultList.innerHTML = '<p>Keine passenden Jobs gefunden.</p>'
    return
  }

  const jobIds = [...new Set(jobInteressen.map(ji => ji.job_id))]

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .in('id', jobIds)

  if (!jobs || jobs.length === 0) {
    resultList.innerHTML = '<p>Keine passenden Jobs gefunden.</p>'
    return
  }

  // Sortiere Jobs nach Übereinstimmungsanzahl
  const jobsMitMatchCount = jobs.map(job => {
    const relatedInteressen = jobInteressen
      .filter(ji => ji.job_id === job.id)
      .map(ji => ji.interesse_id)
    const matchCount = relatedInteressen.filter(id => interesseIds.includes(id)).length
    return { ...job, matchCount }
  }).sort((a, b) => b.matchCount - a.matchCount)

  // Ausgabe
  resultList.innerHTML = ''
  jobsMitMatchCount.forEach(job => {
    const div = document.createElement('div')
    div.className = 'result'
    div.innerHTML = `
      <h3>${job.berufsbezeichnung}</h3>
      <p>${job.beschreibung}</p>
      <p><strong>Passende Interessen:</strong> ${job.matchCount}</p>
    `
    resultList.appendChild(div)
  })
}
