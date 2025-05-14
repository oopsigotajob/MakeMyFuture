// Supabase initialisieren
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    message.textContent = 'Login fehlgeschlagen: ' + error.message;
    message.style.color = 'red';
  } else {
    message.textContent = 'Erfolgreich eingeloggt!';
    message.style.color = 'limegreen';
    console.log('User:', data.user);
  }
}
