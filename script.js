// Initialisiere Supabase
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Zeige Session beim Laden
checkSession();

// LOGIN-Funktion
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    message.textContent = '❌ Login fehlgeschlagen: ' + error.message;
    message.style.color = 'red';
  } else {
    message.textContent = '✅ Erfolgreich eingeloggt!';
    message.style.color = 'limegreen';
    console.log('Session:', data);
  }
}

// REGISTRIERUNG-Funktion
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    message.textContent = '❌ Registrierung fehlgeschlagen: ' + error.message;
    message.style.color = 'red';
  } else {
    message.textContent = '✅ Bestätigungs-E-Mail gesendet!';
    message.style.color = 'limegreen';

    // Optional: leeres Profil anlegen
    await supabase
      .from('profiles')
      .insert([{ id: data.user.id, full_name: '' }]);
  }
}

// LOGOUT-Funktion
async function logout() {
  const { error } = await supabase.auth.signOut();
  const message = document.getElementById('message');

  if (error) {
    message.textContent = '❌ Logout fehlgeschlagen';
    message.style.color = 'red';
  } else {
    message.textContent = '👋 Erfolgreich ausgeloggt';
    message.style.color = 'white';
  }
}

// SESSION-CHECK beim Seitenaufruf
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  const message = document.getElementById('message');

  if (session) {
    message.textContent = '🎉 Eingeloggt als: ' + session.user.email;
    message.style.color = 'lightgreen';
  } else {
    message.textContent = '🔒 Nicht eingeloggt';
    message.style.color = 'gray';
  }
}
