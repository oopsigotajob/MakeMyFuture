// Supabase initialisieren
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Login
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    message.textContent = '❌ Fehler beim Login: ' + error.message;
    message.style.color = 'red';
  } else {
    message.textContent = '✅ Eingeloggt als: ' + data.user.email;
    message.style.color = 'lightgreen';
  }
}

// Registrierung
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
    message.textContent = '✅ Registrierung erfolgreich. Bestätige deine E-Mail.';
    message.style.color = 'lightgreen';

    // optional: Profil anlegen
    await supabase.from('profiles').insert([
      { id: data.user.id, full_name: '' }
    ]);
  }
}

// Logout
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
