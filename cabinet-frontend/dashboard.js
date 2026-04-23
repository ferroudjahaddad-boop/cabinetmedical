const firebaseConfig = {
    apiKey: "AIzaSyCWFn0OmQ0KQKTmOWH3fhltSzQFbWmLDVs",
    authDomain: "cabinet-medical-2f436.firebaseapp.com",
    projectId: "cabinet-medical-2f436",
    storageBucket: "cabinet-medical-2f436.appspot.com",
    messagingSenderId: "228521875984",
    appId: "1:228521875984:web:2ab074ddc959e4b6f38895"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Sécurité : redirection si non connecté
auth.onAuthStateChanged(user => {
    if (user) {
        chargerPatients();
    } else {
        window.location.replace("index.html");
    }
});

async function chargerPatients() {
    try {
        const response = await fetch("http://localhost:5000/patients");
        if (!response.ok) throw new Error("404 Not Found sur le serveur");

        const patients = await response.json();
        
        // Mise à jour du compteur
        document.getElementById("count-patients").innerText = patients.length;

        // Remplissage tableau
        const tbody = document.getElementById("corpsTableau");
        tbody.innerHTML = "";
        patients.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.nom}</strong></td>
                    <td>${p.prenom}</td>
                    <td>${p.telephone || '-'}</td>
                    <td><span class="badge">Actif</span></td>
                </tr>`;
        });
    } catch (error) {
        console.error("Erreur:", error.message);
    }
}

async function ajouterPatient() {
    const data = {
        nom: document.getElementById("p_nom").value,
        prenom: document.getElementById("p_prenom").value,
        telephone: document.getElementById("p_tel").value
    };

    if(!data.nom || !data.prenom) return alert("Remplir Nom/Prénom");

    await fetch("http://localhost:5000/patients", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    document.getElementById("p_nom").value = "";
    document.getElementById("p_prenom").value = "";
    document.getElementById("p_tel").value = "";
    chargerPatients();
}

function logout() {
    auth.signOut();
}