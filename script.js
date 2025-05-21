const SUPABASE_URL = 'https://vedcigedhjkarkcbqvtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGNpZ2VkaGprYXJrY2JxdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjI3NjUsImV4cCI6MjA2Mjc5ODc2NX0.Q7By1dg4FFZrA6UPWYVGHJinydzltjlpW3riruZTPXA'; // gekürzt für Übersicht

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elemente
const registerModal = document.getElementById('registerModal');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const closeModal = document.getElementById('closeModal');
const message = document.getElementById('message');

// Registrierung
async function register() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        message.textContent = '❌ ' + error.message;
        message.style.color = 'red';
    } else {
        await supabase.from('users').insert([{ name, email }]);
        message.textContent = '✅ Registrierung erfolgreich. Bitte E-Mail bestätigen.';
        message.style.color = 'green';
        registerModal.style.display = 'none';
    }
}

// Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        message.textContent = '❌ ' + error.message;
        message.style.color = 'red';
    } else {
        message.textContent = '✅ Eingeloggt. Weiterleitung...';
        message.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'startseite.html';
        }, 1500);
    }
}

// Logout
async function logout() {
    await supabase.auth.signOut();
    message.textContent = '👋 Abgemeldet.';
    message.style.color = 'white';
}

// Event-Handling
document.getElementById('registerBtn').addEventListener('click', register);
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);

showRegisterBtn.addEventListener('click', () => {
    registerModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
});
