import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* ---------- Supabase ---------- */
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- Hilfsfunktion für Nachrichten ---------- */
function showMessage(text, type) {
    const messageElement = document.getElementById("message");
    const snackbar = document.getElementById("snackbar");

    messageElement.textContent = text;
    messageElement.className = type;

    snackbar.textContent = text;
    snackbar.className = type;
    snackbar.style.visibility = "visible";

    setTimeout(() => {
        snackbar.className = "";
        snackbar.style.visibility = "hidden";
        messageElement.textContent = "";
    }, 3000);
}

/* ---------- Registrierung ---------- */
document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("name").value;

    if (password.length < 6) {
        showMessage("Passwort muss mindestens 6 Zeichen lang sein!", "error");
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name },
            emailRedirectTo: `${location.origin}/startseite.html`
        }
    });

    if (error) {
        showMessage("Registrierung fehlgeschlagen: " + error.message, "error");
    } else {
        showMessage("Registrierung erfolgreich! Bitte überprüfe deine E-Mail.", "success");
    }
});

/* ---------- Login ---------- */
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message.includes("Email not confirmed")) {
            showMessage("Bitte bestätige deine E-Mail, bevor du dich einloggst!", "error");
        } else {
            showMessage("Login fehlgeschlagen: " + error.message, "error");
        }
    } else {
        window.location.href = "startseite.html";
    }
});
