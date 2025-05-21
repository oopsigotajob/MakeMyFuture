// Supabase URL und Anon Key hier einfügen:
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("name").value;

    if (!email || !password || !name) {
        showMessage("Bitte fülle alle Felder aus.", "error");
        return;
    }

    const { user, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    });

    if (error) {
        showMessage("Registrierung fehlgeschlagen: " + error.message, "error");
    } else {
        showMessage("Registrierung erfolgreich! Bitte überprüfe deine E-Mail.", "success");
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage("Bitte E-Mail und Passwort eingeben.", "error");
        return;
    }

    const { user, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        showMessage("Login fehlgeschlagen: " + error.message, "error");
    } else {
        // Nach erfolgreichem Login weiterleiten (Startseite.html muss existieren)
        window.location.href = "startseite.html";
    }
});

function showMessage(text, type) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = text;
    snackbar.className = `show ${type}`;

    setTimeout(() => {
        snackbar.className = snackbar.className.replace(`show ${type}`, '');
    }, 3000);
}
