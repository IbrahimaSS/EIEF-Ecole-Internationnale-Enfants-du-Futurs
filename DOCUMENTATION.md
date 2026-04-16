# 🌟 EIEF - École Internationale les Enfants du Futur
## Plateforme Globale de Gestion Éducative

Bienvenue sur la documentation technique et fonctionnelle de la plateforme EIEF. Ce document est conçu pour toute personne souhaitant lancer le projet et comprendre sa structure interne.

---

## 🏛️ Introduction & Vision
L'EIEF est bien plus qu'une simple application scolaire ; c'est un écosystème numérique premium conçu pour centraliser la vie éducative de l'établissement. Il s'adresse à quatre types de publics :
*   **Parents** : Suivi de la scolarité et paiements simplifiés.
*   **Élèves** : Accès aux ressources, notes et vie scolaire.
*   **Employés/Enseignants** : Outil quotidien de gestion pédagogique.
*   **Administrateurs** : Pilotage complet de l'établissement (finance, transport, cantine, etc.).

---

## 🛠️ Stack Technique
Le projet a été bâti sur des technologies modernes pour garantir performance, évolutivité et un design haut de gamme :

| Technologie | Rôle |
| :--- | :--- |
| **Vite + React (TS)** | Cœur de l'application (Forte réactivité & typage sécurisé) |
| **Tailwind CSS** | Design system & Mode Sombre (Dark/Light) |
| **Framer Motion** | Animations fluides et transitions premium |
| **Lucide React** | Bibliothèque d'icônes vectorielles modernes |
| **Zustand** | Gestion de l'état (Authentification & Préférences) |
| **React Router** | Navigation fluide type SPA (Single Page Application) |

---

## 📂 Structure du Projet
Voici comment je me suis organisé pour garder un code propre et maintenable :

```bash
src/
├── components/         # Composants réutilisables (Boutons, Cards, Inputs)
│   ├── layout/         # Header, Footer, Sidebar, Layout Global
│   ├── shared/         # Composants partagés (ProtectedRoute, etc.)
│   └── ui/             # Éléments de design brut (Atomes)
├── pages/              # Pages principales de l'application
│   ├── admin/          # Espace Administration (Dashboard, Users, Finance...)
│   ├── eleve/          # Espace Élève
│   ├── enseignant/     # Espace Enseignant
│   ├── parent/         # Espace Parent
│   ├── auth/           # Login et Sécurité
│   └── public/         # Pages Accueil, Programmes, Admission, Contact
├── store/              # Stores Zustand (Auth, Thème)
├── utils/              # Fonctions utilitaires et constantes
└── App.tsx             # Point d'entrée des routes et de la configuration
```

---

## 🚀 Lancement Rapide (Installation)

### 1. Prérequis
Assurez-vous d'avoir **Node.js** (v18+) installé sur votre machine.

### 2. Cloner le projet
```bash
git clone [URL-DU-REPO]
cd eief-app
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Lancer en local
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000` (ou le port indiqué par Vite).

---

## ✨ Fonctionnalités Clés

### 🌗 Gestion du Thème (Dark/Light)
J'ai implémenté un système de thème intelligent. Le bouton dans la barre de navigation permet de switcher instantanément entre une interface claire et une interface sombre haut de gamme, avec persistance sur toutes les pages.

### 📜 Pages Publiques Modernes
*   **Landing Page** : Utilise un design "Split-Hero" pour une première impression impactante.
*   **Programmes** : Section interactive détaillant chaque cycle d'enseignement.
*   **Admission** : Formulaire dynamique de pré-inscription pour capturer les dossiers.
*   **Contact** : Hub de support avec informations géolocalisées et messagerie.

### 🔐 Architecture des Portails
Chaque rôle (Parent, Admin, etc.) dispose d'un `ProtectedRoute`. Le système de routage filtre les accès selon les privilèges de l'utilisateur stockés dans le store global.

---

## 🛠️ Guide de Maintenance

### Ajouter une nouvelle page
1. Créez votre composant dans `src/pages/`.
2. Déclarez la route dans `src/App.tsx`.
3. Si c'est une page privée, enveloppez-la dans le `Layout` approprié.

### Modifier le Design System
Le design centralisé se trouve dans `tailwind.config.js`. J'y ai configuré les couleurs institutionnelles (**Bleu EIEF** & **Or EIEF**) ainsi que les effets d'ombre personnalisés pour garantir une cohérence visuelle sur toute la plateforme.

---

## 🎯 Prochaines Étapes (Feuille de Route)
*   **Backend** : Connecter les formulaires d'admission à une base de données réelle.
*   **Notifications** : Pousser des notifications push sur les tableaux de bord.
*   **Finance** : Intégrer les passerelles de paiement (Orange Money, Wave, etc.).

---
*© 2026 - École Internationale les Enfants du Futur. Faisons Plus !*
