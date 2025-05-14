const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

(async () => {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Registrierung mit Name speichern
    async function register() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('message');

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            message.textContent = '❌ Registrierungsfehler: ' + error.message;
            message.style.color = 'red';
        } else {
            // Nutzerdaten in Supabase speichern
            await supabase.from('users').insert([{ name, email }]);
            message.textContent = '✅ Registrierung erfolgreich! Bitte E-Mail bestätigen.';
            message.style.color = 'lightgreen';
        }
    }

    // Login-Funktion
    async function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('message');

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            message.textContent = '❌ Login-Fehler: ' + error.message;
            message.style.color = 'red';
        } else {
            message.textContent = '✅ Eingeloggt als ' + data.user.email;
            message.style.color = 'lightgreen';
        }
    }

    // Logout-Funktion
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
    document.getElementById('registerBtn').addEventListener('click', register);
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
})();
