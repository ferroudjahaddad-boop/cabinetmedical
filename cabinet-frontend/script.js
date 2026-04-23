// 1. Configuration Firebase (Format Compat V8)
const firebaseConfig = {
    apiKey: "AIzaSyCWFn0OmQ0KQKTmOWH3fhltSzQFbWmLDVs",
    authDomain: "cabinet-medical-2f436.firebaseapp.com",
    databaseURL: "https://cabinet-medical-2f436-default-rtdb.firebaseio.com",
    projectId: "cabinet-medical-2f436",
    storageBucket: "cabinet-medical-2f436.firebasestorage.app",
    messagingSenderId: "228521875984",
    appId: "1:228521875984:web:2ab074ddc959e4b6f38895",
    measurementId: "G-FDBBW23SE9"
};

// Initialisation unique
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. Fonctions d'affichage (Tabs)
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.add('active');
}

// 3. Fonction de Connexion (Login)
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) return alert("Remplissez les champs");

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("Connecté avec succès ! UID:", user.uid);

        // Récupération du rôle via le serveur Node.js
        const response = await fetch(`http://localhost:5000/get-role/${user.uid}`);
        
        if (response.status === 404) {
             alert("Profil non trouvé dans la base. Contactez l'administrateur.");
             return;
        }

        const data = await response.json();

        // Redirection selon le rôle
        if (data.role === 'admin') {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "patient_space.html";
        }
    } catch (error) {
        alert("Erreur de connexion : " + error.message);
    }
}

// 4. Fonction d'Inscription (Register)
async function register() {
    const data = {
        nom: document.getElementById('reg-nom').value,
        prenom: document.getElementById('reg-prenom').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    };

    if (!data.nom || !data.email || !data.password) return alert("Champs manquants");

    try {
        // On envoie au serveur Node.js pour création Auth + Firestore
        const res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(res.ok) {
            alert("Compte créé avec succès dans Firestore !");
            showLogin();
        } else {
            alert("Erreur serveur : " + result.error);
        }
    } catch (error) {
        alert("Erreur : Impossible de joindre le serveur Node.js");
    }
}