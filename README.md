# Students City - Application Ionic Étudiante

## Description du Projet

**Contexte:**
"Students City" est une application mobile développée avec Ionic et Angular, conçue pour aider les étudiants.

**Objectifs:**
*   Fournir une plateforme unique et facile d'accès pour les étudiants.
*   Simplifier la recherche.
*   Offrir une expérience utilisateur fluide et intuitive sur les appareils mobiles.

**Fonctionnalités Principales (actuelles ou prévues):**
*   Interface utilisateur moderne et réactive construite avec Ionic.
*   Navigation principale gérée par une barre latérale
*   Application structurée autour de composants ionic
*   Utilisation de Capacitor pour l'accès aux fonctionnalités natives 

### Prérequis
*   Node.js et npm (ou Yarn)
*   Angular CLI (`npm install -g @angular/cli`)
*   Ionic CLI (`npm install -g @ionic/cli`)

### Installation
1.  Clonez ce dépôt sur votre machine locale.
2.  Ouvrez un terminal à la racine du projet.
3.  Installez les dépendances du projet :
    ```bash
    npm install
    ```

### Configuration
*   **Configuration Angular :** Le fichier principal de configuration du projet Angular est [`angular.json`]
*   **Configuration Capacitor :** La configuration spécifique à Capacitor se trouve dans [`capacitor.config.ts`]

### Utilisation

**1. Lancer l'application en mode développement (navigateur web) :**
   Exécutez l'une des commandes suivantes à la racine du projet :
   ```bash
   ionic serve
   ```
   L'application sera accessible sur `http://localhost:8100`