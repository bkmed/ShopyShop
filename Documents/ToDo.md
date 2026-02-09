
update color and template to be adequate with the new domain ecommerce

rajouter pour le role gestionnaire de stock les pages manquande et leur crud (inventaire complet , reception de stocket , gestion de stock, preparation embalage et la list des entreprise provider et leur produit et leur price, remove catalogue from menu de gestionaire de stock, rajouter si un produit est 0  rajouter une alert au gestionaire de stock dynamique des que le produit est 0



ameliorer la dashboard de user comme si cest un site dachat de vetteme de zara 


ajouter navigation.* missing all lang

-----
Stock Manager Enhancements & UI Improvements
Stock Manager Features
Supplier Management
 Create 
Supplier
 interface in schema
 Create 
suppliersDb.ts
 database layer
 Create 
SupplierListScreen.tsx
 Create 
SupplierAddEditScreen.tsx
 Create 
SupplierDetailScreen.tsx
 Add supplier-product linking
 Add product pricing per supplier
Create supplier product catalog views
Inventory Management
Enhance inventory list screen (complete list view)
Create stock reception screen
Create stock movement tracking screen
Create pick & pack screen
[x] Add stock alerts for zero quantity products
Menu & Navigation
 Remove catalog from stock manager menu
 Add suppliers to stock manager menu
 Add stock reception to stock manager menu
 Add pick & pack to stock manager menu
 Update navigation structurestomization for stock manager
Admin Dashboard Enhancements
Purchase Management
 Create 
Purchase
 interface in schema
 Create 
purchasesDb.ts
 database layer
Create PurchaseListScreen.tsx for admin
Create PurchaseAddEditScreen.tsx for admin
 Link purchases to users
 Add to admin management menu
Reclamation Management
 Add reclamation list to admin menu
 Create admin reclamation management screen
 Add reclamation status management
 Add admin response functionality
User Dashboard Improvements
E-commerce UI Enhancement
 Redesign 
UserDashboardScreen.tsx
 (Zara-style)
 Add featured products section
 Add category showcase
 Add promotional banners
 Create trending items section
 Improve product card design
 Add quick action buttons
Checkout Flow Enhancement
 Payment management screens (already exist)
 Address management screens (already exist)
 Create delivery method selection screen
 Create cart review screen
 Enhance checkout process flow
 Add order confirmation screen
 [x] Generate receipt/invoice (Simulated)
Translation Fixes
Navigation Keys
 [x] Add missing navigation.* keys to en.json
 [x] Add missing navigation.* keys to fr.json
 [x] Add missing navigation.* keys to es.json
 [x] Add missing navigation.* keys to ar.json
 [x] Add missing navigation.* keys to de.json
 [x] Add missing navigation.* keys to hi.json
 [x] Add missing navigation.* keys to zh.json
Supplier Keys
 [x] Add suppliers.* keys to en.json
[x] Add suppliers.* keys to fr.json (navigation only)
 [x] Add suppliers.* keys to es.json
 [x] Add stock management (stockReception.*, pickPack.*) keys to en.json
 [x] Add stock management keys to es.json
 [x] Add admin purchase management keys to en.json and es.json
 [x] Add all feature keys to ar.json, de.json, hi.json, zh.json
Code Quality
Linting & Standards
 Run ESLint and fix errors
 Resolve language key mismatches
 Standardize code formatting
UI/UX Improvements
 Enhance overall UI aesthetics
 Improve color schemes
 Add animations and transitions
 Optimize spacing and layout
 Improve typography
------------

[x] ajouter a l'admin et a son menu (manage purchase (add, edit delete) and manage reclamations of all user) for admin dashboard, 
[x] fix eslin eroror et lang dismatch
enhance ui for user need to be more beautiful

[x] common.noResult missing all lang
rajouter a tt les formulaires add edit delete les message derreur ou les field required 
manage caterogie only admin any add or delete or update manage by admin
user can only add product to his cart or add reclamation
gestionaire de stock  preparation embalage et la list des entreprise provider et leur produit et leur price, remove catalogue from menu de gestionaire de stock


rajouter les page adequate pour passe a la caise le mange des carte bancaire le manage dadresse pour les user et le moyen de paiement  et de livraison

rajouter accueil dans les menu de chaque dashboard et clean menu for all dashboard