# NOM DU PROJET

## Nom proposé (professionnel & original)

**ShopyShop**

> *One codebase. Every channel.*

Alternatives possibles :

* **UNIFYX Commerce**
* **NEXAMARKET**
* **COMPOSIA**
* **STACKET**

---

# 1. CONTEXTE & OBJECTIFS

## 1.1 Vision

Créer une **plateforme e‑commerce omnicanale** (Web + Mobile iOS/Android) basée sur **une seule base de code**, une **architecture unifiée**, et des **composants partagés**, afin d’offrir :

* Une expérience utilisateur cohérente
* Une maintenance simplifiée
* Une scalabilité forte
* Une mise sur le marché rapide pour les clients

## 1.2 Objectifs business

* Permettre à un client final de **trouver, acheter, payer, suivre, retourner** n’importe quel produit
* Offrir un **back‑office complet** pour la gestion du commerce
* Être prêt pour **multi‑boutiques / multi‑vendeurs / multi‑pays**

---

# 2. PÉRIMÈTRE TECHNIQUE

## 2.1 Plateformes

* Web (SSR + SPA)
* Mobile iOS
* Mobile Android

## 2.2 Stack technique imposée

* React 19
* React Native 0.82
* React Native Web
* Webpack (client + server)
* Node.js >= 20
* Architecture **monorepo**
* State management : Redux Toolkit + Zustand
* Styling : Tailwind / NativeWind
* i18n : i18next
* Analytics : Firebase
* CI/CD ready

👉 **Objectif clé : 100% des composants UI partagés** (hors navigation spécifique).

---

# 3. ARCHITECTURE GLOBALE

* Clean Architecture
* Feature‑first
* Domain‑driven design
* Aucun code dupliqué

---

# 4. FONCTIONNALITÉS – FRONT (CLIENT FINAL)

## 4.1 Catalogue

* Liste produits
* Recherche full‑text
* Filtres avancés
* Tri (prix, popularité, nouveauté)
* Variantes (taille, couleur)

## 4.2 Fiche produit

* Images HD + zoom
* Vidéo
* Avis clients
* Stock en temps réel
* Produits similaires

## 4.3 Panier

* Ajout / suppression
* Sauvegarde panier
* Multi‑devises

## 4.4 Checkout

* Adresse
* Livraison
* Paiement
* Validation

## 4.5 Paiement

* Carte bancaire
* Apple Pay / Google Pay
* Paiement à la livraison
* Historique transactions

## 4.6 Compte utilisateur

* Inscription / connexion
* Profil
* Commandes
* Retours
* Favoris

## 4.7 Notifications

* Push mobile
* Email
* In‑app

---

# 5. FONCTIONNALITÉS – BACK‑OFFICE (ADMIN)

## 5.1 Gestion produits

* CRUD produits
* Gestion stock
* Import CSV

## 5.2 Commandes

* Suivi commandes
* Changement statut
* Remboursements

## 5.3 Utilisateurs

* Clients
* Rôles
* Permissions

## 5.4 Marketing

* Coupons
* Promotions
* Bannières

## 5.5 Statistiques

* Ventes
* Conversion
* Rétention

---

# 6. RÔLES & ÉQUIPE

# 6.0 RÔLES FONCTIONNELS (UTILISATEURS DE LA PLATEFORME)

## 6.0.1 Anonyme (Visiteur non authentifié)

**Description :** Utilisateur non connecté découvrant la plateforme.

**Use cases :**

* Consulter le catalogue produits
* Rechercher des produits
* Filtrer et trier les résultats
* Consulter une fiche produit
* Ajouter un produit au panier (panier temporaire)
* Changer la langue / devise
* Créer un compte ou se connecter

---

## 6.0.2 User (Client authentifié)

**Description :** Client final disposant d’un compte.

**Use cases :**

* Tous les use cases Anonyme
* Gérer son profil (infos personnelles, adresses)
* Sauvegarder le panier
* Passer une commande
* Effectuer un paiement
* Consulter l’historique des commandes
* Suivre une commande
* Faire une demande de retour / remboursement
* Ajouter des produits aux favoris
* Recevoir des notifications (email / push)

---

## 6.0.3 Gestionnaire de stock

**Description :** Rôle opérationnel chargé de la gestion des produits et des stocks.

**Use cases :**

* Créer / modifier / supprimer un produit
* Gérer les variantes (taille, couleur, SKU)
* Mettre à jour les stocks en temps réel
* Importer / exporter des produits (CSV)
* Consulter l’état des stocks
* Être alerté en cas de stock faible
* Associer produits à catégories

---

## 6.0.4 Admin

**Description :** Administrateur de la plateforme avec droits étendus.

**Use cases :**

* Tous les droits du Gestionnaire de stock
* Gestion des utilisateurs (création, suspension, rôles)
* Gestion des commandes (changement de statut, remboursement)
* Gestion des moyens de paiement
* Gestion des livraisons
* Création de promotions / coupons
* Gestion du contenu (bannières, pages CMS)
* Accès aux statistiques globales
* Paramétrage de la plateforme (langues, devises, taxes)

---

# 6. TÂCHES DE DÉVELOPPEMENT

## Phase 1 – Fondation

* Setup monorepo
* Configuration Webpack
* Setup CI/CD

## Phase 2 – Core

* Auth
* Store
* i18n

## Phase 3 – Features

* Catalogue
* Panier
* Checkout

## Phase 4 – Admin

* Dashboard
* CRUD

## Phase 5 – Qualité

* Tests unitaires
* E2E (Cypress / Detox)

---

# 7. QUALITÉ & SÉCURITÉ

* Tests automatisés
* Sentry
* Crashlytics
* RGPD
* Sécurité paiement

---

# 8. LIVRABLES

* Code source
* Documentation
* Scripts déploiement
* Back‑office opérationnel

---

# 9. ÉVOLUTION FUTURE

* Marketplace
* Multi‑vendeurs
* IA recommandations
* PWA

---

## Conclusion

**ShopyShop** est pensé comme une **plateforme e‑commerce clé en main**, moderne, robuste et scalable, capable de répondre à 100% des besoins d’un client professionnel avec **une seule base de code Web + Mobile**.
