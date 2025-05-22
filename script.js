// script.js
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA';

// Erstelle Supabase-Client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Snackbar-Funktion
function showMessage(text, type) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = text;
    snackbar.className = `${type} show`;
    setTimeout(() => {
        snackbar.className = '';
    }, 3000);
}

// Registrierung
document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("name").value;

    const { user, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });

    if (error) {
        showMessage("Registrierung fehlgeschlagen: " + error.message, "error");
    } else {
        showMessage("Registrierung erfolgreich! Bitte überprüfe deine E-Mail.", "success");
    }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { user, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        showMessage("Login fehlgeschlagen: " + error.message, "error");
    } else {
        showMessage("Login erfolgreich!", "success");
        setTimeout(() => {
            // Zeige Startbildschirm direkt ohne Redirect
            document.getElementById("startscreen").classList.remove("hidden");
            document.querySelector(".container").classList.add("hidden");
        }, 1000);
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        location.reload();
    }
});

// Session-Check beim Laden
(async function checkLoginStatus() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (sessionData.session) {
        document.getElementById("startscreen").classList.remove("hidden");
        document.querySelector(".container").classList.add("hidden");
    }
})();
