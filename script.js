import { createClient } from '@supabase/supabase-js';

// Supabase-Zugang
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIU-zI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIi-wicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // verkürzt
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// EmailJS konfigurieren
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY'); // z. B. W1abcD23xY
const EMAILJS_SERVICE = 'your_service_id';
const EMAILJS_TEMPLATE = 'your_template_id';

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("name").value;

    const { error } = await supabase.auth.signUp({
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

        // Automatisch Bestätigungs-E-Mail über EmailJS senden
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email: email,
            to_name: name,
        }).then(() => {
            console.log("Bestätigungs-E-Mail versendet.");
        }).catch((err) => {
            console.error("Fehler beim Senden der E-Mail:", err);
        });
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({
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
