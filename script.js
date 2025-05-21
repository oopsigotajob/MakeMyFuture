import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co'; // Deine Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // Dein Supabase Schlüssel

const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("name").value;

    const { user, error } = await supabase.auth.signUp({
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

    const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        showMessage("Login fehlgeschlagen: " + error.message, "error");
    } else {
        window.location.href = "startseite.html"; // Weiterleitung nach Login
    }
});

function showMessage(text, type) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = text;
    snackbar.className = type;
    setTimeout(() => { snackbar.className = ""; }, 3000);
}
