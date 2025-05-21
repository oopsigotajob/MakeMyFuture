const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // Ersetze mit deinem echten Key

import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js').then(({ createClient }) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Registrierung
  document.getElementById('registerBtn').addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const message = document.getElementById('message');

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      message.textContent = '❌ Fehler: ' + error.message;
      message.style.color = 'red';
    } else {
      await supabase.from('users').insert([{ name, email }]);
      message.textContent = '✅ Registrierung erfolgreich!';
      message.style.color = 'lightgreen';
    }
  });

  // Login
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      message.textContent = '❌ Login fehlgeschlagen: ' + error.message;
      message.style.color = 'red';
    } else {
      message.textContent = '✅ Willkommen ' + data.user.email;
      message.style.color = 'lightgreen';
      // window.location.href = '/startseite.html';
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    const message = document.getElementById('message');

    if (error) {
      message.textContent = '❌ Fehler beim Logout.';
      message.style.color = 'red';
    } else {
      message.textContent = '👋 Erfolgreich ausgeloggt.';
      message.style.color = 'white';
    }
  });
});
