const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. INITIALISATION FIREBASE ADMIN
// Assure-toi que le fichier serviceAccountKey.json est dans le même dossier
const serviceAccount = require("./firebaseKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// ==========================================
// ROUTES POUR LES UTILISATEURS (AUTH & RÔLES)
// ==========================================

// Inscription d'un nouveau Patient (utilisé par l'onglet S'inscrire)
app.post('/register', async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        
        // Création dans Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: `${nom} ${prenom}`
        });

        // Création du profil dans Firestore avec le rôle 'patient'
        await db.collection('users').doc(userRecord.uid).set({
            nom: nom,
            prenom: prenom,
            email: email,
            role: 'patient', // Rôle par défaut
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", uid: userRecord.uid });
    } catch (error) {
        console.error("Erreur Inscription:", error);
        res.status(500).json({ error: error.message });
    }
});

// Récupérer le rôle d'un utilisateur (utilisé lors du Login)
app.get('/get-role/:uid', async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.params.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.status(200).json(userDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ROUTES POUR LA GESTION DES PATIENTS (CRUD)
// ==========================================

// Récupérer la liste des patients (pour le dashboard admin)
app.get('/patients', async (req, res) => {
    try {
        const snapshot = await db.collection('patients').orderBy('nom').get();
        const patients = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        res.status(200).json(patients);
    } catch (error) {
        console.error("Erreur GET /patients:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ajouter un patient manuellement (par l'admin)
app.post('/patients', async (req, res) => {
    try {
        const nouveauPatient = {
            ...req.body,
            dateAjout: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('patients').add(nouveauPatient);
        res.status(201).json({ id: docRef.id, message: "Patient ajouté" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// LANCEMENT DU SERVEUR
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`
    ===========================================
    🚀 SERVEUR MÉDICAL ACTIF
    📡 Adresse : http://localhost:${PORT}
    📂 Base : Firebase Firestore
    ===========================================
    `);
});