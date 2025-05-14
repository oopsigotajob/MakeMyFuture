// Supabase initialisieren
const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';

(async () => {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Login
    async function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('message');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            message.textContent = '❌ Login-Fehler: ' + error.message;
            message.style.color = 'red';
        } else {
            message.textContent = '✅ Eingeloggt: ' + data.user.email;
            message.style.color = 'lightgreen';
        }
    }

    // Registrierung
    async function register() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('message');
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            message.textContent = '❌ Registrierungsfehler: ' + error.message;
            message.style.color = 'red';
        } else {
            message.textContent = '✅ Registrierung erfolgreich. E-Mail bestätigen!';
            message.style.color = 'lightgreen';
        }
    }

    // Logout
    async function logout() {
        const { error } = await supabase.auth.signOut();
        const message = document.getElementById('message');

        if (error) {
            message.textContent = '❌ Logout fehlgeschlagen.';
            message.style.color = 'red';
        } else {
            message.textContent = '👋 Abgemeldet.';
            message.style.color = 'white';
        }
    }

    // Event Listener hinzufügen
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('registerBtn').addEventListener('click', register);
    document.getElementById('logoutBtn').addEventListener('click', logout);
})();
