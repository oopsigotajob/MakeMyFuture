// Vollständiger JavaScript-Code mit allen vorhandenen Funktionen und Ergänzung zur Interessenauswertung

// Supabase-Client initialisieren
const supabase = supabase.createClient('https://vedcigedhjkarkcbqvtf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'
);

// Registrierung
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Registrierung erfolgreich!');
    }
  });
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/dashboard.html';
    }
  });
}

// Adminbereich: Benutzer verwalten
async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (!error) {
    const userList = document.getElementById('user-list');
    if (userList) {
      userList.innerHTML = data.map(u => `<li>${u.email}</li>`).join('');
    }
  }
}

// Interessen Swipen
const swipeContainer = document.getElementById('swipe-container');
const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
let interests = [];
let currentIndex = 0;
let selectedInterestIds = [];

async function loadInterests() {
  const { data, error } = await supabase.from('interests').select('*');
  if (!error) {
    interests = data;
    showNextInterest();
  }
}

function showNextInterest() {
  if (currentIndex < interests.length) {
    swipeContainer.innerHTML = `<div class="interest-card">${interests[currentIndex].name}</div>`;
  } else {
    swipeContainer.innerHTML = '<p>Alle Interessen bewertet.</p>';
    document.getElementById('match-button').style.display = 'block';
  }
}

yesButton?.addEventListener('click', () => {
  selectedInterestIds.push(interests[currentIndex].id);
  currentIndex++;
  showNextInterest();
});

noButton?.addEventListener('click', () => {
  currentIndex++;
  showNextInterest();
});

// Funktion zum Abrufen der Jobs und Anzeigen des besten Matches
async function findBestMatchingJob() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, interests(id)');

  if (error) {
    console.error('Fehler beim Abrufen der Jobs:', error);
    return;
  }

  let bestMatch = null;
  let maxMatches = 0;

  jobs.forEach(job => {
    const jobInterestIds = job.interests.map(interest => interest.id);
    const matches = selectedInterestIds.filter(id => jobInterestIds.includes(id)).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = job;
    }
  });

  const resultDiv = document.getElementById('ergebnis');
  if (bestMatch) {
    resultDiv.innerHTML = `
      <h3>${bestMatch.title}</h3>
      <p>${bestMatch.description}</p>
    `;
  } else {
    resultDiv.innerHTML = '<p>Es wurde kein passender Beruf gefunden.</p>';
  }
}

document.getElementById('match-button')?.addEventListener('click', findBestMatchingJob);

// Beim Laden
if (window.location.pathname.includes('dashboard.html')) {
  loadInterests();
  fetchUsers();
}
