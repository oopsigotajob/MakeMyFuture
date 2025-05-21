// Supabase-Initialisierung OHNE Module
const supabaseUrl = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIU-zI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIi-wicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // ⚠️ Achte darauf, dass der Key korrekt ist!
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Registrierung
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
    }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage("Login fehlgeschlagen: " + error.message, "error");
    } else {
        // Erfolgreicher Login → Weiterleitung zur Startseite
        window.location.href = "startseite.html";
    }
});

// Snackbar-Funktion
function showMessage(text, type) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = text;
    snackbar.className = type;
    setTimeout(() => { snackbar.className = ""; }, 4000);
}
